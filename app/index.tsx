import { View, Text, TouchableOpacity, TextInput } from "react-native";
import styles from "@/styles";
import { useBiometricsContext } from "@/src/BiometricsContext";
import { useState } from "react";

function MagicCode() {
  const Biometrics = useBiometricsContext();
  const [validateCode, setValidateCode] = useState("");

  if (!Biometrics.validateCodeRequired) return;

  const handleNumberChange = (text: string) =>
    setValidateCode(text.replace(/[^0-9]/g, ""));

  return (
    <View style={styles.magicCodeContainer}>
      <Text>You need to provide a magic code to proceed</Text>
      <TextInput
        onChangeText={handleNumberChange}
        value={validateCode}
        keyboardType="numeric"
        style={styles.textInput}
      />
      <TouchableOpacity
        style={[styles.button, styles.w80]}
        onPress={() => Biometrics.request(Number(validateCode))}
      >
        <Text style={styles.buttonText}>Authorize</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Index() {
  const Biometrics = useBiometricsContext();
  const statusText = Biometrics.status ? "Registered" : "Not registered";
  const testCallback = () => {
    if (Biometrics.status) Biometrics.challenge();
    else Biometrics.request();
  };

  return (
    <View style={styles.layoutContainer}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Biometrics ({statusText})</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={testCallback}>
              <Text style={styles.buttonText}>Test</Text>
            </TouchableOpacity>
            {Biometrics.status && (
              <TouchableOpacity
                style={styles.buttonNegative}
                onPress={Biometrics.revoke}
              >
                <Text style={styles.buttonTextNegative}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <MagicCode />
      </View>
    </View>
  );
}
