import React, {createContext, useCallback, useContext, useMemo, useRef} from 'react';
import type {ReactNode} from 'react';
import {useNavigation} from '@components/NavigationMock';
import {
    areMultifactorAuthorizationFallbackParamsValid,
    convertResultIntoMFAStatus,
    EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
    MergedHooksStatus,
    shouldAllowBiometrics,
    shouldAllowFallback,
} from '@hooks/MultifactorAuthentication/helpers';
import type {MultifactorAuthenticationScenarioStatus, Register, UseMultifactorAuthentication} from '@hooks/MultifactorAuthentication/types';
import useMultifactorAuthenticationStatus from '@hooks/MultifactorAuthentication/useMultifactorAuthenticationStatus';
import useMultifactorAuthorizationFallback from '@hooks/MultifactorAuthentication/useMultifactorAuthorizationFallback';
import useNativeBiometrics from '@hooks/MultifactorAuthentication/useNativeBiometrics';
import {requestValidateCodeAction} from '@libs/actions/User';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationStatus,
    MultifactorAuthenticationTrigger,
    MultifactorAuthorizationFallbackScenario,
    MultifactorAuthorizationFallbackScenarioParams,
} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import MULTI_FACTOR_AUTHENTICATION_SCENARIOS from './config';

const MultifactorAuthenticationContext = createContext<UseMultifactorAuthentication>({
    info: {
        isBiometryConfigured: false,
        deviceSupportBiometrics: false,
        message: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.message,
        title: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.title,
        success: undefined,
    },
    process: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    update: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    trigger: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
});

type MultifactorAuthenticationContextProviderProps = {
    /**
     * The children of the full screen loader context provider.
     */
    children: ReactNode;
};

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    /** Mock */
    const Navigation = useNavigation();

    const MultifactorAuthorizationFallback = useMultifactorAuthorizationFallback();
    const NativeBiometrics = useNativeBiometrics();
    const [mergedStatus, setMergedStatus] = useMultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>(
        {
            scenario: undefined,
            type: CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
        },
        CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
    );
    const success = useRef<boolean | undefined>(undefined);
    const afterRevoke = useRef<boolean>(false);
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

            const scenarioRoute: Route = scenario ? MULTI_FACTOR_AUTHENTICATION_SCENARIOS[scenario].route : ROUTES.NOT_FOUND;

            let shouldClear = false;

            if (afterRevoke.current) {
                afterRevoke.current = false;
                Navigation.navigate(scenarioRoute.getRoute());
                shouldClear = true;
            } else if (softPrompt) {
                Navigation.navigate(ROUTES.SOFT_PROMPT.getRoute());
                shouldClear = true;
            } else if (step.requiredFactorForNextStep === CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE && !Navigation.isActiveRoute(ROUTES.MAGIC_CODE)) {
                requestValidateCodeAction();
                Navigation.navigate(ROUTES.MAGIC_CODE.getRoute());
                shouldClear = true;
            } else if (step.requiredFactorForNextStep === CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.OTP && !Navigation.isActiveRoute(ROUTES.OTP)) {
                Navigation.navigate(ROUTES.OTP.getRoute());
                shouldClear = true;
            } else if (step.isRequestFulfilled) {
                if (step.wasRecentStepSuccessful && !Navigation.isActiveRoute(ROUTES.SUCCESS)) {
                    Navigation.navigate(ROUTES.SUCCESS.getRoute());
                    success.current = true;
                } else if (step.wasRecentStepSuccessful === false && !Navigation.isActiveRoute(ROUTES.FAILURE)) {
                    Navigation.navigate(ROUTES.FAILURE.getRoute());
                    success.current = false;
                } else if (step.wasRecentStepSuccessful === undefined && !Navigation.isActiveRoute(scenarioRoute)) {
                    Navigation.navigate(scenarioRoute.getRoute());
                    shouldClear = true;
                }
            }

            if (shouldClear) {
                success.current = undefined;
            }
        },
        [Navigation],
    );

    const setStatus = useCallback(
        (...args: [...Parameters<typeof setMergedStatus>, softPrompt?: boolean, revoke?: boolean]) => {
            const [status, typeOverride, softPrompt, revoke] = args;

            const merged = setMergedStatus(status, typeOverride ?? (typeof status === 'function' ? undefined : status?.value.type));

            navigateWithClear(merged, softPrompt);

            if (revoke) {
                afterRevoke.current = true;
            }

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
                biometrics: shouldAllowBiometrics(securityLevel) && (NativeBiometrics.setup.isBiometryConfigured || softPromptStore.current.accepted),
            };
        },
        [NativeBiometrics.setup.isBiometryConfigured],
    );

    const register = useCallback(
        async <T extends MultifactorAuthorizationFallbackScenario>(
            params: MultifactorAuthenticationScenarioParams<T> & {
                chainedWithAuthorization?: boolean;
            },
            scenario: T,
        ) => {
            const {chainedWithAuthorization} = params;

            if (!allowedMethods(scenario).biometrics) {
                return setStatus(...MergedHooksStatus.createBiometricsNotAllowedStatus(scenario, params));
            }
            const result = await NativeBiometrics.setup.register(params);
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
        [NativeBiometrics.setup, allowedMethods, setStatus],
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
            return setStatus(convertResultIntoMFAStatus(await NativeBiometrics.authorize(scenario, params), scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION, params));
        },
        [NativeBiometrics, allowedMethods, setStatus],
    );

    const cancel = useCallback(() => {
        const {scenario, type} = mergedStatus.value;
        softPromptStore.current.accepted = undefined;
        softPromptStore.current.validateCode = undefined;

        if (type === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION) {
            return setStatus(convertResultIntoMFAStatus(NativeBiometrics.cancel(), scenario, type, false));
        }
        if (type === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK) {
            return setStatus(convertResultIntoMFAStatus(MultifactorAuthorizationFallback.cancel(), scenario, type, false));
        }

        return setStatus(convertResultIntoMFAStatus(NativeBiometrics.setup.cancel(), scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, false));
    }, [NativeBiometrics, MultifactorAuthorizationFallback, mergedStatus.value, setStatus]);

    const process = useCallback(
        async <T extends MultifactorAuthenticationScenario>(
            scenario: T,
            params?: MultifactorAuthenticationScenarioParams<T>,
        ): Promise<MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>> => {
            if (!NativeBiometrics.setup.isBiometryConfigured && softPromptStore.current.accepted === undefined) {
                const {validateCode} = params ?? softPromptStore.current;
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

            if (!params) {
                return setStatus((prevStatus) => MergedHooksStatus.badRequestStatus(prevStatus));
            }

            if (!NativeBiometrics.setup.deviceSupportBiometrics || !allowedMethods(scenario).biometrics) {
                if (!areMultifactorAuthorizationFallbackParamsValid(scenario, params)) {
                    return setStatus((prevStatus) => MergedHooksStatus.badRequestStatus(prevStatus));
                }

                return authorizeFallback(scenario, params);
            }

            if (!NativeBiometrics.setup.isBiometryConfigured) {
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
                await NativeBiometrics.setup.revoke();
            }

            return result;
        },
        [NativeBiometrics.setup, allowedMethods, authorize, authorizeFallback, register, setStatus],
    );

    const update = useCallback(
        async (
            params: Partial<AllMultifactorAuthenticationFactors> & {
                softPromptDecision?: boolean;
            },
        ) => {
            const {scenario, payload} = mergedStatus.value;
            const {validateCode} = softPromptStore.current;
            const {isRequestFulfilled} = mergedStatus.step;

            const {softPromptDecision = softPromptStore.current.accepted} = params;

            softPromptStore.current.accepted = softPromptDecision;

            if (!scenario || isRequestFulfilled || !payload) {
                return setStatus(MergedHooksStatus.badRequestStatus(mergedStatus));
            }

            const processParams = {
                ...payload,
                ...params,
                validateCode: params.validateCode ?? validateCode,
            };

            return process(scenario, processParams);
        },
        [mergedStatus, process, setStatus],
    );

    const done = useCallback(() => {
        const {step} = mergedStatus;

        const result = cancel();
        success.current = !!step.wasRecentStepSuccessful && step.isRequestFulfilled;
        return result;
    }, [cancel, mergedStatus]);

    const revoke = useCallback(async () => {
        const revokeStatus = await NativeBiometrics.setup.revoke();
        return setStatus(
            (prevStatus) =>
                convertResultIntoMFAStatus(revokeStatus, prevStatus.value.scenario, prevStatus.value.type ?? CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, false),
            CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
            false,
            true,
        );
    }, [NativeBiometrics.setup, setStatus]);

    const info = useMemo(
        () => ({
            title: mergedStatus.title,
            message: mergedStatus.message,
            isBiometryConfigured: NativeBiometrics.setup.isBiometryConfigured,
            deviceSupportBiometrics: NativeBiometrics.setup.deviceSupportBiometrics,
            success: success.current,
        }),
        [NativeBiometrics.setup.deviceSupportBiometrics, NativeBiometrics.setup.isBiometryConfigured, mergedStatus.message, mergedStatus.title],
    );

    const trigger = useCallback(
        async (triggerType: MultifactorAuthenticationTrigger) => {
            if (triggerType === CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.REVOKE) {
                return revoke();
            }

            if (triggerType === CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.FULFILL) {
                return done();
            }

            if (triggerType === CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.CANCEL) {
                return cancel();
            }

            return mergedStatus;
        },
        [cancel, done, mergedStatus, revoke],
    );

    const MultifactorAuthenticationData = useMemo(
        () => ({
            info,
            process,
            update,
            trigger,
        }),
        [info, process, update, trigger],
    );

    return <MultifactorAuthenticationContext.Provider value={MultifactorAuthenticationData}>{children}</MultifactorAuthenticationContext.Provider>;
}

function useMultifactorAuthenticationContext(): UseMultifactorAuthentication {
    const context = useContext(MultifactorAuthenticationContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationContext must be used within a MultifactorAuthenticationContextProvider');
    }

    return context;
}

MultifactorAuthenticationContextProvider.displayName = 'MultifactorAuthenticationContextProvider';

export default MultifactorAuthenticationContextProvider;
export {MultifactorAuthenticationContext, useMultifactorAuthenticationContext};
