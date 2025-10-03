import { useCallback, useState } from "react";
import type {
  BiometricsAuthorizationParams,
  BiometricsStatus,
  BiometricsStep,
} from "@hooks/useBiometrics/types";
import { BiometricsPublicKeyStore } from "@libs/Biometrics/BiometricsKeyStore";
import CONST from "@src/CONST";
import BiometricsChallenge from "@libs/Biometrics/BiometricsChallenge";
import useBiometricsFeedback, {
  useSingleBiometricsFeedback,
} from "@hooks/useBiometrics/useBiometricsFeedback";
import { BiometricsAuthFactor } from "@libs/Biometrics/types";

function useBiometricsAuthorization() {
  const [feedback, setFeedback] = useSingleBiometricsFeedback<BiometricsStep>(
    {
      wasRecentStepSuccessful: undefined,
      requiredFactorForNextStep: undefined,
      isRequestFulfilled: true,
    },
    CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE,
    (feedbackValue) => !!feedbackValue.value.wasRecentStepSuccessful,
  );

  /**
   * Internal method to request, sign and verify biometrics challenge.
   * Validate code is only needed if the device is not configured for biometrics, or it is re-registering.
   * The chainedPrivateKeyStatus parameter can be used to provide the private key if it was already obtained,
   * to avoid displaying the authentication prompt twice.
   *
   * IMPORTANT: Using this method will display authentication prompt if the chainedPrivateKeyStatus is not provided
   */
  const challenge = useCallback(
    ({
      transactionID,
      validateCode,
      chainedPrivateKeyStatus,
    }: {
      transactionID: string;
      validateCode?: number;
      chainedPrivateKeyStatus?: BiometricsStatus<string | null>;
    }) => {
      const challenge = new BiometricsChallenge(transactionID);

      return (
        challenge
          /** Ask for the challenge */
          .request()
          .then((status) => {
            if (!status.value) throw status;
            /** If it is ok, sign it */
            return challenge.sign(chainedPrivateKeyStatus);
          })
          .then((signature) => {
            if (!signature.value) throw signature;
            /** Signed correctly? Send it to verify */
            return challenge.send(validateCode);
          })
          .then((result) => {
            /** Everything ok, let's return the feedback */
            return setFeedback({
              ...result,
              value: {
                wasRecentStepSuccessful: result.value,
                isRequestFulfilled: true,
                requiredFactorForNextStep: undefined,
              },
            });
          })
          .catch((status) => {
            /** Oops, something went wrong, let's return the feedback */
            return setFeedback((prevFeedback) => ({
              ...prevFeedback,
              ...status,
              value: {
                wasRecentStepSuccessful: false,
                isRequestFulfilled: true,
                requiredFactorForNextStep: undefined,
              },
            }));
          })
      );
    },
    [setFeedback],
  );

  const fulfill = useCallback(() => {
    return setFeedback((prevFeedback) => ({
      ...prevFeedback,
      value: {
        isRequestFulfilled: true,
        requiredFactorForNextStep: undefined,
        wasRecentStepSuccessful:
          !prevFeedback.value.requiredFactorForNextStep &&
          prevFeedback.value.wasRecentStepSuccessful,
      },
    }));
  }, [setFeedback]);

  return { feedback, challenge, fulfill } as const;
}

export default useBiometricsAuthorization;
