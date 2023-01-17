use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct MintedNftsCount {
    pub nfts_minted: u32,
}

impl MintedNftsCount {
    pub const LEN: usize = 4;
}

#[account]
pub struct MintedNft {
    pub mint: Pubkey,
}

impl MintedNft {
    pub const LEN: usize = 32;
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
pub struct GameStateV4 {
    pub version: u8,

    pub index: u32,

    pub button_presses: Vec<u8>, // vector of button ids

    pub created_at: i64,

    pub frames_image_cid: String,
    pub save_state_cid: String,
}

impl GameStateV4 {
    pub const BASE_LEN: usize = 4 + 1 + (4 + (MAX_BUTTONS_PER_ROUND * 1)) + 8; // does not include CIDs sizes
}

#[account]
pub struct GameStateV3 {
    pub index: u32,

    pub votes: [u8; NUMBER_OF_BUTTONS],

    pub created_at: i64,

    pub executed_button: i8,

    pub frames_image_cid: String,
    pub save_state_cid: String,
}

impl GameStateV3 {
    pub const BASE_LEN: usize = 4 + (NUMBER_OF_BUTTONS * 1) + 8 + 1; // does not include CIDs sizes
}

#[account]
pub struct GameStateV2 {
    pub index: u32,

    pub votes: [u8; V2_NUMBER_OF_BUTTONS],

    pub created_at: i64,

    pub executed_button: i8,

    pub frames_image_cid: String,
    pub save_state_cid: String,
}

impl GameStateV2 {
    pub const BASE_LEN: usize = 4 + (V2_NUMBER_OF_BUTTONS * 1) + 8 + 1; // does not include CIDs sizes
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
