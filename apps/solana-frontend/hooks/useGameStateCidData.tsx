import axios from "axios";
import { inflate } from "pako";
import { useEffect, useState } from "react";

export default function useGameStateCidData<T>(ipfsCid: string | undefined) {
  const [data, setData] = useState<T>();

  useEffect(
    function fetchCidData() {
      if (ipfsCid !== undefined && ipfsCid.length > 0) {
        let hasUnmounted = false;

        (async () => {
          let responseData = undefined;

          while (responseData === undefined) {
            try {
              const abortControllers = [
                new AbortController(),
                new AbortController(),
              ];
              const response = await Promise.any([
                axios.get(`https://ipfs.playspokemon.xyz/ipfs/${ipfsCid}`, {
                  responseType: "arraybuffer",
                  signal: abortControllers[0].signal,
                }),
                axios.get(`/api/ipfs/${ipfsCid}`, {
                  responseType: "arraybuffer",
                  signal: abortControllers[1].signal,
                }),
              ]);
              responseData = response.data;
              abortControllers.forEach((controller) => {
                controller.abort();
              });

              if (hasUnmounted) {
                return;
              }
            } catch {
              try {
                const response = await axios.get(
                  `https://${ipfsCid}.ipfs.cf-ipfs.com`,
                  {
                    responseType: "arraybuffer",
                  }
                );
                responseData = response.data;
                if (hasUnmounted) {
                  return;
                }
              } catch {
                try {
                  const response = await axios.get(
                    `https://${ipfsCid}.ipfs.nftstorage.link/`,
                    {
                      responseType: "arraybuffer",
                    }
                  );
                  responseData = response.data;
                  if (hasUnmounted) {
                    return;
                  }
                } catch {
                  try {
                    const response = await axios.get(
                      `https://${ipfsCid}.ipfs.w3s.link/`,
                      {
                        responseType: "arraybuffer",
                      }
                    );
                    responseData = response.data;
                    if (hasUnmounted) {
                      return;
                    }
                  } catch {
                    await new Promise((resolve) => {
                      setTimeout(resolve, 500);
                    });
                  }
                }
              }
            }
          }

          const inflated = inflate(responseData, { to: "string" });
          const data: T = JSON.parse(inflated);
          setData(data);
        })();

        return () => {
          hasUnmounted = true;
        };
      }
    },
    [ipfsCid]
  );

  return data;
}
