export type SolanaPlaysPokemonProgram = {
  "version": "0.1.0",
  "name": "solana_plays_pokemon_program",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "gameData",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextGameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintedNftsCount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "framesImageCid",
          "type": "string"
        },
        {
          "name": "saveStateCid",
          "type": "string"
        }
      ]
    },
    {
      "name": "sendButton",
      "accounts": [
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "joypadButton",
          "type": "u8"
        },
        {
          "name": "pressCount",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateGameState",
      "accounts": [
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextGameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "framesImageCid",
          "type": "string"
        },
        {
          "name": "saveStateCid",
          "type": "string"
        }
      ]
    },
    {
      "name": "migrateGameStateToV4",
      "accounts": [
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextGameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextNextGameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "framesImageCid",
          "type": "string"
        },
        {
          "name": "saveStateCid",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeMintedNftsCount",
      "accounts": [
        {
          "name": "mintedNftsCount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "mintFramesNft",
      "accounts": [
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "gameData",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintedNftsCount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintedNft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionMasterEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameStateIndex",
          "type": "u32"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "mintedNftsCount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftsMinted",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "mintedNft",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "gameData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "executedStatesCount",
            "type": "u32"
          },
          {
            "name": "isExecuting",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "gameStateV4",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "buttonPresses",
            "type": "bytes"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "framesImageCid",
            "type": "string"
          },
          {
            "name": "saveStateCid",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "gameStateV3",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "votes",
            "type": {
              "array": [
                "u8",
                15
              ]
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "executedButton",
            "type": "i8"
          },
          {
            "name": "framesImageCid",
            "type": "string"
          },
          {
            "name": "saveStateCid",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "gameStateV2",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "votes",
            "type": {
              "array": [
                "u8",
                13
              ]
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "executedButton",
            "type": "i8"
          },
          {
            "name": "framesImageCid",
            "type": "string"
          },
          {
            "name": "saveStateCid",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "gameState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "upCount",
            "type": "u32"
          },
          {
            "name": "downCount",
            "type": "u32"
          },
          {
            "name": "leftCount",
            "type": "u32"
          },
          {
            "name": "rightCount",
            "type": "u32"
          },
          {
            "name": "aCount",
            "type": "u32"
          },
          {
            "name": "bCount",
            "type": "u32"
          },
          {
            "name": "startCount",
            "type": "u32"
          },
          {
            "name": "selectCount",
            "type": "u32"
          },
          {
            "name": "nothingCount",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "executedButton",
            "type": {
              "defined": "JoypadButton"
            }
          },
          {
            "name": "framesImageCid",
            "type": "string"
          },
          {
            "name": "saveStateCid",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "JoypadButton",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Up"
          },
          {
            "name": "Down"
          },
          {
            "name": "Left"
          },
          {
            "name": "Right"
          },
          {
            "name": "A"
          },
          {
            "name": "B"
          },
          {
            "name": "Start"
          },
          {
            "name": "Select"
          },
          {
            "name": "Nothing"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "ExecuteGameState",
      "fields": [
        {
          "name": "buttonPresses",
          "type": {
            "array": [
              "u8",
              10
            ]
          },
          "index": false
        },
        {
          "name": "index",
          "type": "u32",
          "index": false
        },
        {
          "name": "gameDataId",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GameIsExecuting",
      "msg": "Button presses are not allowed when the game is executing."
    },
    {
      "code": 6001,
      "name": "NoUpdatesIfNotExecuting",
      "msg": "Game state cannot be updated when the game is not executing."
    },
    {
      "code": 6002,
      "name": "InvalidButton",
      "msg": "Invalid button sent."
    },
    {
      "code": 6003,
      "name": "InvalidButtonPressCount",
      "msg": "Invalid button press count."
    }
  ]
};

export const IDL: SolanaPlaysPokemonProgram = {
  "version": "0.1.0",
  "name": "solana_plays_pokemon_program",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "gameData",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextGameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintedNftsCount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "framesImageCid",
          "type": "string"
        },
        {
          "name": "saveStateCid",
          "type": "string"
        }
      ]
    },
    {
      "name": "sendButton",
      "accounts": [
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "joypadButton",
          "type": "u8"
        },
        {
          "name": "pressCount",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateGameState",
      "accounts": [
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextGameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "framesImageCid",
          "type": "string"
        },
        {
          "name": "saveStateCid",
          "type": "string"
        }
      ]
    },
    {
      "name": "migrateGameStateToV4",
      "accounts": [
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextGameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextNextGameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "framesImageCid",
          "type": "string"
        },
        {
          "name": "saveStateCid",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeMintedNftsCount",
      "accounts": [
        {
          "name": "mintedNftsCount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "mintFramesNft",
      "accounts": [
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "gameData",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintedNftsCount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintedNft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionMasterEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameStateIndex",
          "type": "u32"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "mintedNftsCount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftsMinted",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "mintedNft",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "gameData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "executedStatesCount",
            "type": "u32"
          },
          {
            "name": "isExecuting",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "gameStateV4",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "buttonPresses",
            "type": "bytes"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "framesImageCid",
            "type": "string"
          },
          {
            "name": "saveStateCid",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "gameStateV3",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "votes",
            "type": {
              "array": [
                "u8",
                15
              ]
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "executedButton",
            "type": "i8"
          },
          {
            "name": "framesImageCid",
            "type": "string"
          },
          {
            "name": "saveStateCid",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "gameStateV2",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "votes",
            "type": {
              "array": [
                "u8",
                13
              ]
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "executedButton",
            "type": "i8"
          },
          {
            "name": "framesImageCid",
            "type": "string"
          },
          {
            "name": "saveStateCid",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "gameState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "upCount",
            "type": "u32"
          },
          {
            "name": "downCount",
            "type": "u32"
          },
          {
            "name": "leftCount",
            "type": "u32"
          },
          {
            "name": "rightCount",
            "type": "u32"
          },
          {
            "name": "aCount",
            "type": "u32"
          },
          {
            "name": "bCount",
            "type": "u32"
          },
          {
            "name": "startCount",
            "type": "u32"
          },
          {
            "name": "selectCount",
            "type": "u32"
          },
          {
            "name": "nothingCount",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "executedButton",
            "type": {
              "defined": "JoypadButton"
            }
          },
          {
            "name": "framesImageCid",
            "type": "string"
          },
          {
            "name": "saveStateCid",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "JoypadButton",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Up"
          },
          {
            "name": "Down"
          },
          {
            "name": "Left"
          },
          {
            "name": "Right"
          },
          {
            "name": "A"
          },
          {
            "name": "B"
          },
          {
            "name": "Start"
          },
          {
            "name": "Select"
          },
          {
            "name": "Nothing"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "ExecuteGameState",
      "fields": [
        {
          "name": "buttonPresses",
          "type": {
            "array": [
              "u8",
              10
            ]
          },
          "index": false
        },
        {
          "name": "index",
          "type": "u32",
          "index": false
        },
        {
          "name": "gameDataId",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GameIsExecuting",
      "msg": "Button presses are not allowed when the game is executing."
    },
    {
      "code": 6001,
      "name": "NoUpdatesIfNotExecuting",
      "msg": "Game state cannot be updated when the game is not executing."
    },
    {
      "code": 6002,
      "name": "InvalidButton",
      "msg": "Invalid button sent."
    },
    {
      "code": 6003,
      "name": "InvalidButtonPressCount",
      "msg": "Invalid button press count."
    }
  ]
};
