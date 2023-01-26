use crate::account::*;
use crate::constants::*;
use crate::utils::*;

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::{
    create_master_edition_v3, create_metadata_accounts_v3, verify_sized_collection_item,
    CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata, VerifySizedCollectionItem,
};
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};
use mpl_token_metadata::state::{Collection, Creator, DataV2};
use std::cmp;

pub mod account;
pub mod constants;
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
// declare_id!("pkmNUoVrc8m4DkvQkKDHrffDEPJwVhuXqQv3hegbVyg");

// Devnet
declare_id!("pkmJNXmUxFT1bmmCp4DgvCm2LxR3afRtCwV1EzQwEHK");

#[program]
pub mod solana_plays_pokemon_program {
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
        // disable turbo buttons in anarchy mode
        let is_valid_button = joypad_button < 5 || (joypad_button > 8 && joypad_button < 13);
        if !is_valid_button {
            return err!(ErrorCode::InvalidButton);
        }

        let is_valid_press_count = press_count > 0 && press_count <= MAX_BUTTON_PRESS_COUNT;
        if !is_valid_press_count {
            return err!(ErrorCode::InvalidButtonPressCount);
        }

        let game_data = &mut ctx.accounts.game_data;
        if game_data.is_executing {
            return err!(ErrorCode::GameIsExecuting);
        }

        let game_state = &mut ctx.accounts.game_state;
        let max_presses_left = MAX_BUTTONS_PER_ROUND - game_state.button_presses.len();
        let computed_press_count = cmp::min(max_presses_left, usize::from(press_count));
        for _ in 0..computed_press_count {
            game_state.button_presses.push(joypad_button);
        }

        let current_participants = &mut ctx.accounts.current_participants;
        current_participants
            .participants
            .push(ctx.accounts.player.key());

        msg!(
            "{{ \"button\": \"{}\", \"pressCount\": {} }}",
            BUTTON_MAPPINGS[usize::from(joypad_button)],
            computed_press_count
        );

        // execute if game state is at least 10 seconds old or we have hit 10 button presses
        let should_execute = game_state.button_presses.len() >= MAX_BUTTONS_PER_ROUND
            || (ctx.accounts.clock.unix_timestamp - game_state.created_at >= VOTE_SECONDS);
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
                game_data_id: ctx.accounts.game_data.key(),
                participants
            });
        }

        Ok(())
    }

    pub fn update_game_state(
        ctx: Context<UpdateGameState>,
        frames_image_cid: String,
        save_state_cid: String,
    ) -> Result<()> {
        let game_data = &mut ctx.accounts.game_data;
        if !game_data.is_executing {
            return err!(ErrorCode::NoUpdatesIfNotExecuting);
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

    pub fn migrate_game_state_to_v4(
        ctx: Context<MigrateGameStateToV4>,
        frames_image_cid: String,
        save_state_cid: String,
    ) -> Result<()> {
        let game_data = &mut ctx.accounts.game_data;
        game_data.is_executing = false;
        game_data.executed_states_count = game_data.executed_states_count.checked_add(2).unwrap();

        let game_state = &mut ctx.accounts.game_state;
        game_state.frames_image_cid = frames_image_cid.to_string();
        game_state.save_state_cid = save_state_cid.to_string();
        game_state.executed_button = 0;

        let next_game_state = &mut ctx.accounts.next_game_state;
        init_game_state(
            next_game_state,
            game_data.executed_states_count.checked_sub(1).unwrap(),
            ctx.accounts.clock.unix_timestamp,
            &frames_image_cid,
            &save_state_cid,
        );
        next_game_state.button_presses = vec![0];

        let next_next_game_state = &mut ctx.accounts.next_next_game_state;
        init_game_state(
            next_next_game_state,
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
}

#[derive(Accounts)]
#[instruction(frames_image_cid: String, save_state_cid: String)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + GameData::LEN)]
    pub game_data: Account<'info, GameData>,
    #[account(
        init,
        payer = authority,
        space = 8 + GameStateV4::BASE_LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        seeds = [game_data.key().as_ref(), b"game_state", b"0"], // seeds comprise of game_data key, a static text, and the index
        bump
    )]
    pub game_state: Account<'info, GameStateV4>,
    #[account(
        init,
        payer = authority,
        space = 8 + GameStateV4::BASE_LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        seeds = [game_data.key().as_ref(), b"game_state", b"1"], // seeds comprise of game_data key, a static text, and the index
        bump
    )]
    pub next_game_state: Account<'info, GameStateV4>,
    #[account(
        init,
        payer = authority,
        seeds = [
            b"current_participants",
            game_data.key().as_ref(),
        ],
        space = 8 + CurrentParticipants::LEN,
        bump
    )]
    pub current_participants: Account<'info, CurrentParticipants>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct SendButton<'info> {
    #[account(
        mut,
        seeds = [
                game_data.key().as_ref(),
                b"game_state", 
                game_data.executed_states_count.to_string().as_ref()
            ],
        bump
    )]
    pub game_state: Account<'info, GameStateV4>,
    #[account(mut)]
    pub game_data: Account<'info, GameData>,
    #[account(
        mut,
        seeds = [
            b"current_participants",
            game_data.key().as_ref(),
        ],
        bump
    )]
    pub current_participants: Account<'info, CurrentParticipants>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
#[instruction(
    frames_image_cid: String,
    save_state_cid: String,
)]
pub struct UpdateGameState<'info> {
    #[account(
        mut,
        seeds = [
            game_data.key().as_ref(),
            b"game_state",
            (game_data.executed_states_count).to_string().as_ref()
        ],
        bump,
        realloc = 8 + GameStateV4::BASE_LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        realloc::payer = authority,
        realloc::zero = true,
    )]
    pub game_state: Account<'info, GameStateV4>,
    #[account(
        init,
        payer = authority,
        space = 8 + GameStateV4::BASE_LEN + 4 + 59 + 4 + 59, // nft.storage cids are 59 characters long by default
        seeds = [
                game_data.key().as_ref(),
                b"game_state", 
                (game_data.executed_states_count.checked_add(1).unwrap()).to_string().as_ref()
            ],
        bump
    )]
    pub next_game_state: Account<'info, GameStateV4>,
    #[account(mut, has_one = authority)]
    pub game_data: Account<'info, GameData>,
    #[account(
        mut,
        seeds = [
            b"current_participants",
            game_data.key().as_ref(),
        ],
        bump
    )]
    pub current_participants: Account<'info, CurrentParticipants>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
#[instruction(
    frames_image_cid: String,
    save_state_cid: String,
)]
pub struct MigrateGameStateToV4<'info> {
    #[account(
        mut,
        seeds = [
            game_data.key().as_ref(),
            b"game_state",
            (game_data.executed_states_count).to_string().as_ref()
        ],
        bump,
        realloc = 8 + GameStateV3::BASE_LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        realloc::payer = authority,
        realloc::zero = true,
    )]
    pub game_state: Account<'info, GameStateV3>,
    #[account(
        init,
        payer = authority,
        space = 8 + GameStateV4::BASE_LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        seeds = [
                game_data.key().as_ref(),
                b"game_state", 
                (game_data.executed_states_count.checked_add(1).unwrap()).to_string().as_ref()
            ],
        bump
    )]
    pub next_game_state: Account<'info, GameStateV4>,
    #[account(
        init,
        payer = authority,
        space = 8 + GameStateV4::BASE_LEN + 4 + 59 + 4 + 59, // nft.storage cids are 59 characters long by default
        seeds = [
                game_data.key().as_ref(),
                b"game_state", 
                (game_data.executed_states_count.checked_add(2).unwrap()).to_string().as_ref()
            ],
        bump
    )]
    pub next_next_game_state: Account<'info, GameStateV4>,
    #[account(mut, has_one = authority)]
    pub game_data: Account<'info, GameData>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct InitializeCurrentParticipants<'info> {
    #[account(
        init,
        payer = authority,
        seeds = [
            b"current_participants",
            game_data.key().as_ref(),
        ],
        space = 8 + CurrentParticipants::LEN,
        bump
    )]
    pub current_participants: Account<'info, CurrentParticipants>,
    #[account(mut, has_one = authority)]
    pub game_data: Account<'info, GameData>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    game_state_index: u32
)]
pub struct MintFramesNft<'info> {
    #[account(
        init,
        seeds = [
            b"nft_mint",
            game_data.key().as_ref(),
            user.key().as_ref(),
            game_state_index.to_string().as_ref()
        ],
        bump,
        payer = user,
        mint::decimals = 0,
        mint::authority = authority,
        mint::freeze_authority = authority
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority)]
    pub game_data: Account<'info, GameData>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,

    #[account(
        init,
        payer = user,
        seeds = [
            b"minted_nft",
            game_data.key().as_ref(),
            game_data.nfts_minted.to_string().as_ref()
        ],
        bump,
        space = 8 + MintedNft::LEN
    )]
    pub minted_nft: Account<'info, MintedNft>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,

    #[account(
        mut,
        seeds = [
            b"metadata",
            token_metadata_program.key().as_ref(),
            mint.key().as_ref()
        ],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    /// CHECK: token metadata pda is checked
    pub token_metadata_account: UncheckedAccount<'info>,
    pub token_metadata_program: Program<'info, Metadata>,

    pub collection_mint: Account<'info, Mint>,
    #[account(
        mut,
        seeds = [
            b"metadata",
            token_metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
        ],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    /// CHECK: token metadata pda is checked
    pub collection_metadata: UncheckedAccount<'info>,
    #[account(
        seeds = [
            b"metadata",
            token_metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
            b"edition",
        ],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    /// CHECK: token metadata pda is checked
    pub collection_master_edition: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            b"metadata",
            token_metadata_program.key().as_ref(),
            mint.key().as_ref(),
            b"edition",
        ],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    /// CHECK: token metadata pda is checked
    pub master_edition: UncheckedAccount<'info>,
}

#[event]
pub struct ExecuteGameState {
    pub button_presses: [u8; MAX_BUTTONS_PER_ROUND],
    pub index: u32,
    pub game_data_id: Pubkey,
    pub participants: [Pubkey; MAX_BUTTONS_PER_ROUND],
}

#[error_code]
pub enum ErrorCode {
    #[msg("Button presses are not allowed when the game is executing.")]
    GameIsExecuting,
    #[msg("Game state cannot be updated when the game is not executing.")]
    NoUpdatesIfNotExecuting,
    #[msg("Invalid button sent.")]
    InvalidButton,
    #[msg("Invalid button press count.")]
    InvalidButtonPressCount,
}
