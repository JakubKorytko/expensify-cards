import { useCallback, useMemo } from "react";
import authorizeBiometricsAction from "@libs/Biometrics/authorizeBiometricsAction";
import CONST from "@src/CONST";
import {
  convertBiometricsFactorToParameterName,
  verifyRequiredFactors,
} from "./helpers";
import useBiometricsStatus from "../useBiometricsStatus";
import { requestValidateCodeAction } from "@libs/actions/User";
import {
  AuthorizeUsingFallback,
  UseBiometricsAuthorizationFallback,
} from "./types";
import {
  BiometricsFallbackAction,
  BiometricsFallbackActionParams,
  BiometricsFallbackFactor,
  BiometricsFallbackFactors,
  StoredValueType,
} from "@libs/Biometrics/types";
import biometricsActions from "@libs/Biometrics/biometricsActions";

/**
 * Hook that provides fallback authorization flow when biometrics is not available.
 * Uses validate code and OTP for transaction authorization instead.
 */
function useBiometricsAuthorizationFallback<T extends BiometricsFallbackAction>(
  action: T,
): UseBiometricsAuthorizationFallback<T> {
  const [status, setStatus] = useBiometricsStatus<
    StoredValueType<T> | undefined
  >(undefined, CONST.BIOMETRICS.ACTION_TYPE.AUTHORIZATION);

  const requiredFactors = CONST.BIOMETRICS.ACTION_FACTORS_MAP[action];

  /**
   * Verifies that all required authentication factors are provided.
   * Checks both OTP and validate code against the requirements for non-biometric devices.
   */
  const verifyFactors = useCallback(
    (params: BiometricsFallbackActionParams<T>) =>
      verifyRequiredFactors({
        ...params,
        requiredFactors: requiredFactors.map(({ id }) => id),
        isFirstFactorVerified: !!status.value,
      }),
    [requiredFactors, status.value],
  );

  /**
   * Authorizes a transaction using OTP and validate code when biometrics is unavailable.
   * Handles the multistep verification process, requesting additional factors when needed.
   * Updates status to reflect the current state of authorization and any required next steps.
   */
  const authorize: AuthorizeUsingFallback<T> = useCallback(
    async (params) => {
      const valueToStore =
        "factorToStore" in biometricsActions[action] &&
        biometricsActions[action].factorToStore;

      const parameterName =
        valueToStore &&
        CONST.BIOMETRICS.FACTORS_REQUIREMENTS[valueToStore].origin ===
          CONST.BIOMETRICS.FACTORS_ORIGIN.FALLBACK &&
        (convertBiometricsFactorToParameterName(
          valueToStore as BiometricsFallbackFactor,
        ) as keyof BiometricsFallbackFactors<T>);
      const storedValue =
        parameterName && (params[parameterName] as StoredValueType<T>);

      const providedOrStoredFactor = storedValue || status.value;
      const { value: factorsCheckValue, reason: factorsCheckReason } =
        verifyFactors({
          ...params,
          ...(parameterName ? { [parameterName]: providedOrStoredFactor } : {}),
        });

      if (factorsCheckValue !== true) {
        if (factorsCheckValue === CONST.BIOMETRICS.FACTORS.VALIDATE_CODE) {
          requestValidateCodeAction();
        }

        return setStatus((prevStatus) => ({
          ...prevStatus,
          step: {
            requiredFactorForNextStep: factorsCheckValue,
            wasRecentStepSuccessful: false,
            isRequestFulfilled: false,
          },
          reason: factorsCheckReason,
        }));
      }

      return setStatus(
        await authorizeBiometricsAction(action, {
          ...params,
          ...(parameterName ? { [parameterName]: providedOrStoredFactor } : {}),
          isStoredFactorVerified: !!status.value,
        }),
      );
    },
    [status.value, verifyFactors, action, setStatus],
  );

  /**
   * Marks the current authorization request as fulfilled and resets the validate code.
   * Used when completing or canceling an authorization flow.
   */
  const cancel = useCallback(
    () =>
      setStatus((prevStatus) => ({
        ...prevStatus,
        value: undefined,
        step: {
          isRequestFulfilled: true,
          requiredFactorForNextStep: undefined,
          wasRecentStepSuccessful:
            !prevStatus.step.requiredFactorForNextStep &&
            prevStatus.step.wasRecentStepSuccessful,
        },
      })),
    [setStatus],
  );

  /** Memoized state values exposed to consumers */
  const values = useMemo(() => {
    const { step, message, title } = status;
    return { ...step, message, title };
  }, [status]);

  /** Memoized actions exposed to consumers */
  const actions = useMemo(() => ({ authorize, cancel }), [authorize, cancel]);

  return { ...values, ...actions };
}

export default useBiometricsAuthorizationFallback;
