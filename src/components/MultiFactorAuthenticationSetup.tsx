import { useState } from "react";
import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import styles from "@/styles";
import InfoModal from "@src/components/Modals/InfoModal";
import CONST from "@src/CONST";
import InputModal from "@src/components/Modals/InputModal";
import useLocalize from "@hooks/useLocalize";
import useBiometricsSetup from "@hooks/useMultiAuthentication/useBiometricsSetup";

function BiometricsSetup() {
  const { translate } = useLocalize();
  const BiometricsSetup = useBiometricsSetup();
  const [showModal, setShowModal] = useState<boolean>(false);

  const authorizeWithModal = async (validateCode?: number) => {
    setShowModal(false);

    await BiometricsSetup.register({
      validateCode,
    });

    setShowModal(true);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={BiometricsSetup.cancel}>
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
                  "multiFactorAuthentication.title",
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
        <InfoModal
          message={BiometricsSetup.message}
          title={BiometricsSetup.title}
          success={BiometricsSetup.wasRecentStepSuccessful}
          onClose={() => setShowModal(false)}
        />
      )}
      {BiometricsSetup.requiredFactorForNextStep ===
        CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE && (
        <InputModal
          onSubmit={(validateCode) => authorizeWithModal(validateCode)}
          title={translate("multiFactorAuthentication.provideValidateCode")}
        />
      )}
    </>
  );
}

BiometricsSetup.displayName = "BiometricsSetup";

export default BiometricsSetup;
