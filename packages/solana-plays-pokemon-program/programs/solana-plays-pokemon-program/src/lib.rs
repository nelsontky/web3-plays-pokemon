use crate::account::*;
use crate::constants::*;
use crate::context::*;
use crate::errors::*;
use crate::utils::*;

use anchor_lang::prelude::*;
use anchor_spl::metadata::{
    create_master_edition_v3, create_metadata_accounts_v3, verify_sized_collection_item,
    CreateMasterEditionV3, CreateMetadataAccountsV3, VerifySizedCollectionItem,
};
use anchor_spl::token::{mint_to, transfer, MintTo};
use mpl_token_metadata::state::{Collection, Creator, DataV2};

pub mod account;
pub mod constants;
pub mod context;
pub mod errors;
pub mod utils;

// Button mappings:
// 0 = DO NOTHING
// 1 = UP
// 2 = DOWN
// 3 = LEFT
// 4 = RIGHT
// 5 = TURBO UP
// 6 = TURBO DOWN
// 7 = TURBO LEFT
// 8 = TURBO RIGHT
// 9 = A
// 10 = B
// 11 = START
// 12 = SELECT
// 13 = Turbo A
// 14 = Turbo B

// Mainnet
declare_id!("pkmNUoVrc8m4DkvQkKDHrffDEPJwVhuXqQv3hegbVyg");

// Devnet
// declare_id!("pkmWfprVCX2o7Kg6vPcvUXd4bgUHJSbs7qzJH9iqY3R");

#[program]
pub mod solana_plays_pokemon_program {
    use anchor_spl::token::Transfer;

    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        frames_image_cid: String,
        save_state_cid: String,
    ) -> Result<()> {
        let game_data = &mut ctx.accounts.game_data;
        game_data.executed_states_count = 1;
        game_data.authority = *ctx.accounts.authority.key;
        game_data.nfts_minted = 0;

        msg!("Game data account initialized");

        let game_state = &mut ctx.accounts.game_state;
        init_game_state(
            game_state,
            0,
            ctx.accounts.clock.unix_timestamp,
            &frames_image_cid,
            &save_state_cid,
        );
        msg!("First game state account initialized");

        // init next game state
        let next_game_state = &mut ctx.accounts.next_game_state;
        init_game_state(
            next_game_state,
            game_data.executed_states_count,
            ctx.accounts.clock.unix_timestamp,
            &String::from(""),
            &String::from(""),
        );
        msg!("Second game state account initialized");

        // init current_participants
        let current_participants = &mut ctx.accounts.current_participants;
        current_participants.participants = Vec::new();

        Ok(())
    }

    pub fn send_button(ctx: Context<SendButton>, joypad_button: u8, press_count: u8) -> Result<()> {
        process_button_send(
            &mut ctx.accounts.game_data,
            &mut ctx.accounts.game_state,
            &mut ctx.accounts.current_participants,
            &ctx.accounts.player,
            &ctx.accounts.clock,
            joypad_button,
            press_count,
            false,
        )
    }

    pub fn send_button_spl_gas(
        ctx: Context<SendButtonSplGas>,
        joypad_button: u8,
        press_count: u8,
    ) -> Result<()> {
        // transfer gas fee
        let spl_prices = &ctx.accounts.spl_prices;
        let mut gas_transfer_amount: u64 = 0;
        for price in spl_prices.non_human_readable_prices.iter() {
            gas_transfer_amount += price;
        }
        gas_transfer_amount = ((gas_transfer_amount
            / (spl_prices.non_human_readable_prices.len() as u64))
            + u64::from(
                gas_transfer_amount % (spl_prices.non_human_readable_prices.len() as u64) == 0, // round up
            ))
            * SEND_BUTTON_SPL_GAS_TRANSACTION_FEE_LAMPORTS;

        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    authority: ctx.accounts.player.to_account_info(),
                    from: ctx.accounts.gas_source_token_account.to_account_info(),
                    to: ctx.accounts.gas_deposit_token_account.to_account_info(),
                },
            ),
            gas_transfer_amount,
        )?;

        process_button_send(
            &mut ctx.accounts.game_data,
            &mut ctx.accounts.game_state,
            &mut ctx.accounts.current_participants,
            &ctx.accounts.player,
            &ctx.accounts.clock,
            joypad_button,
            press_count,
            true,
        )
    }

    pub fn update_game_state(
        ctx: Context<UpdateGameState>,
        frames_image_cid: String,
        save_state_cid: String,
    ) -> Result<()> {
        let game_data = &mut ctx.accounts.game_data;
        if !game_data.is_executing {
            return err!(ProgramErrorCode::NoUpdatesIfNotExecuting);
        }

        game_data.is_executing = false;
        game_data.executed_states_count = game_data.executed_states_count.checked_add(1).unwrap();

        let current_participants = &mut ctx.accounts.current_participants;
        current_participants.participants = Vec::new();

        let game_state = &mut ctx.accounts.game_state;
        game_state.frames_image_cid = frames_image_cid;
        game_state.save_state_cid = save_state_cid;

        // init next game state
        let next_game_state = &mut ctx.accounts.next_game_state;
        init_game_state(
            next_game_state,
            game_data.executed_states_count,
            ctx.accounts.clock.unix_timestamp,
            &String::from(""),
            &String::from(""),
        );

        Ok(())
    }

    pub fn initialize_current_participants(
        ctx: Context<InitializeCurrentParticipants>,
    ) -> Result<()> {
        let current_participants = &mut ctx.accounts.current_participants;
        current_participants.participants = Vec::new();

        Ok(())
    }

    pub fn mint_frames_nft(
        ctx: Context<MintFramesNft>,
        _game_state_index: u32,
        name: String,
        metadata_uri: String,
    ) -> Result<()> {
        // create mint and token account before minting 1 token to the user
        mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            1,
        )?;

        // create metadata account
        create_metadata_accounts_v3(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.token_metadata_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    mint_authority: ctx.accounts.authority.to_account_info(),
                    payer: ctx.accounts.user.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    update_authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            DataV2 {
                collection: Some(Collection {
                    verified: false,
                    key: ctx.accounts.collection_mint.key(),
                }),
                creators: Some(vec![Creator {
                    address: ctx.accounts.authority.key(),
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

        // verify collection
        verify_sized_collection_item(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                VerifySizedCollectionItem {
                    collection_authority: ctx.accounts.authority.to_account_info(),
                    collection_master_edition: ctx
                        .accounts
                        .collection_master_edition
                        .to_account_info(),
                    collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
                    collection_mint: ctx.accounts.collection_mint.to_account_info(),
                    metadata: ctx.accounts.token_metadata_account.to_account_info(),
                    payer: ctx.accounts.user.to_account_info(),
                },
            ),
            None,
        )?;

        // create master edition account (prevents further minting)
        create_master_edition_v3(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMasterEditionV3 {
                    edition: ctx.accounts.master_edition.to_account_info(),
                    metadata: ctx.accounts.token_metadata_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    mint_authority: ctx.accounts.authority.to_account_info(),
                    payer: ctx.accounts.user.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                    update_authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            None,
        )?;

        // add to on chain mint list
        let game_data = &mut ctx.accounts.game_data;
        game_data.nfts_minted = game_data.nfts_minted.checked_add(1).unwrap();
        let minted_nft = &mut ctx.accounts.minted_nft;
        minted_nft.mint = ctx.accounts.mint.key();

        Ok(())
    }

    pub fn initialize_spl_prices(
        ctx: Context<InitializePrices>,
        _gas_mint: Pubkey,
        amount_for_one_lamport: u64,
    ) -> Result<()> {
        let spl_prices = &mut ctx.accounts.spl_prices;
        spl_prices
            .non_human_readable_prices
            .push(amount_for_one_lamport);
        Ok(())
    }

    pub fn update_spl_prices(
        ctx: Context<UpdatePrices>,
        _gas_mint: Pubkey,
        amount_for_one_lamport: u64,
    ) -> Result<()> {
        let spl_prices = &mut ctx.accounts.spl_prices;
        if spl_prices.non_human_readable_prices.len() >= SplPrices::NUMBER_OF_PRICES {
            spl_prices.non_human_readable_prices.remove(0);
        }
        spl_prices
            .non_human_readable_prices
            .push(amount_for_one_lamport);
        Ok(())
    }
}

#[event]
pub struct ExecuteGameState {
    pub button_presses: [u8; MAX_BUTTONS_PER_ROUND],
    pub index: u32,
    pub game_data_id: Pubkey,
    pub participants: [Pubkey; MAX_BUTTONS_PER_ROUND],
}
