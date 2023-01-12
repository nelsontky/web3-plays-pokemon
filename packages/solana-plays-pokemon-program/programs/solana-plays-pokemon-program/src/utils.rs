use crate::account::*;
use anchor_lang::prelude::*;

pub fn init_game_state(
    game_state: &mut Account<GameStateV4>,
    index: u32,
    unix_timestamp: i64,
    frames_image_cid: &String,
    save_state_cid: &String,
) {
    game_state.version = 4;
    game_state.index = index;
    game_state.button_presses = Vec::new();
    game_state.created_at = unix_timestamp;
    game_state.frames_image_cid = frames_image_cid.to_string();
    game_state.save_state_cid = save_state_cid.to_string();
}
