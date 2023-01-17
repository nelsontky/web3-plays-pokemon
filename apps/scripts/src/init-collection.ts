import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";

const connection = new web3.Connection("", { commitment: "processed" });

let collectionId: web3.Keypair | null = null;
try {
  collectionId = web3.Keypair.fromSecretKey(new Uint8Array());
} catch {}

let wallet: web3.Keypair | null = null;
try {
  wallet = web3.Keypair.fromSecretKey(new Uint8Array());
} catch {}

(async () => {
  if (wallet && collectionId) {
    const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));
    const { nft: collectionNft } = await metaplex.nfts().create({
      name: "Solana Plays Pokemon",
      uri: "https://bafkreibjyfkoo3mny2rbsfpndkodlgrtwdiu43g54dfgcsnfn5jfcx4n4y.ipfs.nftstorage.link/",
      sellerFeeBasisPoints: 0,
      isCollection: true,
      useNewMint: collectionId,
    });

    console.log(collectionNft.address.toBase58());
  }
})();
