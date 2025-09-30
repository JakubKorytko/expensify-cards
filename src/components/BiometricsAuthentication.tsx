import { useState } from "react";
import useBiometrics from "@hooks/useBiometrics";
import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import styles from "@/styles";
import BiometricsInfoModal from "@src/components/BiometricsInfoModal";
import CONST from "@src/CONST";
import BiometricsInputModal from "@src/components/BiometricsInputModal";
import useLocalize from "@hooks/useLocalize";

type BiometricsAuthenticationProps = {
  transactionID: string;
};

type AuthorizeWithModal = {
  validateCode?: number;
  otp?: number;
};

function BiometricsAuthentication({
  transactionID,
}: BiometricsAuthenticationProps) {
  const { translate } = useLocalize();
  const [biometrics, authorize] = useBiometrics();
  const [showModal, setShowModal] = useState<boolean>(false);

  const authorizeWithModal = async (props: AuthorizeWithModal = {}) => {
    setShowModal(false);
    await authorize({
      ...props,
      transactionID,
    });
    setShowModal(true);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
        <View
          style={[
            styles.layoutContainer,
            showModal && styles.layoutContainerWithModal,
          ]}
        >
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.title}>
                Biometrics (
                {biometrics.configured ? "Registered" : "Not registered"})
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => authorizeWithModal()}
                >
                  <Text style={styles.buttonText}>Test</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {showModal && (
        <BiometricsInfoModal
          feedback={biometrics.feedback}
          onClose={() => setShowModal(false)}
        />
      )}
      {biometrics.requiredFactor ===
        CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE && (
        <BiometricsInputModal
          onSubmit={(validateCode) => authorizeWithModal({ validateCode })}
          title={translate("biometrics.provideValidateCode")}
        />
      )}
      {biometrics.requiredFactor === CONST.BIOMETRICS.AUTH_FACTORS.OTP && (
        <BiometricsInputModal
          onSubmit={(otp) => authorizeWithModal({ otp })}
          title={translate("biometrics.provideOTPCode")}
        />
      )}
    </>
  );
}

BiometricsAuthentication.displayName = "BiometricsAuthentication";

export default BiometricsAuthentication;
