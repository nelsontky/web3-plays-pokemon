import GIFEncoder from "gifencoder";
import { createCanvas } from "canvas";
import fs from "fs";
import axios from "axios";
import { inflate } from "pako";
import {
  CELL_SIZE,
  FRAMES_TO_DRAW_PER_EXECUTION,
  GAMEBOY_CAMERA_HEIGHT,
  GAMEBOY_CAMERA_WIDTH,
  NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS,
  renderFrame,
} from "common";
import streamBuffers from "stream-buffers";
import { NFTStorage, Blob } from "nft.storage";

const fetchTestFrames = async () => {
  try {
    const response = await axios.get(
      `https://bafkreiccaaegumaidqpszl4zt75qwndrgtvpeprlqobm4lpj2t4e2zkqr4.ipfs.cf-ipfs.com`,
      { responseType: "arraybuffer" }
    );
    const inflated = inflate(response.data, { to: "string" });
    fs.writeFileSync("./frames-test.json", inflated);
  } catch (e) {
    console.log(e);
  }
};

const generateMetadata = (round: number, imageUrl: string) => ({
  name: `Solana Plays Pokemon #${round}`,
  description: `Round #${round} of Solana Plays Pokemon.`,
  image: imageUrl,
  animation_url: imageUrl,
  external_url: "https://solana.playspokemon.xyz",
  attributes: [
    {
      trait_type: "Round",
      value: round,
    },
    {
      trait_type: "Game",
      value: "Pokemon Red",
    },
    {
      trait_type: "Version",
      value: "v1",
    },
  ],
  properties: {
    files: [
      {
        uri: imageUrl,
        type: "image/gif",
      },
    ],
    category: "image",
  },
});

const COLLECTION_METADATA = JSON.stringify({
  name: "Solana Plays Pokemon",
  description: "NFTs of people playing Pokemon Red on the Solana blockchain!",
  image:
    "https://bafkreifdjdrlq5gpzzx4zqhwzb7uvxar7gv6f725q52s3jr2lctojoy4ci.ipfs.nftstorage.link",
  external_url: "https://solana.playspokemon.xyz",
  properties: {
    files: [
      {
        uri: "https://bafkreifdjdrlq5gpzzx4zqhwzb7uvxar7gv6f725q52s3jr2lctojoy4ci.ipfs.nftstorage.link",
        type: "image/png",
      },
    ],
    category: "image",
  },
});

const testCanvas = () => {
  const encoder = new GIFEncoder(
    GAMEBOY_CAMERA_WIDTH * CELL_SIZE,
    GAMEBOY_CAMERA_HEIGHT * CELL_SIZE
  );
  // stream the results as they are available into myanimated.gif
  // encoder.createReadStream().pipe(fs.createWriteStream("myanimated.gif"));

  const writableStreamBuffer = new streamBuffers.WritableStreamBuffer();
  encoder.createReadStream().pipe(writableStreamBuffer);

  encoder.start();
  encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
  const frameDelay =
    1000 /
    (FRAMES_TO_DRAW_PER_EXECUTION /
      NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS);
  encoder.setDelay(Math.floor(frameDelay));

  const canvas = createCanvas(
    GAMEBOY_CAMERA_WIDTH * CELL_SIZE,
    GAMEBOY_CAMERA_HEIGHT * CELL_SIZE
  );
  const ctx = canvas.getContext("2d");

  const frames: number[][] = JSON.parse(
    fs.readFileSync("./frames-test.json").toString()
  );
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    const isLastFrame = i === frames.length - 1;
    if (isLastFrame) {
      encoder.setDelay(1500);
    }

    renderFrame(frame, ctx as any);
    encoder.addFrame(ctx as any);
  }

  encoder.finish();

  writableStreamBuffer.on("close", async () => {
    const client = new NFTStorage({
      token: "",
    });
    const image = new Blob([writableStreamBuffer.getContents() as Buffer], {
      type: "image/gif",
    });
    const imageCid = await client.storeBlob(image);

    const metadata = JSON.stringify(
      generateMetadata(200, `https://${imageCid}.ipfs.nftstorage.link`)
    );
    const metadataBlob = new Blob([metadata]);
    const metadataCid = await client.storeBlob(metadataBlob);

    console.log(metadataCid);
  });
};

testCanvas();
