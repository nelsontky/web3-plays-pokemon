import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import * as dotenv from "dotenv";
import { NFTStorage } from "nft.storage";

dotenv.config();

const connection = new anchor.web3.Connection(
  process.env.RPC_URL!,
  process.env.RPC_CONFIG ? JSON.parse(process.env.RPC_CONFIG) : undefined
);

let collectionId: web3.Keypair | null = null;
try {
  collectionId = web3.Keypair.fromSecretKey(new Uint8Array());
} catch {}

const wallet = anchor.web3.Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.WALLET_PRIVATE_KEY!))
);

const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN! });

(async () => {
  if (collectionId) {
    const name = "Solana Plays Pokemon Crystal";
    const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));
    const metadataBlob = new Blob([
      JSON.stringify(
        getCollectionMetadata(
          name,

          // upload collection image manually
          "bafkreier467oenuk3ew55rkrr42pen5mixyyymy35k2qg5mmy7xog5yhfm"
        )
      ),
    ]);
    const metadataCid = await client.storeBlob(metadataBlob);
    const uri = `https://${metadataCid}.ipfs.nftstorage.link`;

    const { nft: collectionNft } = await metaplex.nfts().create({
      name,
      uri,
      sellerFeeBasisPoints: 0,
      isCollection: true,
      useNewMint: collectionId,
    });

    console.log(collectionNft.address.toBase58());
  }
})();

function getCollectionMetadata(name: string, imageCid: string) {
  return {
    name,
    description:
      "NFTs of people playing Pokemon Crystal on the Solana blockchain!",
    image: `https://${imageCid}.ipfs.nftstorage.link`,
    external_url: "https://solana.playspokemon.xyz",
    properties: {
      files: [
        {
          uri: `https://${imageCid}.ipfs.nftstorage.link`,
          type: "image/png",
        },
      ],
      category: "image",
    },
  };
}
