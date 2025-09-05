import { View, Text, TouchableOpacity, TextInput } from "react-native";
import styles from "@/styles";
import { useState } from "react";

type MagicCodeProps = {
  onSubmit: (validateCode: number) => void;
};

function BiometricsMagicCode({ onSubmit }: MagicCodeProps) {
  const [validateCode, setValidateCode] = useState("");

  return (
    <View style={styles.magicCodeContainer}>
      <View style={styles.titleWithInput}>
        <Text style={styles.magicCodeText}>
          You need to provide a magic code to proceed
        </Text>
        <TextInput
          onChangeText={(text) => setValidateCode(text)}
          value={validateCode}
          keyboardType="numeric"
          maxLength={6}
          style={styles.textInput}
        />
      </View>
      <TouchableOpacity
        style={styles.greenButton}
        onPress={() => onSubmit(Number(validateCode))}
      >
        <Text style={styles.greenButtonText}>Authorize</Text>
      </TouchableOpacity>
    </View>
  );
}

BiometricsMagicCode.displayName = "BiometricsMagicCode";

export default BiometricsMagicCode;
