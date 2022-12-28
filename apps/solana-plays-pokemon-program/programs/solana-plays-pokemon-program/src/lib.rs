use anchor_lang::prelude::*;

declare_id!("pkmJNXmUxFT1bmmCp4DgvCm2LxR3afRtCwV1EzQwEHK");

#[program]
pub mod solana_plays_pokemon_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let save_state = &mut ctx.accounts.save_state.load_init()?;
        save_state.seconds_played = 0;
        msg!("Save state account initialized");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(zero)]
    pub save_state: AccountLoader<'info, SaveState>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account(zero_copy)]
pub struct SaveState {
    seconds_played: u64,
    gameboy_memory: [u8; 65536],
    palette_memory: [u8; 128],
    wasmboy_state: [u8; 1024],
}
