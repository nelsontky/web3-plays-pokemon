use anchor_lang::prelude::*;

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
        game_data.seconds_played = 1;
        game_data.authority = *ctx.accounts.authority.key;
        msg!("Game data account initialized");

        let game_state = &mut ctx.accounts.game_state;
        game_state.second = 0;

        game_state.up_count = 0;
        game_state.down_count = 0;
        game_state.left_count = 0;
        game_state.right_count = 0;
        game_state.a_count = 0;
        game_state.b_count = 0;
        game_state.start_count = 0;
        game_state.select_count = 0;
        game_state.nothing_count = 1;

        game_state.created_at = ctx.accounts.clock.unix_timestamp;

        game_state.frames_image_cid = frames_image_cid;
        game_state.save_state_cid = save_state_cid;
        msg!("First game state account initialized");

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, joypad_button: JoypadButton) -> Result<()> {
        let game_data = &mut ctx.accounts.game_data;
        if game_data.is_executing {
            return err!(ErrorCode::GameIsExecuting);
        }

        let game_state = &mut ctx.accounts.game_state;

        // initialize state if it wasn't initialized before
        if game_state.second == 0 {
            game_state.second = game_data.seconds_played;
            game_state.created_at = ctx.accounts.clock.unix_timestamp;
        }

        match joypad_button {
            JoypadButton::Up => game_state.up_count = game_state.up_count.checked_add(1).unwrap(),
            JoypadButton::Down => {
                game_state.down_count = game_state.down_count.checked_add(1).unwrap()
            }
            JoypadButton::Left => {
                game_state.left_count = game_state.left_count.checked_add(1).unwrap()
            }
            JoypadButton::Right => {
                game_state.right_count = game_state.right_count.checked_add(1).unwrap()
            }
            JoypadButton::A => game_state.a_count = game_state.a_count.checked_add(1).unwrap(),
            JoypadButton::B => game_state.b_count = game_state.b_count.checked_add(1).unwrap(),
            JoypadButton::Start => {
                game_state.start_count = game_state.start_count.checked_add(1).unwrap()
            }
            JoypadButton::Select => {
                game_state.select_count = game_state.select_count.checked_add(1).unwrap()
            }
            JoypadButton::Nothing => {
                game_state.nothing_count = game_state.nothing_count.checked_add(1).unwrap()
            }
        }

        // execute if game state is at least 10 seconds old
        let should_execute = ctx.accounts.clock.unix_timestamp - game_state.created_at >= 10;
        if should_execute {
            game_data.is_executing = true;

            emit!(ExecuteGameState {
                second: game_data.seconds_played
            });
        }

        Ok(())
    }

    pub fn update_game_state(
        ctx: Context<UpdateGameState>,
        _second: u32,
        frames_image_cid: String,
        save_state_cid: String,
    ) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        game_state.frames_image_cid = frames_image_cid;
        game_state.save_state_cid = save_state_cid;

        let game_data = &mut ctx.accounts.game_data;
        game_data.is_executing = false;
        game_data.seconds_played = game_data.seconds_played.checked_add(1).unwrap();

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
        space = 8 + GameState::LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        seeds = [game_data.key().as_ref(), b"game_state", b"0"], // seeds comprise of game_data key, a static text, and the second when the state begins
        bump
    )]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(
        init_if_needed,
        payer = player,
        space = 8 + GameState::LEN + 4 + 59 + 4 + 59, // nft.storage cids are 59 characters long by default
        seeds = [
                game_data.key().as_ref(),
                b"game_state", 
                game_data.seconds_played.to_string().as_ref()
            ],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub game_data: Account<'info, GameData>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
#[instruction(second: u32, frames_image_cid: String, save_state_cid: String)]
pub struct UpdateGameState<'info> {
    #[account(
        mut,
        seeds = [
            game_data.key().as_ref(),
            b"game_state",
            (second).to_string().as_ref()
        ],
        bump,
        realloc = 8 + GameState::LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        realloc::payer = authority,
        realloc::zero = true,
    )]
    pub game_state: Account<'info, GameState>,
    #[account(mut, has_one = authority)]
    pub game_data: Account<'info, GameData>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct GameData {
    pub seconds_played: u32,
    pub is_executing: bool,
    pub authority: Pubkey,
}

impl GameData {
    pub const LEN: usize = 4 + 1 + 32;
}

#[account]
pub struct GameState {
    pub second: u32,

    pub up_count: u32,
    pub down_count: u32,
    pub left_count: u32,
    pub right_count: u32,
    pub a_count: u32,
    pub b_count: u32,
    pub start_count: u32,
    pub select_count: u32,
    pub nothing_count: u32,

    pub created_at: i64,

    pub frames_image_cid: String,
    pub save_state_cid: String,
}

impl GameState {
    pub const LEN: usize = 4 + (9 * 4) + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum JoypadButton {
    Up,
    Down,
    Left,
    Right,
    A,
    B,
    Start,
    Select,
    Nothing,
}

#[event]
pub struct ExecuteGameState {
    pub second: u32,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Button presses are not allowed when the game is executing.")]
    GameIsExecuting,
}
