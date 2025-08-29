import useBiometrics from "@/r1/useBiometrics";
import { Button, Text, View } from "react-native";
import { useCallback } from "react";

export default function Index() {
  const Biometrics = useBiometrics();

  const onPress = useCallback(() => {
    if (Biometrics.status) {
      const transactionID = "162953228";
      return Biometrics.challenge(transactionID);
    }
    return Biometrics.request();
  }, [Biometrics]);

  const { message } = Biometrics.feedback.lastAction.value;

  return (
    <View>
      <Button title="Test" onPress={onPress} />
      <Text>{message}</Text>
    </View>
  );
}
