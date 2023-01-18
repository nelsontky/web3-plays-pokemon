import * as anchor from "@project-serum/anchor";
import idl from "../../../packages/solana-plays-pokemon-program/dist/target/idl/solana_plays_pokemon_program.json";
import { SolanaPlaysPokemonProgram } from "../../../packages/solana-plays-pokemon-program/dist/target/types/solana_plays_pokemon_program";
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import * as dotenv from "dotenv";
import { COLLECTION_ID, GAME_DATA_ACCOUNT_ID, PROGRAM_ID } from "common";
import axios from "axios";
import { NFTStorage, Blob } from "nft.storage";

dotenv.config();

const connection = new anchor.web3.Connection(
  process.env.RPC_URL!,
  process.env.RPC_CONFIG ? JSON.parse(process.env.RPC_CONFIG) : undefined
);

const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN! });

const keypair = anchor.web3.Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.WALLET_PRIVATE_KEY!))
);
const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));
const updateMintedNfts = async () => {
  const randomKeypair = anchor.web3.Keypair.generate();
  const provider = new anchor.AnchorProvider(
    connection,
    {
      publicKey: randomKeypair.publicKey,
      signTransaction: (() => {}) as any,
      signAllTransactions: (() => {}) as any,
    },
    { commitment: "processed" }
  );
  anchor.setProvider(provider);

  const program = new anchor.Program(
    idl as anchor.Idl,
    PROGRAM_ID
  ) as unknown as anchor.Program<SolanaPlaysPokemonProgram>;
  const GAME_DATA_ACCOUNT_PUBLIC_KEY = new anchor.web3.PublicKey(
    GAME_DATA_ACCOUNT_ID
  );
  const [mintedNftsCountPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("minted_nfts_count"), GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer()],
    program.programId
  );
  const { nftsMinted } = await program.account.mintedNftsCount.fetch(
    mintedNftsCountPda
  );

  for (let i = 0; i < nftsMinted; i++) {
    console.log(`processing ${i + 1} / ${nftsMinted}`);
    const [mintedNftPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("minted_nft"),
        GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
        Buffer.from("" + i),
      ],
      program.programId
    );
    const { mint } = await program.account.mintedNft.fetch(mintedNftPda);
    console.log(mint.toBase58(), "\n");

    const nft = await metaplex.nfts().findByMint({
      mintAddress: mint,
    });

    const { name, ...rest } = (
      await axios.get(nft.uri, {
        headers: { "Accept-Encoding": "gzip,deflate,compress" },
      })
    ).data;
    const updatedOffChainMetadata = JSON.stringify({
      name,
      symbol: "PKM",
      ...rest,
    });

    const metadataBlob = new Blob([updatedOffChainMetadata]);
    const metadataCid = await client.storeBlob(metadataBlob);
    const uri = `https://${metadataCid}.ipfs.nftstorage.link`;

    await metaplex.nfts().update({
      symbol: "PKM",
      uri,
      nftOrSft: nft,
    });
  }
};

const updateCollection = async () => {
  const collectionId = new anchor.web3.PublicKey(COLLECTION_ID);
  const nft = await metaplex.nfts().findByMint({
    mintAddress: collectionId,
  });

  const { name, ...rest } = (await axios.get(nft.uri)).data;
  const updatedOffChainMetadata = JSON.stringify({
    name,
    symbol: "PKM",
    ...rest,
  });

  const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN! });
  const metadataBlob = new Blob([updatedOffChainMetadata]);
  const metadataCid = await client.storeBlob(metadataBlob);
  const uri = `https://${metadataCid}.ipfs.nftstorage.link`;

  await metaplex.nfts().update({
    symbol: "PKM",
    uri,
    nftOrSft: nft,
  });
};

// updateCollection();
updateMintedNfts();
