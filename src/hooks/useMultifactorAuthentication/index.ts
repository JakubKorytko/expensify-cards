import {useCallback, useMemo, useRef} from 'react';
import {requestValidateCodeAction} from '@libs/actions/User';
import MULTI_FACTOR_AUTHENTICATION_SCENARIOS from '@libs/MultifactorAuthentication/scenarios';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationStatus,
    MultifactorAuthorizationFallbackScenario,
    MultifactorAuthorizationFallbackScenarioParams,
} from '@libs/MultifactorAuthentication/types';
import {useNavigation} from '@src/components/NavigationMock';
import CONST from '@src/CONST';
import type ROUTES from '@src/ROUTES';
import {areMultifactorAuthorizationFallbackParamsValid, convertResultIntoMFAStatus, MergedHooksStatus, shouldAllowBiometrics, shouldAllowFallback} from './helpers';
import type {MultifactorAuthenticationScenarioStatus, Register, UseMultifactorAuthentication} from './types';
import useMultifactorAuthenticationStatus from './useMultifactorAuthenticationStatus';
import useMultifactorAuthorization from './useMultifactorAuthorization';
import useMultifactorAuthorizationFallback from './useMultifactorAuthorizationFallback';

function useMultifactorAuthentication(): UseMultifactorAuthentication {
    const MultifactorAuthorizationFallback = useMultifactorAuthorizationFallback();
    const MultifactorAuthorization = useMultifactorAuthorization();
    const [mergedStatus, setMergedStatus] = useMultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>(
        {
            scenario: undefined,
            type: CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
        },
        CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
    );
    const {navigate, route} = useNavigation();
    const success = useRef<boolean | undefined>(undefined);
    // to avoid waiting for next render
    const softPromptStore = useRef<{
        accepted: boolean | undefined;
        validateCode: number | undefined;
    }>({
        accepted: undefined,
        validateCode: undefined,
    });

    const navigateWithClear = useCallback(
        (status: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>, softPrompt?: boolean) => {
            const {
                step,
                value: {scenario},
            } = status;

            const scenarioRoute: keyof typeof ROUTES = scenario ? MULTI_FACTOR_AUTHENTICATION_SCENARIOS[scenario].route : 'notFound';

            let shouldClear = false;

            if (softPrompt) {
                navigate('softPrompt');
                shouldClear = true;
            } else if (step.requiredFactorForNextStep === CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE && route !== 'magicCode') {
                navigate('magicCode');
                shouldClear = true;
            } else if (step.requiredFactorForNextStep === CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.OTP && route !== 'otp') {
                navigate('otp');
                shouldClear = true;
            } else if (step.isRequestFulfilled) {
                if (step.wasRecentStepSuccessful && route !== 'success') {
                    navigate('success');
                    success.current = true;
                } else if (step.wasRecentStepSuccessful === false && route !== 'failure') {
                    navigate('failure');
                    success.current = false;
                } else if (step.wasRecentStepSuccessful === undefined && route !== scenarioRoute) {
                    navigate(scenarioRoute);
                    shouldClear = true;
                }
            }

            if (shouldClear) {
                success.current = undefined;
            }
        },
        [navigate, route],
    );

    const setStatus = useCallback(
        (...args: [...Parameters<typeof setMergedStatus>, softPrompt?: boolean]) => {
            const [status, typeOverride, softPrompt] = args;

            const merged = setMergedStatus(status, typeOverride ?? (typeof status === 'function' ? undefined : status?.value.type));

            navigateWithClear(merged, softPrompt);

            return merged;
        },
        [navigateWithClear, setMergedStatus],
    );

    const allowedMethods = useCallback(
        <T extends MultifactorAuthenticationScenario>(scenario: T) => {
            const {securityLevel} = MULTI_FACTOR_AUTHENTICATION_SCENARIOS[scenario];

            return {
                fallback: shouldAllowFallback(securityLevel),
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                biometrics: shouldAllowBiometrics(securityLevel) && (MultifactorAuthorization.setup.isBiometryConfigured || softPromptStore.current.accepted),
            };
        },
        [MultifactorAuthorization.setup.isBiometryConfigured],
    );

    const register = useCallback(
        async <T extends MultifactorAuthorizationFallbackScenario>(
            params: MultifactorAuthenticationScenarioParams<T> & {
                chainedWithAuthorization?: boolean;
            },
            potentialScenario?: T,
        ) => {
            const {chainedWithAuthorization} = params;
            const scenario = potentialScenario ?? CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.SETUP_BIOMETRICS;

            if (!allowedMethods(scenario).biometrics) {
                return setStatus(...MergedHooksStatus.createBiometricsNotAllowedStatus(scenario, params));
            }
            const result = await MultifactorAuthorization.setup.register(params);
            const status = convertResultIntoMFAStatus(result, scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, params);
            const mergedResult = setStatus(status);
            if (chainedWithAuthorization) {
                return {
                    ...mergedResult,
                    value: result.value,
                } as MultifactorAuthenticationStatus<string>;
            }
            return mergedResult;
        },
        [MultifactorAuthorization.setup, allowedMethods, setStatus],
    ) as Register<MultifactorAuthenticationScenarioStatus>;

    const authorizeFallback = useCallback(
        async <T extends MultifactorAuthorizationFallbackScenario>(scenario: T, params: MultifactorAuthorizationFallbackScenarioParams<T>) => {
            if (!allowedMethods(scenario).fallback) {
                return setStatus(...MergedHooksStatus.createFallbackNotAllowedStatus(scenario, params));
            }
            const result = await MultifactorAuthorizationFallback.authorize(scenario, params);
            return setStatus(convertResultIntoMFAStatus(result, scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK, params));
        },
        [MultifactorAuthorizationFallback, allowedMethods, setStatus],
    );

    const authorize = useCallback(
        async <T extends MultifactorAuthenticationScenario>(
            scenario: T,
            params: MultifactorAuthenticationScenarioParams<T> & {
                chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null> | undefined;
            },
        ) => {
            if (!allowedMethods(scenario).biometrics) {
                return setStatus(...MergedHooksStatus.createBiometricsNotAllowedStatus(scenario, params, true));
            }
            return setStatus(
                convertResultIntoMFAStatus(await MultifactorAuthorization.authorize(scenario, params), scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION, params),
            );
        },
        [MultifactorAuthorization, allowedMethods, setStatus],
    );

    const cancel = useCallback(() => {
        const {scenario, type} = mergedStatus.value;
        softPromptStore.current.accepted = undefined;
        softPromptStore.current.validateCode = undefined;

        if (type === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION) {
            return setStatus(convertResultIntoMFAStatus(MultifactorAuthorization.cancel(), scenario, type, false));
        }
        if (type === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK) {
            return setStatus(convertResultIntoMFAStatus(MultifactorAuthorizationFallback.cancel(), scenario, type, false));
        }

        return setStatus(convertResultIntoMFAStatus(MultifactorAuthorization.setup.cancel(), scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, false));
    }, [MultifactorAuthorization, MultifactorAuthorizationFallback, mergedStatus.value, setStatus]);

    const process = useCallback(
        async <T extends MultifactorAuthenticationScenario>(
            scenario: T,
            params?: MultifactorAuthenticationScenarioParams<T>,
        ): Promise<MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>> => {
            if (!MultifactorAuthorization.setup.isBiometryConfigured && softPromptStore.current.accepted === undefined) {
                const {validateCode} = params ?? softPromptStore.current;
                if (!validateCode) {
                    requestValidateCodeAction();
                }

                softPromptStore.current.validateCode = validateCode;

                return setStatus(
                    (prevStatus) =>
                        convertResultIntoMFAStatus(
                            {
                                ...prevStatus,
                                step: validateCode
                                    ? prevStatus.step
                                    : {
                                          isRequestFulfilled: false,
                                          requiredFactorForNextStep: CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE,
                                          wasRecentStepSuccessful: undefined,
                                      },
                            },
                            scenario,
                            CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
                            params ?? false,
                        ),
                    undefined,
                    !!validateCode,
                );
            }

            if (scenario === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.SETUP_BIOMETRICS) {
                return setStatus(convertResultIntoMFAStatus(await register(params ?? {}, scenario), scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, false));
            }

            if (!params) {
                return setStatus((prevStatus) => MergedHooksStatus.badRequestStatus(prevStatus));
            }

            if (!MultifactorAuthorization.setup.deviceSupportBiometrics || !allowedMethods(scenario).biometrics) {
                if (!areMultifactorAuthorizationFallbackParamsValid(scenario, params)) {
                    return setStatus((prevStatus) => MergedHooksStatus.badRequestStatus(prevStatus));
                }

                return authorizeFallback(scenario, params);
            }

            if (!MultifactorAuthorization.setup.isBiometryConfigured) {
                /** Multi-factor authentication is not configured, let's do that first */
                /** Run the setup method */

                const requestStatus = await register(
                    {
                        ...params,
                        chainedWithAuthorization: true,
                    },
                    scenario,
                );

                if (!requestStatus.step.wasRecentStepSuccessful) {
                    return setStatus(convertResultIntoMFAStatus(requestStatus, scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION, params));
                }

                return authorize(scenario, {
                    ...params,
                    chainedPrivateKeyStatus: requestStatus,
                });
            }

            /** Multi-factor authentication is configured already, let's do the challenge logic */
            const result = await authorize(scenario, {
                ...params,
                chainedPrivateKeyStatus: undefined,
            });

            if (result.reason === 'multifactorAuthentication.reason.error.keyMissingOnTheBE') {
                await MultifactorAuthorization.setup.revoke();
            }

            return result;
        },
        [MultifactorAuthorization.setup, allowedMethods, authorize, authorizeFallback, register, setStatus],
    );

    const softPromptDecision = useCallback(
        async (accepted: boolean) => {
            softPromptStore.current.accepted = accepted;
            const {scenario, payload} = mergedStatus.value;
            const {validateCode} = softPromptStore.current;

            if (!scenario || !isPayloadSufficient(scenario, payload)) {
                return setStatus(MergedHooksStatus.badRequestStatus(mergedStatus));
            }
            return process(scenario, {
                validateCode,
                ...payload,
            });
        },
        [mergedStatus, process, setStatus],
    );

    const provideFactor = useCallback(
        async (params: Partial<AllMultifactorAuthenticationFactors>) => {
            const {scenario, payload} = mergedStatus.value;
            const {isRequestFulfilled} = mergedStatus.step;

            if (!scenario || isRequestFulfilled || !isPayloadSufficient(scenario, payload)) {
                return setStatus(MergedHooksStatus.badRequestStatus(mergedStatus));
            }

            return process(scenario, {
                ...payload,
                ...params,
            });
        },
        [mergedStatus, process, setStatus],
    );

    const done = useCallback(() => {
        const {step} = mergedStatus;

        const result = cancel();
        success.current = !!step.wasRecentStepSuccessful && step.isRequestFulfilled;
        return result;
    }, [cancel, mergedStatus]);

    return useMemo(
        () => ({
            ...mergedStatus.step,
            title: mergedStatus.title,
            message: mergedStatus.message,
            isBiometryConfigured: MultifactorAuthorization.setup.isBiometryConfigured,
            deviceSupportBiometrics: MultifactorAuthorization.setup.deviceSupportBiometrics,
            process,
            revoke: async () => {
                const revokeStatus = await MultifactorAuthorization.setup.revoke();
                return setStatus(
                    (prevStatus) =>
                        convertResultIntoMFAStatus(revokeStatus, prevStatus.value.scenario, prevStatus.value.type ?? CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, false),
                    CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
                );
            },
            register: (params: Parameters<Register>[0]) => register({...params, chainedWithAuthorization: false}, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.SETUP_BIOMETRICS),
            provideFactor,
            cancel,
            done,
            success: success.current,
            softPromptDecision,
        }),
        [MultifactorAuthorization.setup, cancel, done, mergedStatus.message, mergedStatus.step, mergedStatus.title, process, provideFactor, register, setStatus, softPromptDecision],
    );
}

function isPayloadSufficient(
    scenario: MultifactorAuthenticationScenario,
    payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined,
): payload is MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> {
    return !!payload || scenario === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.SETUP_BIOMETRICS;
}

export default useMultifactorAuthentication;
