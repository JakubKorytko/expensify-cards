import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import styles from "@/styles";
import CONST from "@src/CONST";
import useLocalize from "@hooks/useLocalize";
import BiometricsFallback from "@/src/components/BiometricsFallback";

type BiometricsAuthenticationFallbackUsingWrapperProps = {
  transactionID: string;
};

function BiometricsAuthenticationFallbackUsingWrapper({
  transactionID,
}: BiometricsAuthenticationFallbackUsingWrapperProps) {
  const { translate } = useLocalize();

  return (
    <BiometricsFallback
      scenario={CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_FALLBACK}
      params={{ transactionID }}
    >
      <BiometricsFallback.Content>
        {(secret, authorize, status) => (
          <>
            <TouchableWithoutFeedback onPress={status.cancel}>
              <View
                style={[
                  styles.layoutContainer,
                  status.isModalShown &&
                    (status.isRequestFulfilled ||
                      status.requiredFactorForNextStep) &&
                    styles.layoutContainerWithModal,
                ]}
              >
                <View style={styles.container}>
                  <View style={styles.content}>
                    <Text style={styles.title}>
                      {translate(
                        "biometrics.title",
                        false /* isBiometryConfigured always false in fallback */,
                      )}
                    </Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => authorize()}
                      >
                        <Text style={styles.buttonText}>Test</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                {secret}
              </View>
            </TouchableWithoutFeedback>
          </>
        )}
      </BiometricsFallback.Content>
      <BiometricsFallback.Secret>
        {(shouldShowSecret) =>
          shouldShowSecret ? (
            <Text style={styles.hugeText}>I am the secret!</Text>
          ) : (
            <Text style={styles.hugeText}>Secret is hidden!</Text>
          )
        }
      </BiometricsFallback.Secret>
    </BiometricsFallback>
  );
}

BiometricsAuthenticationFallbackUsingWrapper.displayName =
  "BiometricsAuthenticationFallbackUsingWrapper";

export default BiometricsAuthenticationFallbackUsingWrapper;
