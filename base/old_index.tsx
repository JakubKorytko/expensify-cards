import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import styles from "@/styles";
import { useState } from "react";
import { CallbackProps, MagicCodeProps } from "@/base/types";
import useBiometrics from "@/base/useBiometrics";

function Callback({ authData: { value, message }, onClose }: CallbackProps) {
  return (
    <View style={styles.callbackContainer}>
      <View style={styles.gap15}>
        <Text style={styles.hugeText}>
          Authorization {value ? "successful" : "failed"}
        </Text>
        <Text>{message}</Text>
      </View>
      <TouchableOpacity style={styles.greenButton} onPress={onClose}>
        <Text style={styles.greenButtonText}>Got it</Text>
      </TouchableOpacity>
    </View>
  );
}

function MagicCode({ onSubmit }: MagicCodeProps) {
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

export default function Index() {
  const Biometrics = useBiometrics();
  const [showCallback, setShowCallback] = useState(false);
  const hideCallback = () => setShowCallback(false);

  const isModalShown = Biometrics.validateCodeRequired || showCallback;

  const statusText = `Biometrics (${Biometrics.status ? "Registered" : "Not registered"})`;

  const passValidateCode = async (validateCode: number) => {
    await Biometrics.request(validateCode);
    setShowCallback(true);
  };

  const runTest = async () => {
    const biometricsNextStep = Biometrics.status ? "challenge" : "request";
    await Biometrics[biometricsNextStep]();
    setShowCallback(!Biometrics.validateCodeRequired);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={hideCallback}>
        <View
          style={[
            styles.layoutContainer,
            isModalShown && styles.layoutContainerMagicCode,
          ]}
        >
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.title}>{statusText}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={runTest}>
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
        </View>
      </TouchableWithoutFeedback>
      {Biometrics.validateCodeRequired && (
        <MagicCode onSubmit={passValidateCode} />
      )}
      {showCallback && !Biometrics.validateCodeRequired && (
        <Callback
          authData={Biometrics.feedback.lastAction.value}
          onClose={hideCallback}
        />
      )}
    </>
  );
}
