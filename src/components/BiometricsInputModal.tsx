import { View, Text, TouchableOpacity, TextInput } from "react-native";
import styles from "@/styles";
import { useState } from "react";

type InputModalProps = {
  onSubmit: (validateCode: number) => void;
  title: string;
};

function BiometricsInputModal({ onSubmit, title }: InputModalProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <View style={styles.callbackContainer}>
      <View style={styles.gap15}>
        <Text style={styles.hugeText}>{title}</Text>
        <TextInput
          onChangeText={(text) => setInputValue(text)}
          value={inputValue}
          keyboardType="numeric"
          inputMode="numeric"
          maxLength={6}
          style={styles.textInput}
        />
      </View>
      <TouchableOpacity
        style={styles.greenButton}
        onPress={() => onSubmit(Number(inputValue))}
      >
        <Text style={styles.greenButtonText}>Authorize</Text>
      </TouchableOpacity>
    </View>
  );
}

BiometricsInputModal.displayName = "BiometricsInputModal";

export default BiometricsInputModal;
