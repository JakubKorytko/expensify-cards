import {useCallback, useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import {areFactorsSufficient, processScenario} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import type {MultifactorAuthenticationStep, MultifactorAuthorizationFallbackScenario, MultifactorAuthorizationFallbackScenarioParams} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AuthorizeUsingFallback, MultifactorAuthenticationStatusMessage} from './types';
import useMultifactorAuthenticationStatus from './useMultifactorAuthenticationStatus';

/**
 * Hook that provides fallback authorization flow when multifactorial authentication is not available.
 * Uses validate code and OTP for transaction authorization instead.
 */
function useMultifactorAuthorizationFallback() {
    const [status, setStatus] = useMultifactorAuthenticationStatus<number | undefined>(undefined, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});

    const is2FAEnabled = !!account.requiresTwoFactorAuth;

    /**
     * Verifies that all required authentication factors are provided.
     * Checks both OTP and validate code against the requirements for non-multifactorial authentication devices.
     */
    const verifyFactors = useCallback(
        <T extends MultifactorAuthorizationFallbackScenario>(params: MultifactorAuthorizationFallbackScenarioParams<T>) =>
            areFactorsSufficient(
                {
                    ...params,
                },
                CONST.MULTI_FACTOR_AUTHENTICATION.FACTOR_COMBINATIONS.FALLBACK,
                !!status.value,
                is2FAEnabled,
            ),
        [is2FAEnabled, status.value],
    );

    /**
     * Authorizes a transaction using OTP and validate code when multifactorial authentication is unavailable.
     * Handles the multistep verification process, requesting additional factors when needed.
     * Updates status to reflect the current state of authorization and any required next steps.
     */
    const authorize = useCallback(
        async <T extends MultifactorAuthorizationFallbackScenario>(scenario: T, params: Parameters<AuthorizeUsingFallback<T>>[1]): ReturnType<AuthorizeUsingFallback<T>> => {
            const valueToStore = CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE;
            const parameterName = CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS[valueToStore].parameter;
            const storedValue = params[parameterName];

            const providedOrStoredFactor = storedValue ?? status.value;
            const {reason: factorsCheckReason, step: factorsCheckStep} = verifyFactors<T>({
                ...params,
                ...(parameterName ? {[parameterName]: providedOrStoredFactor} : {}),
            });

            if (factorsCheckStep.requiredFactorForNextStep) {
                const shouldStoreValidateCode = factorsCheckStep.requiredFactorForNextStep === CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.OTP && is2FAEnabled;

                return setStatus((prevStatus) => ({
                    ...prevStatus,
                    step: factorsCheckStep,
                    reason: factorsCheckReason,
                    value: shouldStoreValidateCode ? (storedValue ?? undefined) : undefined,
                }));
            }

            const processResult = await processScenario(
                scenario,
                {
                    ...params,
                    ...(parameterName ? {[parameterName]: providedOrStoredFactor} : {}),
                },
                CONST.MULTI_FACTOR_AUTHENTICATION.FACTOR_COMBINATIONS.FALLBACK,
                !!status.value,
            );

            const {step} = processResult;

            if (step.requiredFactorForNextStep && step.wasRecentStepSuccessful) {
                return setStatus({
                    ...processResult,
                    value: storedValue ?? undefined,
                });
            }
            return setStatus(processResult);
        },
        [status.value, verifyFactors, setStatus, is2FAEnabled],
    );

    /**
     * Marks the current authorization request as fulfilled and resets the validate code.
     * Used when completing or canceling an authorization flow.
     */
    const cancel = useCallback(() => {
        return setStatus((prevStatus) => ({
            ...prevStatus,
            value: undefined,
            step: {
                isRequestFulfilled: true,
                requiredFactorForNextStep: undefined,
                wasRecentStepSuccessful: undefined,
            },
        }));
    }, [setStatus]);

    /** Memoized state values exposed to consumers */
    const values: MultifactorAuthenticationStatusMessage & MultifactorAuthenticationStep = useMemo(() => {
        const {step, message, title} = status;
        return {...step, message, title};
    }, [status]);

    /** Memoized scenarios exposed to consumers */
    const scenarios = useMemo(() => ({authorize, cancel}), [authorize, cancel]);

    return {...values, ...scenarios};
}

export default useMultifactorAuthorizationFallback;
