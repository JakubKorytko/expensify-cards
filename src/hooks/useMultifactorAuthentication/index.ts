import {useCallback, useMemo, useRef} from 'react';
import MULTI_FACTOR_AUTHENTICATION_SCENARIOS from '@libs/MultifactorAuthentication/scenarios';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams, MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/types';
import CONST from '@src/CONST';
import {convertResultIntoBoolean, MergedHooksStatus, shouldAllowBiometrics, shouldAllowFallback} from './helpers';
import type {MultifactorAuthenticationStatusKeyType, Register} from './types';
import useBiometricsSetup from './useBiometricsSetup';
import useMultifactorAuthenticationStatus from './useMultifactorAuthenticationStatus';
import useMultifactorAuthorization from './useMultifactorAuthorization';
import useMultifactorAuthorizationFallback from './useMultifactorAuthorizationFallback';

function useMultifactorAuthentication<T extends MultifactorAuthenticationScenario>(scenario: T) {
    const BiometricsSetup = useBiometricsSetup();
    const MultifactorAuthorizationFallback = useMultifactorAuthorizationFallback(scenario);
    const MultifactorAuthorization = useMultifactorAuthorization(scenario);
    const [mergedStatus, setMergedStatus] = useMultifactorAuthenticationStatus<boolean>(false, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE);
    const lastScenarioType = useRef<MultifactorAuthenticationStatusKeyType>(CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE);

    const allowedMethods = useMemo(() => {
        const {securityLevel} = MULTI_FACTOR_AUTHENTICATION_SCENARIOS[scenario];

        return {
            fallback: shouldAllowFallback(securityLevel),
            biometrics: shouldAllowBiometrics(securityLevel),
        };
    }, [scenario]);

    const register = useCallback(
        async (params) => {
            const {chainedWithAuthorization} = params;

            if (!allowedMethods.biometrics) {
                return setMergedStatus(...MergedHooksStatus.createBiometricsNotAllowedStatus());
            }

            lastScenarioType.current = CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION;
            const result = await BiometricsSetup.register(params);
            const mergedResult = setMergedStatus(convertResultIntoBoolean(result), CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION);
            if (chainedWithAuthorization) {
                return {
                    ...mergedResult,
                    value: result.value,
                };
            }
            return mergedResult;
        },
        [BiometricsSetup, allowedMethods.biometrics, setMergedStatus],
    ) as Register;

    const authorizeFallback = useCallback(
        async (params: MultifactorAuthenticationScenarioParams<T>) => {
            if (!allowedMethods.fallback) {
                return setMergedStatus(...MergedHooksStatus.createFallbackNotAllowedStatus());
            }

            lastScenarioType.current = CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK;
            const result = await MultifactorAuthorizationFallback.authorize(params);
            return setMergedStatus(convertResultIntoBoolean(result), CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK);
        },
        [MultifactorAuthorizationFallback, allowedMethods.fallback, setMergedStatus],
    );

    const authorize = useCallback(
        async (
            params: MultifactorAuthenticationScenarioParams<T> & {
                chainedPrivateKeyStatus?: MultifactorAuthenticationStatus<string | null> | undefined;
            },
        ) => {
            if (!allowedMethods.biometrics) {
                return setMergedStatus(...MergedHooksStatus.createBiometricsNotAllowedStatus(true));
            }
            lastScenarioType.current = CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION;
            return setMergedStatus(await MultifactorAuthorization.authorize(params), CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION);
        },
        [MultifactorAuthorization, allowedMethods.biometrics, setMergedStatus],
    );

    const cancel = useCallback(() => {
        const lastScenario = lastScenarioType.current;
        lastScenarioType.current = CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE;
        if (lastScenario === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION) {
            return setMergedStatus(MultifactorAuthorization.cancel());
        }
        if (lastScenario === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK) {
            return setMergedStatus(convertResultIntoBoolean(MultifactorAuthorizationFallback.cancel()));
        }

        return setMergedStatus(BiometricsSetup.cancel());
    }, [BiometricsSetup, MultifactorAuthorization, MultifactorAuthorizationFallback, setMergedStatus]);

    const process = useCallback(
        async (params: MultifactorAuthenticationScenarioParams<T>): Promise<MultifactorAuthenticationStatus<boolean | undefined>> => {
            if (!BiometricsSetup.deviceSupportBiometrics) {
                return authorizeFallback(params);
            }

            const {validateCode} = params;

            if (!BiometricsSetup.isBiometryConfigured) {
                /** Multi-factor authentication is not configured, let's do that first */
                /** Run the setup method */
                const requestStatus = await register({
                    validateCode,
                    chainedWithAuthorization: true,
                });

                return authorize({
                    ...params,
                    chainedPrivateKeyStatus: requestStatus,
                });
            }

            /** Multi-factor authentication is configured already, let's do the challenge logic */
            const result = await authorize({
                ...params,
                chainedPrivateKeyStatus: undefined,
            });

            if (result.reason === 'multifactorAuthentication.reason.error.keyMissingOnTheBE') {
                await BiometricsSetup.revoke();
            }

            return result;
        },
        [BiometricsSetup, authorize, authorizeFallback, register],
    );

    return useMemo(
        () => ({
            ...mergedStatus,
            ...mergedStatus.step,
            isBiometryConfigured: BiometricsSetup.isBiometryConfigured,
            deviceSupportBiometrics: BiometricsSetup.deviceSupportBiometrics,
            process,
            revoke: BiometricsSetup.revoke,
            register: BiometricsSetup.register,
            cancel,
        }),
        [BiometricsSetup.deviceSupportBiometrics, BiometricsSetup.isBiometryConfigured, BiometricsSetup.register, BiometricsSetup.revoke, cancel, mergedStatus, process],
    );
}

export default useMultifactorAuthentication;
