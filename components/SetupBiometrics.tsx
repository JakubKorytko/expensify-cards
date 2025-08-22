import { TouchableOpacity, View, Text } from "react-native";
import styles from "@/styles";
import { Image } from "expo-image";
import FingerIcon from "@/assets/images/finger.svg";
import { useBiometricsContext } from "@/components/BiometricsContext";

function SetupBiometrics() {
  const Biometrics = useBiometricsContext();

  return (
    <View style={styles.container}>
      <Image source={FingerIcon} style={styles.logoImage} />
      <Text style={styles.mtn25}>
        Status: {Biometrics.status ? "Configured" : "Not configured"}
        {"\n"}
        {`Last action feedback: ${Biometrics.feedback.key.reason}`}
        {"\n"}
        {Biometrics.feedback.key.authTypeMessage &&
          `Auth method: ${Biometrics.feedback.key.authTypeMessage}`}
      </Text>
      <TouchableOpacity style={styles.button} onPress={Biometrics.request}>
        <Text style={styles.buttonText}>Setup biometrics</Text>
      </TouchableOpacity>
    </View>
  );
}

SetupBiometrics.displayName = "SetupBiometrics";

export default SetupBiometrics;
