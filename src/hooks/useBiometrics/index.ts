import { useCallback, useRef } from "react";
import type {
  Biometrics,
  BiometricsAuthorizationParams,
  BiometricsStatus,
  BiometricsStep,
} from "./types";
import useBiometricsAuthentication from "@hooks/useBiometricsAuthentication";
import useBiometricsAuthorizationFallback from "@hooks/useBiometricsAuthorizationFallback";
import useBiometricsAuthorization from "@hooks/useBiometricsAuthorization";

/**
 * Hook used to run the biometrics process and receive status.
 */
function useBiometrics(): Biometrics {
  const [
    { deviceSupportBiometrics, isBiometryConfigured },
    { register, resetSetup, fulfill: statusFulfill },
  ] = useBiometricsAuthentication();
  const {
    authorize: authorizeUsingFallback,
    status: authorizationStatus,
    fulfill: authorizationFulfill,
  } = useBiometricsAuthorizationFallback();
  const {
    challenge: authorizeBiometrics,
    status: fallbackStatus,
    fulfill: fallbackFulfill,
  } = useBiometricsAuthorization();

  const currentStatus =
    useRef<BiometricsStatus<BiometricsStep>>(authorizationStatus);

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
      if (!deviceSupportBiometrics) {
        return authorizeUsingFallback({
          otp,
          validateCode: validateCode!,
          transactionID,
        }).then((fallbackResult) => {
          currentStatus.current = fallbackResult;
          return Promise.resolve(fallbackResult);
        });
      }

      if (!isBiometryConfigured) {
        /** Biometrics is not configured, let's do that first */
        /** Run the setup method */
        return register({ validateCode, chainedWithAuthorization: true }).then(
          (requestStatus) => {
            /** Setup was successful and auto run was not disabled, let's run the challenge right away */
            return authorizeBiometrics({
              transactionID,
              validateCode,
              chainedPrivateKeyStatus: requestStatus,
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
            currentStatus.current = result;
          });

          return result;
        },
      );
    },
    [
      deviceSupportBiometrics,
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
      ...currentStatus.current,
      ...currentStatus.current.value,
      isBiometryConfigured,
    },
    authorize,
    resetSetup,
    fulfill,
  ];
}

export default useBiometrics;
