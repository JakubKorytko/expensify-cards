import useBiometrics from "@src/hooks/useBiometrics";
import { Button, Text, View } from "react-native";

type BiometricsAuthenticationProps = {
  transactionID: string;
};

function BiometricsAuthentication({
  transactionID,
}: BiometricsAuthenticationProps) {
  const Biometrics = useBiometrics();

  return (
    <View>
      <Button title="Test" onPress={() => Biometrics.prompt(transactionID)} />
      <Text>{Biometrics.feedback.message}</Text>
    </View>
  );
}

BiometricsAuthentication.displayName = "BiometricsAuthentication";

export default BiometricsAuthentication;
