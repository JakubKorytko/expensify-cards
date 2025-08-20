import { View, Text, TouchableOpacity } from "react-native";
import styles from "@/styles";
import ConfirmTransaction from "@/components/ConfirmTransaction";
import SetupBiometrics from "@/components/SetupBiometrics";
import { useBiometricsContext } from "@/components/BiometricsContext";

export default function Index() {
  const Biometrics = useBiometricsContext();

  return (
    <View style={styles.layoutContainer}>
      <View style={styles.floatingButton}>
        <TouchableOpacity onPress={Biometrics.revoke}>
          <Text style={styles.whiteText}>Remove keys from SecureStore</Text>
        </TouchableOpacity>
      </View>
      <SetupBiometrics />
      <ConfirmTransaction />
    </View>
  );
}
