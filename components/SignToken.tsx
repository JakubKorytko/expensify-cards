import { Text, TextStyle, View } from "react-native";
import TokenButton from "@/components/TokenButton";
import { useState } from "react";
import { randomToken, signToken, verifyToken } from "@/scripts/ed25519";
import { Bytes } from "@noble/ed25519";
import styles from "@/styles";
import onyxStorage from "@/scripts/onyxStorage";

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
  const [token, setToken] = useState({
    bytes: [] as unknown as Bytes,
    hex: "",
  });
  const [signedToken, setSignedToken] = useState<string | undefined>();
  const [isTokenOK, setIsTokenOK] = useState<boolean>(false);

  const { publicKey } = onyxStorage;

  const generateToken = () => {
    setToken(randomToken());
  };

  const saveSignedToken = () => {
    if (!token.hex) return;
    setSignedToken(signToken(token.hex));
  };

  const verifySignedToken = () => {
    if (!token.hex || !signedToken || !publicKey) {
      return;
    }

    setIsTokenOK(verifyToken(signedToken, token.hex, publicKey));
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
