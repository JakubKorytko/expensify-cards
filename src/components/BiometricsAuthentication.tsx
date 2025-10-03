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
import useBiometricsStatus from "@hooks/useBiometrics/useBiometricsStatus";
import useBiometricsAuthorizationFallback from "@hooks/useBiometrics/useBiometricsAuthorizationFallback";
import useBiometricsAuthorization from "@hooks/useBiometrics/useBiometricsAuthorization";

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
  // const [biometrics, authorize] = useBiometrics();
  const biometrics = useBiometricsStatus();
  // const { feedback, authorize, fulfill } = useBiometricsAuthorizationFallback();
  // const { challenge, feedback, fulfill } = useBiometricsAuthorization();
  // const [biometrics, authorize, resetSetup, fulfill] = useBiometrics();
  const [showModal, setShowModal] = useState<boolean>(false);

  const authorizeWithModal = async (props: AuthorizeWithModal = {}) => {
    setShowModal(false);

    // await biometrics.({
    //   ...props,
    // });

    await biometrics.register({
      ...props,
    });

    setShowModal(true);
  };

  console.log(biometrics);

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          biometrics.fulfill();
        }}
      >
        <View
          style={[
            styles.layoutContainer,
            showModal &&
              biometrics.isRequestFulfilled &&
              styles.layoutContainerWithModal,
          ]}
        >
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.title}>
                Biometrics ({/*{biometrics.isBiometryConfigured*/}
                {/*  ? "Registered"*/}
                {/*  : "Not registered"}*/})
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => authorizeWithModal()}
                >
                  <Text style={styles.buttonText}>Test</Text>
                </TouchableOpacity>
              </View>
              {biometrics.isBiometryConfigured && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.buttonNegativeSmall}
                    onPress={() => biometrics.resetSetup()}
                  >
                    <Text style={styles.buttonTextNegative}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {showModal && biometrics.isRequestFulfilled && (
        <BiometricsInfoModal
          message={biometrics.feedback.message}
          title={biometrics.feedback.title}
          error={!biometrics.wasRecentStepSuccessful}
          onClose={() => setShowModal(false)}
        />
      )}
      {biometrics.requiredFactorForNextStep ===
        CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE && (
        <BiometricsInputModal
          onSubmit={(validateCode) => authorizeWithModal({ validateCode })}
          title={translate("biometrics.provideValidateCode")}
        />
      )}
      {biometrics.requiredFactorForNextStep ===
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
