import { useCallback } from "react";
import CONST from "@src/CONST";
import BiometricsChallenge from "@libs/Biometrics/BiometricsChallenge";
import useBiometricsStatus from "../useBiometricsStatus";
import { BiometricsAuthorization } from "./types";
import { createAuthorizeErrorStatus } from "./helpers";

/**
 * Hook that manages biometric authorization for transactions.
 * 
 * Handles the complete authorization flow including:
 * - Requesting a challenge from the server
 * - Signing the challenge with biometric authentication
 * - Verifying the signature with the server
 * 
 * Returns current authorization status and methods to control the flow.
 */
function useBiometricsAuthorization() {
  const [status, setStatus] = useBiometricsStatus(
    false,
    CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE,
  );

  /**
   * Requests, signs and verifies a biometric challenge for transaction authorization.
   * 
   * Can accept a validate code for devices without biometrics or during re-registration.
   * Can accept a previously obtained private key status to avoid duplicate auth prompts.
   * 
   * Will trigger a biometric authentication prompt if no private key status is provided.
   */
  const authorize: BiometricsAuthorization = useCallback(
    async ({ transactionID, validateCode, chainedPrivateKeyStatus }) => {
      const challenge = new BiometricsChallenge(transactionID);

      const requestStatus = await challenge.request();
      if (!requestStatus.value) setStatus(createAuthorizeErrorStatus(requestStatus));

      const signature = await challenge.sign(chainedPrivateKeyStatus);
      if (!signature.value) setStatus(createAuthorizeErrorStatus(signature));

      const result = await challenge.send(validateCode);

      return setStatus({
        ...result,
        status: {
          wasRecentStepSuccessful: result.value,
          isRequestFulfilled: true,
          requiredFactorForNextStep: undefined,
        },
      });
    },
    [setStatus],
  );

  /**
   * Marks the current authorization request as complete.
   * Preserves the success/failure state while clearing any pending requirements.
   */
  const fulfill = useCallback(() => {
    return setStatus((prevStatus) => ({
      ...prevStatus,
      status: {
        isRequestFulfilled: true,
        requiredFactorForNextStep: undefined,
        wasRecentStepSuccessful:
          !prevStatus.status.requiredFactorForNextStep &&
          prevStatus.status.wasRecentStepSuccessful,
      },
    }));
  }, [setStatus]);

  return { status, authorize, fulfill };
}

export default useBiometricsAuthorization;
