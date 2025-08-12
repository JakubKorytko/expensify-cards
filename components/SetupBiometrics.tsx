import { TouchableOpacity, View, Text } from "react-native";
import styles from "@/styles";
import { Image } from "expo-image";
import FingerIcon from "@/assets/images/finger.svg";
import { useState } from "react";
import { useBiometricsContext } from "@/scripts/BiometricsContext";

function SetupBiometrics() {
  const [reason, setReason] = useState<string>("Not requested yet");

  const Biometrics = useBiometricsContext();

  const setupBiometrics = async () => {
    const value = await Biometrics.request();
    setReason(value.reason);
  };

  return (
    <View style={styles.container}>
      <Image source={FingerIcon} style={styles.logoImage} />
      <Text style={styles.mtn25}>
        Status: {Biometrics.isConfigured ? "Configured" : "Not configured"}
        {"\n"}
        {`Last action feedback: ${reason}`}
      </Text>
      <TouchableOpacity style={styles.button} onPress={setupBiometrics}>
        <Text style={styles.buttonText}>Setup biometrics</Text>
      </TouchableOpacity>
    </View>
  );
}

SetupBiometrics.displayName = "SetupBiometrics";

export default SetupBiometrics;
