import { Text, TextStyle, View, ViewStyle } from "react-native";
import useAuth from "@/scripts/useAuth";
import TokenButton from "@/components/TokenButton";
import { useRouter } from "expo-router";
import styles from "@/styles";

const innerStyles: {
  container: ViewStyle;
  text: TextStyle;
  mtn20: ViewStyle;
  bgRed: ViewStyle;
} = {
  container: {
    display: "flex",
    gap: 15,
  },
  text: {
    ...styles.text,
    backgroundColor: "black",
    borderRadius: 40,
    padding: 20,
  },
  mtn20: {
    marginTop: -20,
  },
  bgRed: {
    backgroundColor: "red",
  },
};

function SecretInfo() {
  const { key, generate, revoke } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={innerStyles.container}>
        <Text style={innerStyles.text}>Public key: {key}</Text>
        <Text style={styles.text}>
          Click on the button below to reveal the secret!
        </Text>
      </View>
      <TokenButton
        callback={generate}
        buttonText="Generate key pair"
        containerStyle={!!key ? innerStyles.bgRed : undefined}
      />
      <TokenButton
        callback={revoke}
        buttonText="Revoke token"
        containerStyle={innerStyles.mtn20}
      />
      {!!key && (
        <TokenButton
          callback={() => router.navigate("/signToken")}
          buttonText="Sign a token"
          containerStyle={innerStyles.mtn20}
        />
      )}
    </View>
  );
}

SecretInfo.displayName = "SecretInfo";

export default SecretInfo;
