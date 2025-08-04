import { useState } from "react";
import { signToken as signTokenED25519 } from "@/scripts/ed25519";
import api from "@/api";
import { PrivateKeyStorage } from "@/scripts/keyStorage";

function useToken() {
  const [tokenData, setTokenData] = useState<{
    token: string | undefined;
    signedToken: string | undefined;
    verified: boolean;
  }>({
    token: undefined,
    signedToken: undefined,
    verified: false,
  });

  const signToken = async () => {
    const key = await PrivateKeyStorage.get();

    if (!key || !tokenData.token) {
      return new Error("Key and token are required!");
    }

    const signedToken = signTokenED25519(tokenData.token, key);

    setTokenData((prevState) => ({
      ...prevState,
      signedToken,
    }));
  };

  const requestToken = async () => {
    const apiToken = await api("/token");
    const token = await apiToken.json();

    setTokenData((prevState) => ({
      ...prevState,
      token: token.hex,
    }));
  };

  const verifySignedToken = async () => {
    if (!tokenData.token || !tokenData.signedToken) {
      return;
    }

    const { token, signedToken } = tokenData;

    const val = await api("/verify", {
      signature: signedToken,
      token: token,
    });

    const bool = (await val.text()) === "true";

    setTokenData((prevState) => ({
      ...prevState,
      verified: bool,
    }));
  };

  return {
    ...tokenData,
    sign: signToken,
    request: requestToken,
    verify: verifySignedToken,
  };
}

export default useToken;
