import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";

(async () => {
  const html = (await fs.readFile("./src/pokemon-by-index.html")).toString();

  const $ = cheerio.load(html);
  const withMissingNo = $(`td > a > span[style="color:#000;"]`)
    .map((_i, element) => $(element).text())
    .toArray();

  console.log(withMissingNo);

  const results = [];
  let i = 0;
  while (i < withMissingNo.length) {
    if (withMissingNo[i] === "MissingNo.") {
      results.push(undefined);
      i++;
    } else {
      results.push(withMissingNo[i].toUpperCase());
    }
    i++;
  }

  results.unshift(undefined);

  // console.log(results);
  console.log(results.length);
  await fs.writeFile("./pokemon-index.json", JSON.stringify(results));
})();
