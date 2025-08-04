import { useState } from "react";
import { generateKey, signToken } from "@/scripts/ed25519";
import onyxStorage from "@/scripts/onyxStorage";
import api from "@/api";

function useAuth() {
  const [key, setKey] = useState<string | undefined>(onyxStorage.publicKey);

  const keyUpdate = (key: string | undefined) => {
    setKey(key);
  };

  const requestKey = async () => {
    const generatedKey = generateKey(keyUpdate);

    if (generatedKey instanceof Error) {
      return;
    }

    const result = await api("/key", {
      key: generatedKey,
    });

    const message = await result.text();

    if (message === "Key error") {
      return;
    }

    onyxStorage.publicKey = generatedKey;
    setKey(generatedKey);
  };

  return {
    key,
    generate: requestKey,
    sign: signToken,
  };
}

export default useAuth;
