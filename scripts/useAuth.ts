import { useState } from "react";
import { generateKey } from "@/scripts/ed25519";
import onyxStorage from "@/scripts/onyxStorage";

function useAuth() {
  const [token, setToken] = useState<string | undefined>(undefined);

  const tokenUpdate = (token: string | undefined) => {
    setToken(token);
  };

  const requestToken = () => {
    const generatedToken = generateKey(tokenUpdate);
    onyxStorage.publicKey = generatedToken;
    setToken(generatedToken);
  };

  return [token, requestToken] as [string | undefined, () => void];
}

export default useAuth;
