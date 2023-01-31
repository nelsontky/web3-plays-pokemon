use std::cmp;

use crate::account::*;
use crate::constants::*;
use crate::errors::*;
use crate::ExecuteGameState;

use anchor_lang::prelude::*;
use anchor_spl::metadata::create_master_edition_v3;
use anchor_spl::metadata::create_metadata_accounts_v3;
use anchor_spl::metadata::verify_sized_collection_item;
use anchor_spl::metadata::CreateMasterEditionV3;
use anchor_spl::metadata::CreateMetadataAccountsV3;
use anchor_spl::metadata::Metadata;
use anchor_spl::metadata::VerifySizedCollectionItem;
use anchor_spl::token::mint_to;
use anchor_spl::token::Mint;
use anchor_spl::token::MintTo;
use anchor_spl::token::Token;
use anchor_spl::token::TokenAccount;
use mpl_token_metadata::state::Collection;
use mpl_token_metadata::state::Creator;
use mpl_token_metadata::state::DataV2;

pub fn init_game_state(
    game_state: &mut Account<GameStateV4>,
    index: u32,
    unix_timestamp: i64,
    frames_image_cid: &String,
    save_state_cid: &String,
) {
    game_state.version = 4;
    game_state.index = index;
    game_state.button_presses = Vec::new();
    game_state.created_at = unix_timestamp;
    game_state.frames_image_cid = frames_image_cid.to_string();
    game_state.save_state_cid = save_state_cid.to_string();
}

pub fn process_button_send(
    game_data: &mut Account<GameData>,
    game_state: &mut Account<GameStateV4>,
    current_participants: &mut Account<CurrentParticipants>,
    player: &Signer,
    clock: &Sysvar<Clock>,
    joypad_button: u8,
    press_count: u8,
) -> Result<()> {
    // disable turbo buttons in anarchy mode
    let is_valid_button = joypad_button < 5 || (joypad_button > 8 && joypad_button < 13);
    if !is_valid_button {
        return err!(ProgramErrorCode::InvalidButton);
    }

    let is_valid_press_count = press_count > 0 && press_count <= MAX_BUTTON_PRESS_COUNT;
    if !is_valid_press_count {
        return err!(ProgramErrorCode::InvalidButtonPressCount);
    }

    if game_data.is_executing {
        return err!(ProgramErrorCode::GameIsExecuting);
    }

    let max_presses_left = MAX_BUTTONS_PER_ROUND - game_state.button_presses.len();
    let computed_press_count = cmp::min(max_presses_left, usize::from(press_count));
    for _ in 0..computed_press_count {
        game_state.button_presses.push(joypad_button);
    }

    current_participants.participants.push(player.key());

    msg!(
        "{{ \"button\": \"{}\", \"pressCount\": {} }}",
        BUTTON_MAPPINGS[usize::from(joypad_button)],
        computed_press_count
    );

    // execute if game state is at least 10 seconds old or we have hit 10 button presses
    let should_execute = game_state.button_presses.len() >= MAX_BUTTONS_PER_ROUND
        || (clock.unix_timestamp - game_state.created_at >= VOTE_SECONDS);
    if should_execute {
        game_data.is_executing = true;

        let mut button_presses: [u8; MAX_BUTTONS_PER_ROUND] = [0; MAX_BUTTONS_PER_ROUND];
        for i in 0..game_state.button_presses.len() {
            button_presses[i] = *game_state.button_presses.get(i).unwrap();
        }

        let mut participants: [Pubkey; MAX_BUTTONS_PER_ROUND] =
            [Pubkey::default(); MAX_BUTTONS_PER_ROUND];
        for i in 0..current_participants.participants.len() {
            participants[i] = *current_participants.participants.get(i).unwrap();
        }

        emit!(ExecuteGameState {
            button_presses,
            index: game_data.executed_states_count,
            game_data_id: game_data.key(),
            participants
        });
    }

    Ok(())
}

pub fn process_mint_frames_nft<'info>(
    name: String,
    metadata_uri: String,
    token_program: &Program<'info, Token>,
    mint: &Account<'info, Mint>,
    token_account: &Account<'info, TokenAccount>,
    authority: &Signer<'info>,
    token_metadata_account: &UncheckedAccount<'info>,
    payer: &Signer<'info>,
    rent: &Sysvar<'info, Rent>,
    system_program: &Program<'info, System>,
    collection_mint: &Account<'info, Mint>,
    collection_master_edition: &UncheckedAccount<'info>,
    token_metadata_program: &Program<'info, Metadata>,
    collection_metadata: &UncheckedAccount<'info>,
    master_edition: &UncheckedAccount<'info>,
    game_data: &mut Account<'info, GameData>,
    minted_nft: &mut Account<'info, MintedNft>,
) -> Result<()> {
    // create mint and token account before minting 1 token to the user
    mint_to(
        CpiContext::new(
            token_program.to_account_info(),
            MintTo {
                mint: mint.to_account_info(),
                to: token_account.to_account_info(),
                authority: authority.to_account_info(),
            },
        ),
        1,
    )?;

    // create metadata account
    create_metadata_accounts_v3(
        CpiContext::new(
            token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: token_metadata_account.to_account_info(),
                mint: mint.to_account_info(),
                mint_authority: authority.to_account_info(),
                payer: payer.to_account_info(),
                rent: rent.to_account_info(),
                system_program: system_program.to_account_info(),
                update_authority: authority.to_account_info(),
            },
        ),
        DataV2 {
            collection: Some(Collection {
                verified: false,
                key: collection_mint.key(),
            }),
            creators: Some(vec![Creator {
                address: authority.key(),
                share: 100,
                verified: true,
            }]),
            name,
            symbol: "PKM".to_string(),
            uri: metadata_uri,
            seller_fee_basis_points: 0,
            uses: None,
        },
        true,
        true,
        None,
    )?;

    // // verify collection
    verify_sized_collection_item(
        CpiContext::new(
            token_metadata_program.to_account_info(),
            VerifySizedCollectionItem {
                collection_authority: authority.to_account_info(),
                collection_master_edition: collection_master_edition.to_account_info(),
                collection_metadata: collection_metadata.to_account_info(),
                collection_mint: collection_mint.to_account_info(),
                metadata: token_metadata_account.to_account_info(),
                payer: payer.to_account_info(),
            },
        ),
        None,
    )?;

    // create master edition account (prevents further minting)
    create_master_edition_v3(
        CpiContext::new(
            token_metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: master_edition.to_account_info(),
                metadata: token_metadata_account.to_account_info(),
                mint: mint.to_account_info(),
                mint_authority: authority.to_account_info(),
                payer: payer.to_account_info(),
                rent: rent.to_account_info(),
                system_program: system_program.to_account_info(),
                token_program: token_program.to_account_info(),
                update_authority: authority.to_account_info(),
            },
        ),
        None,
    )?;

    // add to on chain mint list
    game_data.nfts_minted = game_data.nfts_minted.checked_add(1).unwrap();
    minted_nft.mint = mint.key();

    Ok(())
}

pub fn calculate_spl_gas_amount(spl_prices: &Account<SplPrices>, number_of_lamports: u64) -> u64 {
    let mut gas_transfer_amount: u64 = 0;
    for price in spl_prices.non_human_readable_prices.iter() {
        gas_transfer_amount += price;
    }
    gas_transfer_amount = ((gas_transfer_amount
        / (spl_prices.non_human_readable_prices.len() as u64))
        + u64::from(
            gas_transfer_amount % (spl_prices.non_human_readable_prices.len() as u64) == 0, // round up
        ))
        * number_of_lamports;

    gas_transfer_amount
}
