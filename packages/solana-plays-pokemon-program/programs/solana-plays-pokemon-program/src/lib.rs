use crate::account::*;
use crate::constants::*;
use crate::context::*;
use crate::errors::*;
use crate::utils::*;

use anchor_lang::prelude::*;
use anchor_spl::token::transfer;

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

    //// comment out all initialization code to keep program size small enough for deployment :')
    // pub fn initialize(
    //     ctx: Context<Initialize>,
    //     frames_image_cid: String,
    //     save_state_cid: String,
    // ) -> Result<()> {
    //     let game_data = &mut ctx.accounts.game_data;
    //     game_data.executed_states_count = 1;
    //     game_data.authority = *ctx.accounts.authority.key;
    //     game_data.nfts_minted = 0;

    //     msg!("Game data account initialized");

    //     let game_state = &mut ctx.accounts.game_state;
    //     init_game_state(
    //         game_state,
    //         0,
    //         ctx.accounts.clock.unix_timestamp,
    //         &frames_image_cid,
    //         &save_state_cid,
    //     );
    //     msg!("First game state account initialized");

    //     // init next game state
    //     let next_game_state = &mut ctx.accounts.next_game_state;
    //     init_game_state(
    //         next_game_state,
    //         game_data.executed_states_count,
    //         ctx.accounts.clock.unix_timestamp,
    //         &String::from(""),
    //         &String::from(""),
    //     );
    //     msg!("Second game state account initialized");

    //     // init current_participants
    //     let current_participants = &mut ctx.accounts.current_participants;
    //     current_participants.participants = Vec::new();

    //     Ok(())
    // }

    // pub fn initialize_current_participants(
    //     ctx: Context<InitializeCurrentParticipants>,
    // ) -> Result<()> {
    //     let current_participants = &mut ctx.accounts.current_participants;
    //     current_participants.participants = Vec::new();

    //     Ok(())
    // }

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
        // transfer spl gas
        let spl_gas_amount = calculate_spl_gas_amount(
            &ctx.accounts.spl_prices,
            SEND_BUTTON_SPL_GAS_TRANSACTION_FEE_LAMPORTS,
        );
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    authority: ctx.accounts.player.to_account_info(),
                    from: ctx.accounts.gas_source_token_account.to_account_info(),
                    to: ctx.accounts.gas_deposit_token_account.to_account_info(),
                },
            ),
            spl_gas_amount,
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
    pub fn mint_frames_nft(
        ctx: Context<MintFramesNft>,
        _game_state_index: u32,
        name: String,
        metadata_uri: String,
    ) -> Result<()> {
        process_mint_frames_nft(
            name,
            metadata_uri,
            &ctx.accounts.token_program,
            &ctx.accounts.mint,
            &ctx.accounts.token_account,
            &ctx.accounts.authority,
            &ctx.accounts.token_metadata_account,
            &ctx.accounts.user,
            &ctx.accounts.rent,
            &ctx.accounts.system_program,
            &ctx.accounts.collection_mint,
            &ctx.accounts.collection_master_edition,
            &ctx.accounts.token_metadata_program,
            &ctx.accounts.collection_metadata,
            &ctx.accounts.master_edition,
            &mut ctx.accounts.game_data,
            &mut ctx.accounts.minted_nft,
        )
    }

    pub fn mint_frames_nft_spl_gas(
        ctx: Context<MintFramesNftSplGas>,
        _game_state_index: u32,
        name: String,
        metadata_uri: String,
    ) -> Result<()> {
        // transfer spl gas
        let spl_gas_amount = calculate_spl_gas_amount(
            &ctx.accounts.spl_prices,
            MINT_NFT_SPL_GAS_TRANSACTION_FEE_LAMPORTS,
        );

        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    authority: ctx.accounts.user.to_account_info(),
                    from: ctx.accounts.gas_source_token_account.to_account_info(),
                    to: ctx.accounts.gas_deposit_token_account.to_account_info(),
                },
            ),
            spl_gas_amount,
        )?;

        process_mint_frames_nft(
            name,
            metadata_uri,
            &ctx.accounts.token_program,
            &ctx.accounts.mint,
            &ctx.accounts.token_account,
            &ctx.accounts.authority,
            &ctx.accounts.token_metadata_account,
            &ctx.accounts.authority,
            &ctx.accounts.rent,
            &ctx.accounts.system_program,
            &ctx.accounts.collection_mint,
            &ctx.accounts.collection_master_edition,
            &ctx.accounts.token_metadata_program,
            &ctx.accounts.collection_metadata,
            &ctx.accounts.master_edition,
            &mut ctx.accounts.game_data,
            &mut ctx.accounts.minted_nft,
        )
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
