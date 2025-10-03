import { useCallback, useMemo, useRef } from "react";
import { BiometricsPublicKeyStore } from "@libs/Biometrics/BiometricsKeyStore";
import CONST from "@src/CONST";
import useBiometricsFeedback from "./useBiometricsFeedback";
import type {
  Biometrics,
  BiometricsAuthorizationParams,
  BiometricsStatus,
  BiometricsStep,
} from "./types";
import useBiometricsStatus from "@hooks/useBiometrics/useBiometricsStatus";
import useBiometricsAuthorizationFallback from "@hooks/useBiometrics/useBiometricsAuthorizationFallback";
import useBiometricsAuthorization from "@hooks/useBiometrics/useBiometricsAuthorization";

/**
 * Hook used to run the biometrics process and receive feedback.
 */
function useBiometrics(): Biometrics {
  const {
    register,
    isBiometryConfigured,
    resetSetup,
    doesDeviceSupportBiometrics,
    feedback: statusFeedback,
    fulfill: statusFulfill,
  } = useBiometricsStatus();
  const {
    authorize: authorizeUsingFallback,
    feedback: authorizationFeedback,
    fulfill: authorizationFulfill,
  } = useBiometricsAuthorizationFallback();
  const {
    challenge: authorizeBiometrics,
    feedback: fallbackFeedback,
    fulfill: fallbackFulfill,
  } = useBiometricsAuthorization();

  const currentFeedback =
    useRef<BiometricsStatus<BiometricsStep>>(statusFeedback);

  /**
   * Main method to authorize a transaction using biometrics if available and configured,
   * or falling back to otp and validate code if not.
   * If biometrics is not configured, it will attempt to register it first.
   * If the registration is successful, it will attempt to authorize the transaction using biometrics right away.
   * You can check which factors are required by checking the requiredFactors property before calling this method.
   *
   * Note: If the device does not support biometrics, both validateCode and otp must be provided.
   * If the device supports biometrics, but it is not configured, validateCode must be provided.
   * If the device supports and is configured for biometrics, neither validateCode nor otp are needed.
   *
   * IMPORTANT: Using this method will display authentication prompt.
   */
  const authorize = useCallback(
    ({
      transactionID,
      validateCode,
      otp,
    }: BiometricsAuthorizationParams): Promise<
      BiometricsStatus<BiometricsStep>
    > => {
      if (!doesDeviceSupportBiometrics) {
        return authorizeUsingFallback({
          otp,
          validateCode: validateCode!,
          transactionID,
        }).then((fallbackResult) => {
          currentFeedback.current = fallbackResult;
          return Promise.resolve(fallbackResult);
        });
      }

      if (!isBiometryConfigured) {
        /** Biometrics is not configured, let's do that first */
        /** Run the setup method */
        return register({ validateCode, chainedWithAuthorization: true }).then(
          (requestStatus) => {
            const { value } = requestStatus;
            const privateKeyIncluded = typeof value === "string";

            //
            if (!privateKeyIncluded) {
              currentFeedback.current =
                requestStatus as BiometricsStatus<BiometricsStep>;
              return requestStatus as BiometricsStatus<BiometricsStep>;
            }
            //   return setFeedback(
            //     {
            //       ...requestStatus,
            //       value: {
            //         isRequestFulfilled: true,
            //         wasRecentStepSuccessful: false,
            //         requiredFactorForNextStep: undefined,
            //       },
            //     },
            //     CONST.BIOMETRICS.ACTION_TYPE.KEY,
            //   );
            /** Setup was successful and auto run was not disabled, let's run the challenge right away */

            return authorizeBiometrics({
              transactionID,
              validateCode,
              chainedPrivateKeyStatus: privateKeyIncluded
                ? {
                    ...requestStatus,
                    value,
                  }
                : undefined,
            });
          },
        );
      }

      /** Biometrics is configured already, let's do the challenge logic */
      return authorizeBiometrics({ transactionID, validateCode }).then(
        (result) => {
          const shouldResetSetup =
            result.reason === "biometrics.reason.error.keyMissingOnTheBE";
          (shouldResetSetup ? resetSetup() : Promise.resolve()).then(() => {
            currentFeedback.current = result;
          });

          return result;
        },
      );
    },
    [
      doesDeviceSupportBiometrics,
      isBiometryConfigured,
      authorizeBiometrics,
      authorizeUsingFallback,
      register,
      resetSetup,
    ],
  );

  const fulfill = useCallback(() => {
    // ...
  }, []);

  return [
    {
      ...currentFeedback.current,
      ...currentFeedback.current.value,
      isBiometryConfigured,
    },
    authorize,
    resetSetup,
    fulfill,
  ];
}

export default useBiometrics;
