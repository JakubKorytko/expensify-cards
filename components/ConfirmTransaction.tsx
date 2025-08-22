import { TouchableOpacity, View, Text } from "react-native";
import styles from "@/styles";
import { Image } from "expo-image";
import LockIcon from "@/assets/images/lock.svg";
import { useBiometricsContext } from "@/components/BiometricsContext";

function ConfirmTransaction() {
  const Biometrics = useBiometricsContext();

  return (
    <View style={styles.container}>
      <Image source={LockIcon} style={styles.logoImage} />
      <Text style={styles.mtn25}>
        Status: {Biometrics.feedback.challenge.reason}
      </Text>
      <TouchableOpacity style={styles.button} onPress={Biometrics.challenge}>
        <Text style={styles.buttonText}>Confirm transaction</Text>
      </TouchableOpacity>
    </View>
  );
}

ConfirmTransaction.displayName = "ConfirmTransaction";

export default ConfirmTransaction;
