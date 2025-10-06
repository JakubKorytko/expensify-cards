import { useState } from "react";
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
import useBiometricsSetup from "../hooks/useBiometricsSetup";

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
  const BiometricsSetup = useBiometricsSetup();
  const [showModal, setShowModal] = useState<boolean>(false);

  const authorizeWithModal = async (props: AuthorizeWithModal = {}) => {
    setShowModal(false);

    await BiometricsSetup.register({
      ...props,
    });

    setShowModal(true);
  };

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          BiometricsSetup.revoke();
        }}
      >
        <View
          style={[
            styles.layoutContainer,
            showModal &&
              (BiometricsSetup.isRequestFulfilled ||
                BiometricsSetup.requiredFactorForNextStep) &&
              styles.layoutContainerWithModal,
          ]}
        >
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.title}>
                {translate(
                  "biometrics.title",
                  BiometricsSetup.isBiometryConfigured,
                )}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => authorizeWithModal()}
                >
                  <Text style={styles.buttonText}>Test</Text>
                </TouchableOpacity>

                {BiometricsSetup.isBiometryConfigured && (
                  <TouchableOpacity
                    style={styles.buttonNegativeSmall}
                    onPress={() => BiometricsSetup.revoke()}
                  >
                    <Text style={styles.buttonTextNegative}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {showModal && BiometricsSetup.isRequestFulfilled && (
        <BiometricsInfoModal
          message={BiometricsSetup.message}
          title={BiometricsSetup.title}
          success={BiometricsSetup.wasRecentStepSuccessful}
          onClose={() => setShowModal(false)}
        />
      )}
      {BiometricsSetup.requiredFactorForNextStep ===
        CONST.BIOMETRICS.FACTORS.VALIDATE_CODE && (
        <BiometricsInputModal
          onSubmit={(validateCode) => authorizeWithModal({ validateCode })}
          title={translate("biometrics.provideValidateCode")}
        />
      )}
      {BiometricsSetup.requiredFactorForNextStep ===
        CONST.BIOMETRICS.FACTORS.OTP && (
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
