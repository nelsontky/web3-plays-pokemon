import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function useIsXnft() {
  const [isXnft, setIsXnft] = useState<boolean | undefined>(undefined);
  const router = useRouter();

  useEffect(
    function checkIfIsXnft() {
      if (router.isReady) {
        setIsXnft(!!router.query.publicKey);
      }
    },
    [router.isReady, router.query.publicKey]
  );

  return isXnft;
}
