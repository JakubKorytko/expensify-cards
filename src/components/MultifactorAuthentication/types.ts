import type React from 'react';
import type {UseMultifactorAuthorizationFallback} from '@hooks/useMultifactorAuthentication/types';
import type {MultifactorAuthenticationScenarioParameters, MultifactorAuthorizationFallbackScenario} from '@libs/MultifactorAuthentication/types';

// Base type for multifactorial authentication status including modal state
type ExtendedMultifactorAuthenticationStatus<T extends MultifactorAuthorizationFallbackScenario> = UseMultifactorAuthorizationFallback<T> & {
    isModalShown: boolean;
};

// Main component props
type MultifactorAuthorizationFallbackProps<T extends MultifactorAuthorizationFallbackScenario> = {
    scenario: T;
    children: (shouldShowSecret: boolean, authorize: (props?: Record<string, unknown>) => Promise<void>, status: ExtendedMultifactorAuthenticationStatus<T>) => React.ReactNode;
} & (T extends keyof MultifactorAuthenticationScenarioParameters ? {params: MultifactorAuthenticationScenarioParameters[T]} : {params?: undefined});

export type {MultifactorAuthorizationFallbackProps, ExtendedMultifactorAuthenticationStatus};
