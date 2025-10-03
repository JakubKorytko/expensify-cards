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
import useBiometricsAuthentication from "../hooks/useBiometricsAuthentication";

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
  const [status, methods] = useBiometricsAuthentication();
  const [showModal, setShowModal] = useState<boolean>(false);

  const authorizeWithModal = async (props: AuthorizeWithModal = {}) => {
    setShowModal(false);

    await methods.register({
      ...props,
    });

    setShowModal(true);
  };

  console.log(status);

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          methods.fulfill();
        }}
      >
        <View
          style={[
            styles.layoutContainer,
            showModal &&
              (status.isRequestFulfilled || status.requiredFactorForNextStep) &&
              styles.layoutContainerWithModal,
          ]}
        >
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.title}>
                {translate("biometrics.title", status.isBiometryConfigured)}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => authorizeWithModal()}
                >
                  <Text style={styles.buttonText}>Test</Text>
                </TouchableOpacity>

                {status.isBiometryConfigured && (
                  <TouchableOpacity
                    style={styles.buttonNegativeSmall}
                    onPress={() => methods.resetSetup()}
                  >
                    <Text style={styles.buttonTextNegative}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {showModal && status.isRequestFulfilled && (
        <BiometricsInfoModal
          message={status.message}
          title={status.title}
          success={status.wasRecentStepSuccessful}
          onClose={() => setShowModal(false)}
        />
      )}
      {status.requiredFactorForNextStep ===
        CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE && (
        <BiometricsInputModal
          onSubmit={(validateCode) => authorizeWithModal({ validateCode })}
          title={translate("biometrics.provideValidateCode")}
        />
      )}
      {status.requiredFactorForNextStep ===
        CONST.BIOMETRICS.AUTH_FACTORS.OTP && (
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
