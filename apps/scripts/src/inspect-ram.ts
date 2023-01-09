import * as pako from "pako";
import axios from "axios";
import fs from "fs/promises";

(async () => {
  // const response = await axios.get(
  //   `https://bafkreicpelsvblz74yuomt6rox5ibuvwc3ro47x7gkx6v7w6axdqqp22wm.ipfs.cf-ipfs.com`,
  //   {
  //     responseType: "arraybuffer",
  //   }
  // );

  // const inflated = pako.inflate(response.data, { to: "string" });
  // await fs.writeFile("./state.json", inflated);
  // const saveState = JSON.parse(inflated);
  // console.log(saveState);

  const file = await fs.readFile("./state.json");
  const saveState = JSON.parse(file.toString());
  // console.log(saveState);

  const gbMemory = Uint8Array.from(saveState.gameboyMemory);

  for (let i = 0; i < gbMemory.length; i++) {
    if (
      gbMemory[i] === 0x91 &&
      gbMemory[i + 1] === 0x84 &&
      gbMemory[i + 2] === 0x83 &&
      gbMemory[i + 3] === 0x50
    ) {
      console.log(i);
    }
  }

  // https://datacrystal.romhacking.net/wiki/Pok%C3%A9mon_Red/Blue:RAM_map#Player

  // player name: https://bulbapedia.bulbagarden.net/wiki/Character_encoding_(Generation_I)
  console.log(gbMemory.slice(0xd158 - 0x8000, 0xd158 - 0x8000 + 10));

  // pokemon 1: https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_index_number_(Generation_I)
  console.log(gbMemory.slice(0xd164 - 0x8000, 0xd165 - 0x8000));

  // pokemon 1: level
  console.log(gbMemory.slice(0xd18c - 0x8000, 0xd18d - 0x8000));

  // text delay (?)
  console.log(gbMemory[0xd358 - 0x8000]);
})();
