import { Text, TextStyle, View } from "react-native";
import TokenButton from "@/components/TokenButton";
import styles from "@/styles";
import useToken from "@/scripts/useToken";

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
  const { token, signedToken, verified, sign, verify, request } = useToken();

  return (
    <View style={styles.container}>
      <Text style={innerStyles.text}>Token: {token}</Text>
      <TokenButton callback={request} buttonText="Generate token" />
      <Text style={innerStyles.text}>Signed token: {signedToken}</Text>
      <TokenButton callback={sign} buttonText="Sign token" />
      <Text style={innerStyles.text}>
        Is token alright: {verified ? "YES!" : "NO!"}
      </Text>
      <TokenButton callback={verify} buttonText="Verify token" />
    </View>
  );
}

SignToken.displayName = "SignToken";

export default SignToken;
