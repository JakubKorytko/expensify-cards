import { Text, TouchableOpacity, View } from "react-native";
import styles from "@/styles";
import { BiometricsStep, SingleFeedback } from "@hooks/useBiometrics/types";

type BiometricsInfoModalProps = {
  onClose?: () => void;
  title?: string;
  message?: string;
  error?: boolean;
};

function BiometricsInfoModal({
  error = false,
  title,
  message,
  onClose,
}: BiometricsInfoModalProps) {
  return (
    <View style={styles.callbackContainer}>
      <View style={styles.gap15}>
        <Text style={styles.hugeText}>{title}</Text>
        <Text>{message}</Text>
      </View>
      <TouchableOpacity
        style={!error ? styles.greenButton : styles.buttonNegative}
        onPress={onClose}
      >
        <Text
          style={!error ? styles.greenButtonText : styles.buttonTextNegative}
        >
          Got it
        </Text>
      </TouchableOpacity>
    </View>
  );
}

BiometricsInfoModal.displayName = "BiometricsInfoModal";

export default BiometricsInfoModal;
