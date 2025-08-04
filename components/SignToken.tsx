import { Text, TextStyle, View } from "react-native";
import TokenButton from "@/components/TokenButton";
import { useState } from "react";
import { Bytes } from "@noble/ed25519";
import styles from "@/styles";

import useAuth from "@/scripts/useAuth";
import api from "@/api";

const innerStyles: {
  text: TextStyle;
} = {
  text: {
    ...styles.text,
    fontSize: 16,
    ...styles.textBlackBG,
  },
};

function SignToken() {
  const { sign } = useAuth();

  const [token, setToken] = useState({
    bytes: [] as unknown as Bytes,
    hex: "",
  });
  const [signedToken, setSignedToken] = useState<string | undefined>();
  const [isTokenOK, setIsTokenOK] = useState<boolean>(false);

  const generateToken = async () => {
    const token = await api("/token");
    const tokenData = await token.json();
    setToken(tokenData);
  };

  const saveSignedToken = async () => {
    if (!token.hex) return;
    const signResult = await sign(token.hex);
    if (signResult instanceof Error) return;

    setSignedToken(signResult);
  };

  const verifySignedToken = async () => {
    if (!token.hex || !signedToken) {
      return;
    }

    const val = await api("/verify", {
      signature: signedToken,
      token: token.hex,
    });

    const bool = (await val.text()) === "true";

    setIsTokenOK(bool);
  };

  return (
    <View style={styles.container}>
      <Text style={innerStyles.text}>Token: {token.hex}</Text>
      <TokenButton callback={generateToken} buttonText="Generate token" />
      <Text style={innerStyles.text}>Signed token: {signedToken}</Text>
      <TokenButton callback={saveSignedToken} buttonText="Sign token" />
      <Text style={innerStyles.text}>
        Is token alright: {isTokenOK ? "YES!" : "NO!"}
      </Text>
      <TokenButton callback={verifySignedToken} buttonText="Verify token" />
    </View>
  );
}

SignToken.displayName = "SignToken";

export default SignToken;
