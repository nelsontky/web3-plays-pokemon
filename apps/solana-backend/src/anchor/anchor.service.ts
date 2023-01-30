import { Injectable } from "@nestjs/common";
import { SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";
// nestjs doesn't want to play nice with json imports from workspace package
import * as idl from "solana-plays-pokemon-program/target/idl/solana_plays_pokemon_program.json";
import * as anchor from "@project-serum/anchor";
import { PROGRAM_ID } from "common";

@Injectable()
export class AnchorService {
  private readonly _connection: anchor.web3.Connection;
  private readonly _program: anchor.Program<SolanaPlaysPokemonProgram>;
  private readonly _wallet: anchor.Wallet;

  constructor() {
    this._connection = new anchor.web3.Connection(
      process.env.RPC_URL,
      process.env.RPC_CONFIG ? JSON.parse(process.env.RPC_CONFIG) : undefined,
    );

    const keypair = anchor.web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.WALLET_PRIVATE_KEY)),
    );
    this._wallet = {
      publicKey: keypair.publicKey,
      payer: keypair,
      signTransaction: (tx: anchor.web3.Transaction) => {
        tx.sign(keypair);
        return Promise.resolve(tx);
      },
      signAllTransactions: (txs: anchor.web3.Transaction[]) => {
        txs.forEach((tx) => {
          tx.sign(keypair);
        });

        return Promise.resolve(txs);
      },
    };

    const provider = new anchor.AnchorProvider(this._connection, this._wallet, {
      commitment: "processed",
    });
    this._program = new anchor.Program(
      idl as anchor.Idl,
      PROGRAM_ID,
      provider,
    ) as unknown as anchor.Program<SolanaPlaysPokemonProgram>;
  }

  get connection() {
    return this._connection;
  }

  get program() {
    return this._program;
  }

  get wallet() {
    return this._wallet;
  }
}
