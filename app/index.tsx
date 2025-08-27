import useBiometrics from "@/r1/useBiometrics";
import { Button, Text, View } from "react-native";
import { useCallback } from "react";

export default function Index() {
  const Biometrics = useBiometrics();

  const onPress = useCallback(async () => {
    if (Biometrics.status) {
      return await Biometrics.challenge(String(512_122_950));
    }
    await Biometrics.request();
  }, [Biometrics]);

  const lastAction = Biometrics.feedback.lastAction.value;

  return (
    <View>
      <Button title="Test" onPress={onPress} />
      <Text>{lastAction.message}</Text>
    </View>
  );
}
