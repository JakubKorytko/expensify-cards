import { Text, TextStyle, View } from "react-native";
import useAuth from "@/scripts/useAuth";
import TokenButton from "@/components/TokenButton";
import keyStorage from "@/scripts/keyStorage";

const textStyle: TextStyle = {
  color: "white",
  fontSize: 25,
  fontWeight: "bold",
  textAlign: "center",
};

function SecretInfo() {
  const [token, requestToken] = useAuth();

  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
        width: "80%",
      }}
    >
      <View
        style={{
          display: "flex",
          gap: 15,
        }}
      >
        <Text
          style={{
            ...textStyle,
            backgroundColor: "black",
            borderRadius: 40,
            padding: 20,
          }}
        >
          Public key: {token}
        </Text>
        <Text style={textStyle}>
          Click on the button below to reveal the secret!
        </Text>
      </View>
      <TokenButton callback={requestToken} buttonText="Generate key pair" />
      <TokenButton
        callback={keyStorage.revoke}
        buttonText="Revoke token"
        containerStyle={{
          marginTop: -20,
        }}
      />
    </View>
  );
}

SecretInfo.displayName = "SecretInfo";

export default SecretInfo;
