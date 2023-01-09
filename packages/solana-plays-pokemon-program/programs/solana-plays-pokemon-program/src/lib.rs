use anchor_lang::prelude::*;

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

// Mainnet
declare_id!("pkmNUoVrc8m4DkvQkKDHrffDEPJwVhuXqQv3hegbVyg");

// Devnet
// declare_id!("pkmJNXmUxFT1bmmCp4DgvCm2LxR3afRtCwV1EzQwEHK");

const VOTE_SECONDS: i64 = 7;
const NUMBER_OF_BUTTONS: usize = 13;

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
        game_state.index = 0;
        game_state.votes = [0; NUMBER_OF_BUTTONS];
        game_state.created_at = ctx.accounts.clock.unix_timestamp;
        game_state.executed_button = -1; // empty value is -1
        game_state.frames_image_cid = frames_image_cid;
        game_state.save_state_cid = save_state_cid;
        msg!("First game state account initialized");

        // init next game state
        let next_game_state = &mut ctx.accounts.next_game_state;
        next_game_state.index = game_data.executed_states_count;
        game_state.votes = [0; NUMBER_OF_BUTTONS];
        next_game_state.created_at = ctx.accounts.clock.unix_timestamp;
        next_game_state.executed_button = -1;
        msg!("Second game state account initialized");

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, joypad_button: u8) -> Result<()> {
        if joypad_button >= u8::try_from(NUMBER_OF_BUTTONS).unwrap() {
            return err!(ErrorCode::InvalidButton);
        }

        let game_data = &mut ctx.accounts.game_data;
        if game_data.is_executing {
            return err!(ErrorCode::GameIsExecuting);
        }

        let game_state = &mut ctx.accounts.game_state;
        game_state.votes[usize::from(joypad_button)] = game_state.votes[usize::from(joypad_button)]
            .checked_add(1)
            .unwrap();

        // execute if game state is at least 10 seconds old
        let should_execute =
            ctx.accounts.clock.unix_timestamp - game_state.created_at >= VOTE_SECONDS;
        if should_execute {
            game_data.is_executing = true;

            let mut executed_button: i8 = 0;
            let mut most_voted_count: i32 = -1;
            let votes = game_state.votes;
            for i in 0..votes.len() {
                if i32::from(votes[i]) > most_voted_count {
                    most_voted_count = i32::from(votes[i]);
                    executed_button = i8::try_from(i).unwrap();
                }
            }

            game_state.executed_button = executed_button;

            emit!(ExecuteGameState {
                executed_button,
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
        next_game_state.index = game_data.executed_states_count;
        next_game_state.votes = [0; NUMBER_OF_BUTTONS];
        next_game_state.created_at = ctx.accounts.clock.unix_timestamp;
        next_game_state.executed_button = -1;

        Ok(())
    }

    pub fn migrate_game_state_to_v2(
        ctx: Context<MigrateGameStateToV2>,
        frames_image_cid: String,
        save_state_cid: String,
    ) -> Result<()> {
        let game_data = &mut ctx.accounts.game_data;
        game_data.is_executing = false;
        game_data.executed_states_count = game_data.executed_states_count.checked_add(2).unwrap();

        let game_state = &mut ctx.accounts.game_state;
        game_state.frames_image_cid = frames_image_cid.clone();
        game_state.save_state_cid = save_state_cid.clone();
        game_state.executed_button = JoypadButton::Nothing;

        let next_game_state = &mut ctx.accounts.next_game_state;
        next_game_state.index = game_data.executed_states_count.checked_sub(1).unwrap();
        next_game_state.votes = [0; NUMBER_OF_BUTTONS];
        next_game_state.created_at = ctx.accounts.clock.unix_timestamp;
        next_game_state.frames_image_cid = frames_image_cid;
        next_game_state.save_state_cid = save_state_cid;
        next_game_state.executed_button = 0;

        let next_next_game_state = &mut ctx.accounts.next_next_game_state;
        next_next_game_state.index = game_data.executed_states_count;
        next_next_game_state.votes = [0; NUMBER_OF_BUTTONS];
        next_next_game_state.created_at = ctx.accounts.clock.unix_timestamp;
        next_next_game_state.executed_button = -1;

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
        space = 8 + GameStateV2::BASE_LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        seeds = [game_data.key().as_ref(), b"game_state", b"0"], // seeds comprise of game_data key, a static text, and the index
        bump
    )]
    pub game_state: Account<'info, GameStateV2>,
    #[account(
        init,
        payer = authority,
        space = 8 + GameStateV2::BASE_LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        seeds = [game_data.key().as_ref(), b"game_state", b"1"], // seeds comprise of game_data key, a static text, and the index
        bump
    )]
    pub next_game_state: Account<'info, GameStateV2>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(
        mut,
        seeds = [
                game_data.key().as_ref(),
                b"game_state", 
                game_data.executed_states_count.to_string().as_ref()
            ],
        bump
    )]
    pub game_state: Account<'info, GameStateV2>,
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
        realloc = 8 + GameStateV2::BASE_LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        realloc::payer = authority,
        realloc::zero = true,
    )]
    pub game_state: Account<'info, GameStateV2>,
    #[account(
        init,
        payer = authority,
        space = 8 + GameStateV2::BASE_LEN + 4 + 59 + 4 + 59, // nft.storage cids are 59 characters long by default
        seeds = [
                game_data.key().as_ref(),
                b"game_state", 
                (game_data.executed_states_count.checked_add(1).unwrap()).to_string().as_ref()
            ],
        bump
    )]
    pub next_game_state: Account<'info, GameStateV2>,
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
pub struct MigrateGameStateToV2<'info> {
    #[account(
        mut,
        seeds = [
            game_data.key().as_ref(),
            b"game_state",
            (game_data.executed_states_count).to_string().as_ref()
        ],
        bump,
        realloc = 8 + GameState::LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        realloc::payer = authority,
        realloc::zero = true,
    )]
    pub game_state: Account<'info, GameState>,
    #[account(
        init,
        payer = authority,
        space = 8 + GameStateV2::BASE_LEN + 4 + 59 + 4 + 59, // nft.storage cids are 59 characters long by default
        seeds = [
                game_data.key().as_ref(),
                b"game_state", 
                (game_data.executed_states_count.checked_add(1).unwrap()).to_string().as_ref()
            ],
        bump
    )]
    pub next_game_state: Account<'info, GameStateV2>,
    #[account(
        init,
        payer = authority,
        space = 8 + GameStateV2::BASE_LEN + 4 + 59 + 4 + 59, // nft.storage cids are 59 characters long by default
        seeds = [
                game_data.key().as_ref(),
                b"game_state", 
                (game_data.executed_states_count.checked_add(2).unwrap()).to_string().as_ref()
            ],
        bump
    )]
    pub next_next_game_state: Account<'info, GameStateV2>,
    #[account(mut, has_one = authority)]
    pub game_data: Account<'info, GameData>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[account]
pub struct GameData {
    pub executed_states_count: u32,
    pub is_executing: bool,
    pub authority: Pubkey,
}

impl GameData {
    pub const LEN: usize = 4 + 1 + 32;
}

#[account]
pub struct GameStateV2 {
    pub index: u32,

    pub votes: [u8; NUMBER_OF_BUTTONS],

    pub created_at: i64,

    pub executed_button: i8,

    pub frames_image_cid: String,
    pub save_state_cid: String,
}

impl GameStateV2 {
    pub const BASE_LEN: usize = 4 + (13 * 1) + 8 + 1; // does not include CIDs sizes
}

#[account]
pub struct GameState {
    pub index: u32,

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

    pub executed_button: JoypadButton, // 1 + 1

    pub frames_image_cid: String,
    pub save_state_cid: String,
}

impl GameState {
    pub const LEN: usize = 4 + (9 * 4) + 8 + (1 + 1);
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
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
    pub executed_button: i8,
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
