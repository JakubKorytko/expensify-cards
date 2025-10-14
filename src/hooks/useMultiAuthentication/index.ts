import { useCallback, useMemo, useRef } from "react";
import type {
  UseMultiFactorAuthentication,
  MultiFactorAuthorizationMethod,
  MultiFactorAuthenticationRecentStatus,
  MultiFactorAuthenticationMethods,
  MultiFactorAuthenticationState,
} from "./types";
import useMultiFactorAuthenticationSetup from "./useBiometricsSetup";
import useMultiFactorAuthorizationFallback from "./useMultiFactorAuthorizationFallback";
import useMultiFactorAuthorization from "./useMultiFactorAuthorization";
import { createRecentStatus } from "./helpers";

/**
 * Hook that manages the multifactorial authentication flow, including registration,
 * authorization and fallback mechanisms. Returns current multifactorial authentication state and
 * available scenarios.
 */
function useMultiFactorAuthentication(): UseMultiFactorAuthentication {
  const MultiFactorAuthenticationSetup = useMultiFactorAuthenticationSetup();
  const MultiFactorAuthorizationFallback = useMultiFactorAuthorizationFallback(
    "AUTHORIZE_TRANSACTION",
  );
  const MultiFactorAuthorization = useMultiFactorAuthorization();

  const recentStatus = useRef<MultiFactorAuthenticationRecentStatus>({
    status: MultiFactorAuthorization.status,
    cancel: MultiFactorAuthorization.cancel,
  });

  /**
   * Core authorization method that handles different multifactorial authentication scenarios:
   *
   * - For devices without multifactorial authentication support: Uses OTP and validation code fallback
   * - For unconfigured multifactorial authentication: Attempts registration first, then authorization
   * - For configured multifactorial authentication: Proceeds directly to authorization
   *
   * Required parameters vary by scenario:
   * - No multifactorial authentication support: Requires both OTP and validation code
   * - Unconfigured multifactorial authentication: Requires validation code
   * - Configured multifactorial authentication: No additional parameters needed
   *
   * Will trigger authentication UI when called.
   */
  const authorize = useCallback(
    async ({
      transactionID,
      validateCode,
      otp,
    }: Parameters<MultiFactorAuthorizationMethod>[0]): Promise<MultiFactorAuthenticationRecentStatus> => {
      if (!MultiFactorAuthenticationSetup.deviceSupportBiometrics) {
        const result = await MultiFactorAuthorizationFallback.authorize({
          otp,
          validateCode: validateCode!,
          transactionID,
        });
        return createRecentStatus(
          result,
          MultiFactorAuthorizationFallback.cancel,
        );
      }

      if (!MultiFactorAuthenticationSetup.isBiometryConfigured) {
        /** Multi-factor authentication is not configured, let's do that first */
        /** Run the setup method */
        const requestStatus = await MultiFactorAuthenticationSetup.register({
          validateCode,
          chainedWithAuthorization: true,
        });

        /** Setup was successful and auto run was not disabled, let's run the challenge right away */
        const result = await MultiFactorAuthorization.authorize({
          transactionID,
          validateCode,
          chainedPrivateKeyStatus: requestStatus,
        });

        return createRecentStatus(result, MultiFactorAuthorization.cancel);
      }

      /** Multi-factor authentication is configured already, let's do the challenge logic */
      const result = await MultiFactorAuthorization.authorize({
        transactionID,
        validateCode,
      });

      if (
        result.reason ===
        "multiFactorAuthentication.reason.error.keyMissingOnTheBE"
      ) {
        await MultiFactorAuthenticationSetup.revoke();
      }

      return createRecentStatus(result, MultiFactorAuthorization.cancel);
    },
    [
      MultiFactorAuthenticationSetup,
      MultiFactorAuthorization,
      MultiFactorAuthorizationFallback,
    ],
  );

  /**
   * Wrapper around authorize that saves the authorization result to current status
   * before returning it.
   */
  const authorizeAndSaveRecentStatus: MultiFactorAuthorizationMethod =
    useCallback(
      async (params: Parameters<MultiFactorAuthorizationMethod>[0]) => {
        const result = await authorize(params);
        recentStatus.current = result;
        return result.status;
      },
      [authorize],
    );

  /**
   * Cancels the current multifactorial authentication operation by calling the stored cancel method
   * and updates the current status with the result.
   */
  const cancel = useCallback(() => {
    const status = recentStatus.current.cancel();
    const newStatus = {
      ...status,
      value: !!status.step.wasRecentStepSuccessful,
    };

    recentStatus.current = {
      status: newStatus,
      cancel: recentStatus.current.cancel,
    };

    return newStatus;
  }, []);

  /** Memoized state values exposed to consumers */
  const state: MultiFactorAuthenticationState = useMemo(
    () => ({
      isBiometryConfigured: MultiFactorAuthenticationSetup.isBiometryConfigured,
      ...recentStatus.current.status,
    }),
    [MultiFactorAuthenticationSetup.isBiometryConfigured],
  );

  /** Memoized methods exposed to consumers */
  const methods: MultiFactorAuthenticationMethods = useMemo(
    () => ({
      register: MultiFactorAuthenticationSetup.register,
      resetSetup: MultiFactorAuthenticationSetup.revoke,
      authorize: authorizeAndSaveRecentStatus,
      cancel,
    }),
    [
      MultiFactorAuthenticationSetup.register,
      MultiFactorAuthenticationSetup.revoke,
      authorizeAndSaveRecentStatus,
      cancel,
    ],
  );

  return [state, methods];
}

export default useMultiFactorAuthentication;
