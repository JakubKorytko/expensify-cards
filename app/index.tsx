import { View, Text, TouchableOpacity, TextInput } from "react-native";
import styles from "@/styles";
import { useState } from "react";
import { CallbackProps, MagicCodeProps } from "@/src/types";
import { getReasonMessage } from "@/src/helpers";
import useBiometrics from "@/src/useBiometrics";

function Callback({ authData, onClose = () => {} }: CallbackProps) {
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
        onPress={onClose}
      >
        <Text style={[styles.buttonText, styles.greenButtonText]}>Got it</Text>
      </TouchableOpacity>
    </View>
  );
}

function MagicCode({ onSubmit = () => {} }: MagicCodeProps) {
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
        style={[styles.button, styles.w100Bottom, styles.greenButton]}
        onPress={() => onSubmit(Number(validateCode))}
      >
        <Text style={[styles.buttonText, styles.greenButtonText]}>
          Authorize
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Index() {
  const Biometrics = useBiometrics();
  const [showCallback, setShowCallback] = useState(false);

  const onTestPress = async () => {
    await Biometrics[Biometrics.status ? "challenge" : "request"]();
    setShowCallback(!Biometrics.validateCodeRequired);
  };

  return (
    <>
      <View
        style={[
          styles.layoutContainer,
          (Biometrics.validateCodeRequired || showCallback) &&
            styles.layoutContainerMagicCode,
        ]}
      >
        <View style={[styles.container]}>
          <View style={styles.content}>
            <Text style={styles.title}>
              Biometrics ({Biometrics.status ? "Registered" : "Not registered"})
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={onTestPress}>
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
      {Biometrics.validateCodeRequired && (
        <MagicCode
          onSubmit={(validateCode) =>
            Biometrics.request(validateCode).then(() => setShowCallback(true))
          }
        />
      )}
      {showCallback && !Biometrics.validateCodeRequired && (
        <Callback
          authData={Biometrics.feedback.lastAction.value}
          onClose={() => setShowCallback(false)}
        />
      )}
    </>
  );
}
