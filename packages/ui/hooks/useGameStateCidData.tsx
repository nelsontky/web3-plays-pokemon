import { inflate } from "pako";
import { useEffect, useState } from "react";
import fetchIpfsCid from "../utils/fetchIpfsCid";

export default function useGameStateCidData<T>(ipfsCid: string | undefined) {
  const [data, setData] = useState<T>();

  useEffect(
    function fetchCidData() {
      if (ipfsCid !== undefined && ipfsCid.length > 0) {
        let hasUnmounted = false;

        (async () => {
          const responseData = await fetchIpfsCid(ipfsCid);

          if (hasUnmounted) {
            return;
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
