import { Text, TouchableOpacity, View } from "react-native";
import styles from "@/styles";
import { Feedback } from "@hooks/useBiometrics/types";

type BiometricsInfoModalProps = {
  onClose?: () => void;
  feedback: Feedback;
};

function BiometricsInfoModal({
  feedback: { title, message, value },
  onClose,
}: BiometricsInfoModalProps) {
  return (
    <View style={styles.callbackContainer}>
      <View style={styles.gap15}>
        <Text style={styles.hugeText}>{title}</Text>
        <Text>{message}</Text>
      </View>
      <TouchableOpacity
        style={value ? styles.greenButton : styles.buttonNegative}
        onPress={onClose}
      >
        <Text
          style={value ? styles.greenButtonText : styles.buttonTextNegative}
        >
          Got it
        </Text>
      </TouchableOpacity>
    </View>
  );
}

BiometricsInfoModal.displayName = "BiometricsInfoModal";

export default BiometricsInfoModal;
