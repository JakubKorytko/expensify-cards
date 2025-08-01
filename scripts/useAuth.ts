import { useState } from "react";

declare global {
  function REVOKE_TOKEN(): void;
}

const TOKEN = "abcdefghijklmnopqrst";

function useAuth() {
  const [token, setToken] = useState<string | undefined>(undefined);

  global.REVOKE_TOKEN = () => {
    setToken(undefined);
  };

  const requestToken = () => {
    setToken(TOKEN);
  };

  return [token, requestToken] as [string | undefined, () => void];
}

export default useAuth;
