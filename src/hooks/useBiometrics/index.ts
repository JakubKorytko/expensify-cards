import { useCallback, useMemo, useRef } from "react";
import type {
  UseBiometrics,
  BiometricsAuthorization,
  BiometricsRecentStatus,
  BiometricsActions,
  BiometricsState,
} from "./types";
import useBiometricsAuthentication from "@hooks/useBiometricsAuthentication";
import useBiometricsAuthorizationFallback from "@hooks/useBiometricsAuthorizationFallback";
import useBiometricsAuthorization from "@hooks/useBiometricsAuthorization";
import { createRecentStatus } from "./helpers";

/**
 * Hook that manages the biometrics authentication flow, including registration,
 * authorization and fallback mechanisms. Returns current biometrics state and
 * available actions.
 */
function useBiometrics(): UseBiometrics {
  const [BiometricsStatus, BiometricsStatusActions] = useBiometricsAuthentication();
  const BiometricsFallback = useBiometricsAuthorizationFallback();
  const BiometricsAuthorization = useBiometricsAuthorization();

  const recentStatus = useRef<BiometricsRecentStatus>({
    status: BiometricsAuthorization.status,
    fulfillMethod: BiometricsAuthorization.fulfill,
  });

  /**
   * Core authorization method that handles different biometric scenarios:
   * 
   * - For devices without biometric support: Uses OTP and validation code fallback
   * - For unconfigured biometrics: Attempts registration first, then authorization
   * - For configured biometrics: Proceeds directly to authorization
   * 
   * Required parameters vary by scenario:
   * - No biometric support: Requires both OTP and validation code
   * - Unconfigured biometrics: Requires validation code
   * - Configured biometrics: No additional parameters needed
   * 
   * Will trigger authentication UI when called.
   */
  const authorize = useCallback(
    async ({ transactionID, validateCode, otp }: Parameters<BiometricsAuthorization>[0]): Promise<BiometricsRecentStatus> => {
      if (!BiometricsStatus.deviceSupportBiometrics) {
        const result = await BiometricsFallback.authorize({
          otp,
          validateCode: validateCode!,
          transactionID,
        });
        return createRecentStatus(result, BiometricsFallback.fulfill);
      }

      if (!BiometricsStatus.isBiometryConfigured) {
        /** Biometrics is not configured, let's do that first */
        /** Run the setup method */
        const requestStatus = await BiometricsStatusActions.register({
          validateCode,
          chainedWithAuthorization: true
        });

        /** Setup was successful and auto run was not disabled, let's run the challenge right away */
        const result = await BiometricsAuthorization.authorize({
          transactionID,
          validateCode,
          chainedPrivateKeyStatus: requestStatus,
        });

        return createRecentStatus(result, BiometricsAuthorization.fulfill);
      }

      /** Biometrics is configured already, let's do the challenge logic */
      const result = await BiometricsAuthorization.authorize({ transactionID, validateCode });

      if (result.reason === "biometrics.reason.error.keyMissingOnTheBE") {
        await BiometricsStatusActions.resetSetup();
      }

      return createRecentStatus(result, BiometricsAuthorization.fulfill);
    },
    [
      BiometricsStatus.deviceSupportBiometrics,
      BiometricsStatus.isBiometryConfigured,
      BiometricsAuthorization.authorize,
      BiometricsFallback.authorize,
      BiometricsStatusActions.register,
      BiometricsStatusActions.resetSetup,
    ],
  );

  /**
   * Wrapper around authorize that saves the authorization result to current status
   * before returning it.
   */
  const authorizeAndSaveRecentStatus: BiometricsAuthorization = useCallback(
    async (params: Parameters<BiometricsAuthorization>[0]) => {
      const result = await authorize(params);
      recentStatus.current = result;
      return result.status;
    },
    [authorize]
  );

  /**
   * Completes the current biometric operation by calling the stored fulfill method
   * and updates the current status with the result.
   */
  const fulfill = useCallback(() => {
    const status = recentStatus.current.fulfillMethod();
    const newStatus = {
      ...status,
      value: !!status.status.wasRecentStepSuccessful
    };

    recentStatus.current = {
      status: newStatus,
      fulfillMethod: recentStatus.current.fulfillMethod,
    };

    return newStatus;
  }, []);


  /** Memoized state values exposed to consumers */
  const state: BiometricsState = useMemo(() => ({
    isBiometryConfigured: BiometricsStatus.isBiometryConfigured,
    ...recentStatus.current.status,
  }), [BiometricsStatus.isBiometryConfigured, recentStatus.current.status]);

  /** Memoized actions exposed to consumers */
  const actions: BiometricsActions = useMemo(() => ({
    register: BiometricsStatusActions.register,
    resetSetup: BiometricsStatusActions.resetSetup,
    authorize: authorizeAndSaveRecentStatus,
    fulfill
  }), [
    BiometricsStatusActions.register,
    BiometricsStatusActions.resetSetup,
    authorizeAndSaveRecentStatus,
    fulfill
  ]);

  return [state, actions];
}

export default useBiometrics;
