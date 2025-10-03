import { useCallback } from "react";
import type {
  BiometricsStatus,
  BiometricsStep,
} from "@hooks/useBiometrics/types";
import CONST from "@src/CONST";
import BiometricsChallenge from "@libs/Biometrics/BiometricsChallenge";
import useBiometricsStatus from "../useBiometricsStatus";

function useBiometricsAuthorization() {
  const [status, setStatus] = useBiometricsStatus<BiometricsStep>(
    {
      wasRecentStepSuccessful: undefined,
      requiredFactorForNextStep: undefined,
      isRequestFulfilled: true,
    },
    CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE,
    (statusValue) => !!statusValue.value.wasRecentStepSuccessful,
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
            /** Everything ok, let's return the status */
            return setStatus({
              ...result,
              value: {
                wasRecentStepSuccessful: result.value,
                isRequestFulfilled: true,
                requiredFactorForNextStep: undefined,
              },
            });
          })
          .catch((status) => {
            /** Oops, something went wrong, let's return the status */
            return setStatus((prevStatus) => ({
              ...prevStatus,
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
    [setStatus],
  );

  const fulfill = useCallback(() => {
    return setStatus((prevStatus) => ({
      ...prevStatus,
      value: {
        isRequestFulfilled: true,
        requiredFactorForNextStep: undefined,
        wasRecentStepSuccessful:
          !prevStatus.value.requiredFactorForNextStep &&
          prevStatus.value.wasRecentStepSuccessful,
      },
    }));
  }, [setStatus]);

  return { status, challenge, fulfill } as const;
}

export default useBiometricsAuthorization;
