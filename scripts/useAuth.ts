import { useState } from "react";
import generateKey from "@/scripts/generateKey";

function useAuth() {
  const [token, setToken] = useState<string | undefined>(undefined);

  const tokenUpdate = (token: string | undefined) => {
    setToken(token);
  };

  const requestToken = () => {
    setToken(generateKey(tokenUpdate));
  };

  return [token, requestToken] as [string | undefined, () => void];
}

export default useAuth;
