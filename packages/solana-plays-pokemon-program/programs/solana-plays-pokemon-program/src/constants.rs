pub const VOTE_SECONDS: i64 = 10;
pub const V2_NUMBER_OF_BUTTONS: usize = 13;
pub const NUMBER_OF_BUTTONS: usize = 15;
pub const MAX_BUTTONS_PER_ROUND: usize = 10;
pub const MAX_BUTTON_PRESS_COUNT: u8 = 2;
pub const BUTTON_MAPPINGS: [&str; 15] = [
    "DO NOTHING",
    "UP",
    "DOWN",
    "LEFT",
    "RIGHT",
    "TURBO UP",
    "TURBO DOWN",
    "TURBO LEFT",
    "TURBO RIGHT",
    "A",
    "B",
    "START",
    "SELECT",
    "Turbo A",
    "Turbo B",
];

pub const SEND_BUTTON_SPL_GAS_TRANSACTION_FEE_LAMPORTS: u64 = 5000 * 2; // 2 signers
pub const MINT_NFT_SPL_GAS_TRANSACTION_FEE_LAMPORTS: u64 = 13150480;
