import { useState } from "react";
import useBiometrics from "@src/hooks/useBiometrics";
import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import styles from "@/styles";
import BiometricsInfoModal from "@src/components/BiometricsInfoModal";

type BiometricsAuthenticationProps = {
  transactionID: string;
};

function BiometricsAuthentication({
  transactionID,
}: BiometricsAuthenticationProps) {
  const Biometrics = useBiometrics();
  const [showCallback, setShowCallback] = useState(false);
  const hideCallback = () => setShowCallback(false);

  const statusText = `Biometrics (${Biometrics.status ? "Registered" : "Not registered"})`;

  const onPress = () =>
    Biometrics.prompt(transactionID, true).then(() => setShowCallback(true));

  return (
    <>
      <TouchableWithoutFeedback onPress={hideCallback}>
        <View
          style={[
            styles.layoutContainer,
            showCallback && styles.layoutContainerMagicCode,
          ]}
        >
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.title}>{statusText}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={onPress}>
                  <Text style={styles.buttonText}>Test</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {showCallback && (
        <BiometricsInfoModal
          feedback={Biometrics.feedback}
          onClose={hideCallback}
        />
      )}
    </>
  );
}

BiometricsAuthentication.displayName = "BiometricsAuthentication";

export default BiometricsAuthentication;
