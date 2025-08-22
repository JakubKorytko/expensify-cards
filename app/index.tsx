import { View, Text, TouchableOpacity, TextInput } from "react-native";
import styles from "@/styles";
import { useBiometricsContext } from "@/src/BiometricsContext";
import { useState } from "react";
import { CallbackProps, MagicCodeProps } from "@/src/types";
import { getReasonMessage } from "@/src/helpers";
import CONST from "@/src/const";

function Callback({ authData, show = false, hide = () => {} }: CallbackProps) {
  if (!show) return;

  return (
    <View style={[styles.magicCodeContainer, styles.container200H]}>
      <View style={styles.gap15}>
        <Text style={styles.hugeText}>
          Authorization {authData.value ? "successful" : "failed"}
        </Text>
        <Text>{getReasonMessage(authData)}</Text>
      </View>
      <TouchableOpacity
        style={[styles.button, styles.w100Bottom, styles.greenButton]}
        onPress={hide}
      >
        <Text style={[styles.buttonText, styles.greenButtonText]}>Got it</Text>
      </TouchableOpacity>
    </View>
  );
}

function MagicCode({ callback = () => {} }: MagicCodeProps) {
  const Biometrics = useBiometricsContext();
  const [validateCode, setValidateCode] = useState("");

  if (!Biometrics.validateCodeRequired) return;

  const handleNumberChange = (text: string) =>
    setValidateCode(text.replace(/[^0-9]/g, ""));

  const proceedWithMagicCode = async () => {
    await Biometrics.request(Number(validateCode));
    callback();
  };

  return (
    <View style={styles.magicCodeContainer}>
      <View style={styles.titleWithInput}>
        <Text style={styles.magicCodeText}>
          You need to provide a magic code to proceed
        </Text>
        <TextInput
          onChangeText={handleNumberChange}
          value={validateCode}
          keyboardType="numeric"
          maxLength={6}
          style={styles.textInput}
        />
      </View>
      <TouchableOpacity
        style={[styles.button, styles.w100Bottom, styles.greenButton]}
        onPress={proceedWithMagicCode}
      >
        <Text style={[styles.buttonText, styles.greenButtonText]}>
          Authorize
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Index() {
  const Biometrics = useBiometricsContext();
  const [showCallback, setShowCallback] = useState(false);
  const statusText = Biometrics.status ? "Registered" : "Not registered";
  const testCallback = async () => {
    if (Biometrics.status) {
      await Biometrics.challenge();
      setShowCallback(true);
    } else {
      await Biometrics.request();
    }
  };

  const isModalOpened = Biometrics.validateCodeRequired || showCallback;
  const authData =
    Biometrics.feedback.lastAction === CONST.FEEDBACK_TYPE.KEY
      ? Biometrics.feedback.key
      : Biometrics.feedback.challenge;

  return (
    <View
      style={[
        styles.layoutContainer,
        isModalOpened && styles.layoutContainerMagicCode,
      ]}
    >
      <View
        style={[styles.container, isModalOpened && styles.containerMagicCode]}
      >
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
      </View>
      <MagicCode callback={() => setShowCallback(true)} />
      <Callback
        authData={authData}
        show={showCallback}
        hide={() => setShowCallback(false)}
      />
    </View>
  );
}
