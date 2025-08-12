import { TouchableOpacity, View, Text } from "react-native";
import styles from "@/styles";
import { Image } from "expo-image";
import LockIcon from "@/assets/images/lock.svg";
import { useState } from "react";
import { useBiometricsContext } from "@/scripts/BiometricsContext";

function ConfirmTransaction() {
  const [status, setStatus] = useState<string>("Not requested yet");

  const Biometrics = useBiometricsContext();

  const confirmTransaction = async () => {
    const signResult = await Biometrics.signToken();
    setStatus(signResult.reason);
  };

  return (
    <View style={styles.container}>
      <Image source={LockIcon} style={styles.logoImage} />
      <Text style={styles.mtn25}>Status: {status}</Text>
      <TouchableOpacity style={styles.button} onPress={confirmTransaction}>
        <Text style={styles.buttonText}>Confirm transaction</Text>
      </TouchableOpacity>
    </View>
  );
}

ConfirmTransaction.displayName = "ConfirmTransaction";

export default ConfirmTransaction;
