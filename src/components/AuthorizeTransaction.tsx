import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import styles from "@/styles";
import CONST from "@src/CONST";
import useLocalize from "@hooks/useLocalize";
import MultifactorAuthentication from "./MultifactorAuthentication";

type MultifactorAuthorizationFallbackUsingWrapperProps = {
  transactionID: string;
};

function MultifactorAuthorizationFallbackUsingWrapper({
  transactionID,
}: MultifactorAuthorizationFallbackUsingWrapperProps) {
  const { translate } = useLocalize();

  return (
    <MultifactorAuthentication
      scenario={
        CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION
      }
      params={{ transactionID }}
    >
      {(shouldShowSecret, authorize, status) => (
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
                      "multifactorAuthentication.title",
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
              {shouldShowSecret ? (
                <Text style={styles.hugeText}>I am the secret!</Text>
              ) : (
                <Text style={styles.hugeText}>Secret is hidden!</Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </>
      )}
    </MultifactorAuthentication>
  );
}

MultifactorAuthorizationFallbackUsingWrapper.displayName =
  "MultifactorAuthorizationFallbackUsingWrapper";

export default MultifactorAuthorizationFallbackUsingWrapper;
