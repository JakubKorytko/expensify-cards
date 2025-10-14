import { Text, TouchableOpacity, View } from "react-native";
import styles from "@/styles";

type InfoModalProps = {
  onClose?: () => void;
  title?: string;
  message?: string;
  success?: boolean;
};

function InfoModal({
  success = true,
  title,
  message,
  onClose,
}: InfoModalProps) {
  return (
    <View style={styles.callbackContainer}>
      <View style={styles.gap15}>
        <Text style={styles.hugeText}>{title}</Text>
        <Text>{message}</Text>
      </View>
      <TouchableOpacity
        style={success ? styles.greenButton : styles.buttonNegative}
        onPress={onClose}
      >
        <Text
          style={success ? styles.greenButtonText : styles.buttonTextNegative}
        >
          Got it
        </Text>
      </TouchableOpacity>
    </View>
  );
}

InfoModal.displayName = "InfoModal";

export default InfoModal;
