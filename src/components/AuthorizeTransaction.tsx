import {View} from "react-native";
import CONST from "@src/CONST";
import useLocalize from "@hooks/useLocalize";
import styles from "@src/styles";
import Text from "./Text"
import {Pressable, PressableWithoutFeedback} from "./Pressable";
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
        <PressableWithoutFeedback accessibilityRole="button" onPress={status.cancel}>
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
                      {registered: false} /* isBiometryConfigured always false in fallback */,
                    )}
                  </Text>
                  <View style={styles.buttonContainer}>
                    <Pressable accessibilityRole="button"
                      style={styles.button}
                      onPress={() => {
                        authorize()}}
                      >
                      <Text style={styles.buttonText}>Test</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              {shouldShowSecret ? (
                <Text style={styles.hugeText}>I am the secret!</Text>
              ) : (
                <Text style={styles.hugeText}>Secret is hidden!</Text>
              )}
            </View>
          </PressableWithoutFeedback>
      )}
    </MultifactorAuthentication>
  );
}

MultifactorAuthorizationFallbackUsingWrapper.displayName =
  "MultifactorAuthorizationFallbackUsingWrapper";

export default MultifactorAuthorizationFallbackUsingWrapper;
