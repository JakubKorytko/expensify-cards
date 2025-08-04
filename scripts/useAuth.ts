import { useEffect, useState } from "react";
import { generateKeys, signToken as signTokenED25519 } from "@/scripts/ed25519";
import api from "@/api";
import { PrivateKeyStorage, PublicKeyStorage } from "@/scripts/keyStorage";

function useAuth() {
  const [key, setKey] = useState<string | undefined>();

  useEffect(() => {
    PublicKeyStorage.get().then((key) => {
      setKey(key ? key : undefined);
    });
  });

  const requestKey = async () => {
    const { privateKey, publicKey } = await generateKeys();

    const setResult = await PrivateKeyStorage.set(privateKey);

    if (!setResult) {
      return new Error("Key is already stored!");
    }

    const result = await api("/key", {
      key: publicKey,
    });

    const message = await result.text();

    if (message === "Key error") {
      return;
    }

    await PublicKeyStorage.set(publicKey);
    setKey(publicKey);
  };

  const signToken = async (token: string) => {
    const key = await PrivateKeyStorage.get();

    if (!key) {
      return new Error("Key is required!");
    }

    return signTokenED25519(token, key);
  };

  const revokeKey = async () => {
    await PrivateKeyStorage.delete();
    await PublicKeyStorage.delete();
    await api.revokeKey();
  };

  return {
    key,
    generate: requestKey,
    sign: signToken,
    revoke: revokeKey,
  };
}

export default useAuth;
