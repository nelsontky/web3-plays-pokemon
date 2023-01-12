use crate::account::*;
use crate::constants::*;
use crate::utils::*;

use anchor_lang::prelude::*;

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

        Ok(())
    }

    pub fn send_button(ctx: Context<SendButton>, joypad_button: u8) -> Result<()> {
        // disable turbo buttons in anarchy mode
        let is_valid_button = joypad_button < 5 || (joypad_button > 8 && joypad_button < 13);
        if !is_valid_button {
            return err!(ErrorCode::InvalidButton);
        }

        let game_data = &mut ctx.accounts.game_data;
        if game_data.is_executing {
            return err!(ErrorCode::GameIsExecuting);
        }

        let game_state = &mut ctx.accounts.game_state;
        game_state.button_presses.push(joypad_button);

        // execute if game state is at least 10 seconds old or we have hit 10 button presses
        let should_execute = game_state.button_presses.len() >= 10
            || (ctx.accounts.clock.unix_timestamp - game_state.created_at >= VOTE_SECONDS);
        if should_execute {
            game_data.is_executing = true;

            let mut button_presses: [u8; MAX_BUTTONS_PER_ROUND] = [0; MAX_BUTTONS_PER_ROUND];
            for i in 0..game_state.button_presses.len() {
                button_presses[i] = *game_state.button_presses.get(i).unwrap();
            }
            emit!(ExecuteGameState {
                button_presses,
                index: game_data.executed_states_count,
                game_data_id: ctx.accounts.game_data.key()
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

#[event]
pub struct ExecuteGameState {
    pub button_presses: [u8; MAX_BUTTONS_PER_ROUND],
    pub index: u32,
    pub game_data_id: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Button presses are not allowed when the game is executing.")]
    GameIsExecuting,
    #[msg("Game state cannot be updated when the game is not executing.")]
    NoUpdatesIfNotExecuting,
    #[msg("Invalid button sent.")]
    InvalidButton,
}
