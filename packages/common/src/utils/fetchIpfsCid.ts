import axios from "axios";

export async function fetchIpfsCid(ipfsCid: string) {
  let responseData = undefined;

  while (responseData === undefined) {
    try {
      const abortControllers = [new AbortController(), new AbortController()];
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
    } catch {
      try {
        const response = await axios.get(
          `https://${ipfsCid}.ipfs.cf-ipfs.com`,
          {
            responseType: "arraybuffer",
          }
        );
        responseData = response.data;
      } catch {
        try {
          const response = await axios.get(
            `https://${ipfsCid}.ipfs.nftstorage.link/`,
            {
              responseType: "arraybuffer",
            }
          );
          responseData = response.data;
        } catch {
          try {
            const response = await axios.get(
              `https://${ipfsCid}.ipfs.w3s.link/`,
              {
                responseType: "arraybuffer",
              }
            );
            responseData = response.data;
          } catch {
            await new Promise((resolve) => {
              setTimeout(resolve, 500);
            });
          }
        }
      }
    }
  }

  return responseData;
}
