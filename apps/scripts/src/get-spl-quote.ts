import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
import {
  Currency,
  CurrencyAmount,
  Liquidity,
  Percent,
} from "@raydium-io/raydium-sdk";

dotenv.config();

interface Token {
  address: string; // '8f9s1sUmzUbVZMoMh6bufMueYH1u4BJSM57RCEvuVmFp',
  symbol: string; // 'TRUE',
  decimals: number;
}

const connection = new Connection(
  process.env.RPC_URL!,
  process.env.RPC_CONFIG ? JSON.parse(process.env.RPC_CONFIG) : undefined
);

const raydium = async () => {
  // const poolKeys = (await getOldKeys()).unOfficial;
  // const poolKey = poolKeys.find(
  //   (key) => key.baseMint === "5yxNbU8DgYJZNi3mPD9rs4XLh9ckXrhPjJ5VCujUWg5H"
  // );

  const poolKey = {
    id: new PublicKey("3uBZp1xVFrVCTNQbDvHeFyiMXEqm5th1vK2kGPUi3r3e"),
    baseMint: new PublicKey("5yxNbU8DgYJZNi3mPD9rs4XLh9ckXrhPjJ5VCujUWg5H"),
    quoteMint: new PublicKey("So11111111111111111111111111111111111111112"),
    lpMint: new PublicKey("7FykgSg8tjaaV7FSbTDRTKGhh4xqLwhrRxuHG6ANUSBo"),
    baseDecimals: 5,
    quoteDecimals: 9,
    lpDecimals: 5,
    version: 4,
    programId: new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"),
    authority: new PublicKey("5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1"),
    openOrders: new PublicKey("8yRRiWCaoD1u1jfiUjEKcY9wDLweUdunSaJDJ1ZhkSUR"),
    targetOrders: new PublicKey("C3VRiNGSsJzxbj49hJb9MyxwWA9TBXFgSXvp2ptjxcBB"),
    baseVault: new PublicKey("96vJHdxK3jKntoEVTRNkxVZUDuR91q1JQ2pBcr4eEXcU"),
    quoteVault: new PublicKey("4VTkBNASo9azrjBBhuggZgcgs45UqUYmGao8jtpChT1m"),
    withdrawQueue: new PublicKey(
      "963TwwhXc9YRm2BQNGWQFKpQZqTiK1tDnxk4nSDQ9RCz"
    ),
    lpVault: new PublicKey("SXqvMxbT4YBrQCQGW5t8myiiVWt8emqEP1D8PwUMWad"),
    marketVersion: 4,
    marketProgramId: new PublicKey(
      "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX"
    ),
    marketId: new PublicKey("5xS7fqZUdbSAdzrsbEWS4WJtcAwKJF3J9AtUQQrGJ4GY"),
    marketAuthority: new PublicKey(
      "XG49cbTY5thev3MHv3UYztt65Vrn9HBkPou4DP8MnbQ"
    ),
    marketBaseVault: new PublicKey(
      "DM45kckXud9abBoDEYNgdTuQYn5gzknxZG19ovT8epfx"
    ),
    marketQuoteVault: new PublicKey(
      "9zXM3VQn3Dzn7MAs5zRLWyeZDmro3hb9HjmBjsxK4Nb6"
    ),
    marketBids: new PublicKey("aKTvmMB8pbLXcR19P3ayMJWBp38bF9kFHgRy9WdjhWi"),
    marketAsks: new PublicKey("Dqv2vuZBtDPECtfTf1iyjCskTRWovcQtngHEe2ndFYNY"),
    marketEventQueue: new PublicKey(
      "2aNAQ1zMVZqWHiM9uUwwo9JSYZkjCNXVnCzmGSuAhTxZ"
    ),
    lookupTableAccount: new PublicKey(
      "CLs36tzXZ1HBMN5iBjvk7GmwXsfHLXviLcJPrPBiK4kj"
    ),
  };

  // const poolKeys = await Liquidity.fetchAllPoolKeys(connection);
  // await fs.writeFile("all-pool-keys.json", JSON.stringify(poolKeys));
  // console.log("done");

  const poolInfo = await Liquidity.fetchInfo({
    connection,
    poolKeys: poolKey,
  });

  const amountOut = new CurrencyAmount(
    Currency.SOL,
    LAMPORTS_PER_SOL * 0.000005
  );
  const currencyIn = new Currency(poolInfo.baseDecimals, "FRONK");
  const amt = Liquidity.computeAmountIn({
    amountOut,
    poolInfo,
    poolKeys: poolKey,
    slippage: new Percent(1, 100),
    currencyIn,
  });

  console.log(amt.maxAmountIn.toExact());
};

raydium();
