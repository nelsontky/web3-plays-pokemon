use anchor_lang::error_code;

#[error_code]
pub enum ProgramErrorCode {
    #[msg("Button presses are not allowed when the game is executing.")]
    GameIsExecuting,
    #[msg("Game state cannot be updated when the game is not executing.")]
    NoUpdatesIfNotExecuting,
    #[msg("Invalid button sent.")]
    InvalidButton,
    #[msg("Invalid button press count.")]
    InvalidButtonPressCount,
}
