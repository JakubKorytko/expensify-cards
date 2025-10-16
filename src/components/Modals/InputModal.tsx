import { View, TextInput } from "react-native";
import { useState } from "react";
import {Pressable} from "@src/components/Pressable"
import Text from "@src/components/Text"
import styles from "@src/styles";

type InputModalProps = {
  onSubmit: (validateCode: number) => void;
  title: string;
};

function InputModal({ onSubmit, title }: InputModalProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.hugeText}>{title}</Text>
      <View style={styles.innerInputContainer}>
        <TextInput accessibilityLabel="Text input field"
          onChangeText={(text) => setInputValue(text)}
          value={inputValue}
          keyboardType="numeric"
          inputMode="numeric"
          maxLength={6}
          style={styles.textInput}
        />
        <Pressable accessibilityRole="button"
          style={styles.greenButton}
          onPress={() => onSubmit(Number(inputValue))}
        >
          <Text style={styles.greenButtonText}>Authorize</Text>
        </Pressable>
      </View>
    </View>
  );
}

InputModal.displayName = "InputModal";

export default InputModal;
