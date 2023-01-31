use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use crate::account::*;
use crate::program::SolanaPlaysPokemonProgram;
use anchor_spl::metadata::Metadata;
use anchor_spl::token::{Mint, Token, TokenAccount};

//// comment out all initialization code to keep program size small enough for deployment :')
// #[derive(Accounts)]
// #[instruction(frames_image_cid: String, save_state_cid: String)]
// pub struct Initialize<'info> {
//     #[account(init, payer = authority, space = 8 + GameData::LEN)]
//     pub game_data: Account<'info, GameData>,
//     #[account(
//         init,
//         payer = authority,
//         space = 8 + GameStateV4::BASE_LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
//         seeds = [game_data.key().as_ref(), b"game_state", b"0"], // seeds comprise of game_data key, a static text, and the index
//         bump
//     )]
//     pub game_state: Account<'info, GameStateV4>,
//     #[account(
//         init,
//         payer = authority,
//         space = 8 + GameStateV4::BASE_LEN + 4 + frames_image_cid.len() + 4 + save_state_cid.len(),
//         seeds = [game_data.key().as_ref(), b"game_state", b"1"], // seeds comprise of game_data key, a static text, and the index
//         bump
//     )]
//     pub next_game_state: Account<'info, GameStateV4>,
//     #[account(
//         init,
//         payer = authority,
//         seeds = [
//             b"current_participants",
//             game_data.key().as_ref(),
//         ],
//         space = 8 + CurrentParticipants::LEN,
//         bump
//     )]
//     pub current_participants: Account<'info, CurrentParticipants>,
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     pub system_program: Program<'info, System>,
//     pub clock: Sysvar<'info, Clock>,
// }

// #[derive(Accounts)]
// #[instruction(gas_mint: Pubkey)]
// pub struct InitializePrices<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         init,
//         seeds = [
//             b"spl_prices",
//             gas_mint.key().as_ref()
//         ], 
//         bump,
//         payer = authority,
//         space = 8 + SplPrices::LEN
//     )]
//     pub spl_prices: Account<'info, SplPrices>,
//     #[account(constraint = program.programdata_address()? == Some(program_data.key()))]
//     pub program: Program<'info, SolanaPlaysPokemonProgram>,
//     #[account(constraint = program_data.upgrade_authority_address == Some(authority.key()))]
//     pub program_data: Account<'info, ProgramData>,
//     pub system_program: Program<'info, System>
// }

// #[derive(Accounts)]
// pub struct InitializeCurrentParticipants<'info> {
//     #[account(
//         init,
//         payer = authority,
//         seeds = [
//             b"current_participants",
//             game_data.key().as_ref(),
//         ],
//         space = 8 + CurrentParticipants::LEN,
//         bump
//     )]
//     pub current_participants: Account<'info, CurrentParticipants>,
//     #[account(mut, has_one = authority)]
//     pub game_data: Account<'info, GameData>,
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

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
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct SendButtonSplGas<'info> {
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
    #[account(
        seeds = [
            b"spl_prices",
            gas_mint.key().as_ref()
        ], 
        bump,
    )]
    pub spl_prices: Account<'info, SplPrices>,
    pub gas_mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = gas_mint,
        associated_token::authority = authority,
    )]
    pub gas_deposit_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = gas_mint,
        associated_token::authority = player,
    )]
    pub gas_source_token_account: Account<'info, TokenAccount>,
    pub player: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
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

#[derive(Accounts)]
#[instruction(
    game_state_index: u32
)]
pub struct MintFramesNftSplGas<'info> {
    #[account(
        init,
        seeds = [
            b"nft_mint",
            game_data.key().as_ref(),
            user.key().as_ref(),
            game_state_index.to_string().as_ref()
        ],
        bump,
        payer = authority,
        mint::decimals = 0,
        mint::authority = authority,
        mint::freeze_authority = authority
    )]
    pub mint: Account<'info, Mint>,
    pub user: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority)]
    pub game_data: Account<'info, GameData>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,

    #[account(
        init,
        payer = authority,
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
        payer = authority,
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

    // spl gas stuff
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = gas_mint,
        associated_token::authority = authority,
    )]
    pub gas_deposit_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::mint = gas_mint,
        associated_token::authority = user,
    )]
    pub gas_source_token_account: Box<Account<'info, TokenAccount>>,
    pub gas_mint: Box<Account<'info, Mint>>,
    #[account(
        seeds = [
            b"spl_prices",
            gas_mint.key().as_ref()
        ], 
        bump,
    )]
    pub spl_prices: Box<Account<'info, SplPrices>>,
}

#[derive(Accounts)]
#[instruction(gas_mint: Pubkey)]
pub struct UpdatePrices<'info> {
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [
            b"spl_prices",
            gas_mint.key().as_ref()
        ], 
        bump
    )]
    pub spl_prices: Account<'info, SplPrices>,
    #[account(constraint = program.programdata_address()? == Some(program_data.key()))]
    pub program: Program<'info, SolanaPlaysPokemonProgram>,
    #[account(constraint = program_data.upgrade_authority_address == Some(authority.key()))]
    pub program_data: Account<'info, ProgramData>,
}
