import { Connection, PublicKey } from "@solana/web3.js";

export default async function confirmGaslessTransaction(
  connection: Connection,
  splGasSourceTokenAccount: PublicKey
) {
  await new Promise((resolve, reject) => {
    const clientSubscriptionId = connection.onLogs(
      splGasSourceTokenAccount,
      ({ logs }) => {
        connection.removeOnLogsListener(clientSubscriptionId);
        const errorIndex = logs.findIndex((log) => log.includes("Error:"));
        if (errorIndex >= 0) {
          reject(new Error(logs[errorIndex]));
        } else {
          resolve(false);
        }
      },
      "processed"
    );
  });
}
