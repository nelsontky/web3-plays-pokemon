use anchor_lang::prelude::*;

declare_id!("pkmJNXmUxFT1bmmCp4DgvCm2LxR3afRtCwV1EzQwEHK");

#[program]
pub mod solana_plays_pokemon_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, frames_image_cid:String, save_state_cid:String) -> Result<()> {
        let game_data = &mut ctx.accounts.game_data;
        game_data.seconds_played = 1;
        game_data.authority = *ctx.accounts.authority.key;
        msg!("Game data account initialized");

        let game_state = &mut ctx.accounts.game_state;
        game_state.is_voting_closed = true;
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

        game_state.frames_image_cid = frames_image_cid;
        game_state.save_state_cid = save_state_cid;
        msg!("FIrst game state account initialized");

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(frames_image_cid:String, save_state_cid:String)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = GameData::LEN + 8)]
    pub game_data: Account<'info, GameData>,
    #[account(
        init, 
        payer = authority, 
        space = 8 + 1 + (10 * 8) + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
        seeds = [game_data.key().as_ref(), b"0"], // seeds comprise of game_data key and the second when the state begins
        bump
    )]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct GameData {
    pub seconds_played: u32,
    pub authority: Pubkey,
}

impl GameData {
    pub const LEN: usize = 8 + 32;
}

#[account]
pub struct GameState {
    pub is_voting_closed: bool,
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

    pub frames_image_cid: String,
    pub save_state_cid: String,
}
