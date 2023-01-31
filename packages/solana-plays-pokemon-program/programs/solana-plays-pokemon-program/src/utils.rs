use std::cmp;

use crate::ExecuteGameState;
use crate::account::*;
use crate::constants::*;
use crate::errors::*;

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

pub fn process_button_send(
    game_data: &mut Account<GameData>,
    game_state: &mut Account<GameStateV4>,
    current_participants: &mut Account<CurrentParticipants>,
    player: &Signer,
    clock: &Sysvar<Clock>,
    joypad_button: u8,
    press_count: u8,
) -> Result<()> {
    // disable turbo buttons in anarchy mode
    let is_valid_button = joypad_button < 5 || (joypad_button > 8 && joypad_button < 13);
    if !is_valid_button {
        return err!(ProgramErrorCode::InvalidButton);
    }

    let is_valid_press_count = press_count > 0 && press_count <= MAX_BUTTON_PRESS_COUNT;
    if !is_valid_press_count {
        return err!(ProgramErrorCode::InvalidButtonPressCount);
    }

    if game_data.is_executing {
        return err!(ProgramErrorCode::GameIsExecuting);
    }

    let max_presses_left = MAX_BUTTONS_PER_ROUND - game_state.button_presses.len();
    let computed_press_count = cmp::min(max_presses_left, usize::from(press_count));
    for _ in 0..computed_press_count {
        game_state.button_presses.push(joypad_button);
    }

    current_participants
        .participants
        .push(player.key());

    msg!(
        "{{ \"button\": \"{}\", \"pressCount\": {} }}",
        BUTTON_MAPPINGS[usize::from(joypad_button)],
        computed_press_count
    );

    // execute if game state is at least 10 seconds old or we have hit 10 button presses
    let should_execute = game_state.button_presses.len() >= MAX_BUTTONS_PER_ROUND
        || (clock.unix_timestamp - game_state.created_at >= VOTE_SECONDS);
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
            game_data_id: game_data.key(),
            participants
        });
    }

    Ok(())
}
