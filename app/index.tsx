import useBiometrics from "@/src/hooks/useBiometrics";
import { Button, Text, View } from "react-native";

const transactionID = "162953228";

export default function Index() {
  const Biometrics = useBiometrics();

  return (
    <View>
      <Button title="Test" onPress={() => Biometrics.prompt(transactionID)} />
      <Text>{Biometrics.feedback.message}</Text>
    </View>
  );
}
