import { useCallback, useMemo } from "react";
import CONST from "@src/CONST";
import useMultifactorAuthenticationStatus from "./useMultifactorAuthenticationStatus";
import {
  AuthorizeUsingFallback,
  UseMultifactorAuthorizationFallback,
} from "./types";
import {
  MultifactorAuthorizationFallbackScenario,
  MultifactorAuthorizationFallbackScenarioParams,
} from "@libs/MultifactorAuthentication/scenarios/types";
import processMultifactorAuthenticationScenario, {
  areMultifactorAuthenticationFactorsSufficient,
} from "@libs/MultifactorAuthentication/scenarios/processMultifactorAuthenticationScenario";
import { requestValidateCodeAction } from "@libs/actions/User";

/**
 * Hook that provides fallback authorization flow when multifactorial authentication is not available.
 * Uses validate code and OTP for transaction authorization instead.
 */
function useMultifactorAuthorizationFallback<
  T extends MultifactorAuthorizationFallbackScenario,
>(scenario: T): UseMultifactorAuthorizationFallback<T> {
  const [status, setStatus] = useMultifactorAuthenticationStatus<
    number | undefined
  >(undefined, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION);

  /**
   * Verifies that all required authentication factors are provided.
   * Checks both OTP and validate code against the requirements for non-multifactorial authentication devices.
   */
  const verifyFactors = useCallback(
    (params: MultifactorAuthorizationFallbackScenarioParams<T>) =>
      areMultifactorAuthenticationFactorsSufficient(
        {
          ...params,
        },
        !!status.value,
        false,
      ),
    [status.value],
  );

  /**
   * Authorizes a transaction using OTP and validate code when multifactorial authentication is unavailable.
   * Handles the multistep verification process, requesting additional factors when needed.
   * Updates status to reflect the current state of authorization and any required next steps.
   */
  const authorize: AuthorizeUsingFallback<T> = useCallback(
    async (params) => {
      const valueToStore =
        CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE;
      const parameterName =
        CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS[valueToStore]
          .parameter;
      const storedValue = params[parameterName];

      const providedOrStoredFactor = storedValue || status.value;
      const { reason: factorsCheckReason, step: factorsCheckStep } =
        verifyFactors({
          ...params,
          ...(parameterName ? { [parameterName]: providedOrStoredFactor } : {}),
        });

      if (factorsCheckStep.requiredFactorForNextStep) {
        if (
          factorsCheckStep.requiredFactorForNextStep ===
          CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE
        ) {
          requestValidateCodeAction();
        }

        return setStatus((prevStatus) => ({
          ...prevStatus,
          step: factorsCheckStep,
          reason: factorsCheckReason,
        }));
      }

      const processResult = await processMultifactorAuthenticationScenario(
        scenario,
        {
          ...params,
          ...(parameterName ? { [parameterName]: providedOrStoredFactor } : {}),
        },
        !!status.value,
      );

      const { step } = processResult;

      if (step.requiredFactorForNextStep && step.wasRecentStepSuccessful) {
        return setStatus({
          ...processResult,
          value: storedValue ? storedValue : undefined,
        });
      } else {
        return setStatus(processResult);
      }
    },
    [status.value, verifyFactors, scenario, setStatus],
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

  /** Memoized scenarios exposed to consumers */
  const scenarios = useMemo(() => ({ authorize, cancel }), [authorize, cancel]);

  return { ...values, ...scenarios };
}

export default useMultifactorAuthorizationFallback;
