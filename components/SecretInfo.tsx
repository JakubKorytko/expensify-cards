import { Text, View } from "react-native";
import useAuth from "@/scripts/useAuth";
import TokenButton from "@/components/TokenButton";

function SecretInfo() {
  const [token, requestToken] = useAuth();

  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "80%",
      }}
    >
      <Text
        style={{
          marginBottom: 40,
          color: "white",
          fontSize: 25,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {token
          ? `Token: ${token}`
          : "Click on the button below to reveal the secret!"}
      </Text>
      {!!token ? (
        <TokenButton callback={global.REVOKE_TOKEN} buttonText="Revoke token" />
      ) : (
        <TokenButton callback={requestToken} buttonText="Secret Reveal" />
      )}
    </View>
  );
}

SecretInfo.displayName = "SecretInfo";

export default SecretInfo;
