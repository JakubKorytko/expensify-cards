import React from "react";
import { MultifactorAuthorizationFallbackScenario } from "@libs/MultifactorAuthentication/scenarios/types";
import { MultifactorAuthenticationScenarioParameters } from "@libs/MultifactorAuthentication/scenarios";
import { UseMultifactorAuthorizationFallback } from "@hooks/useMultiAuthentication/types";

// Base type for multifactorial authentication status including modal state
type ExtendedMultifactorAuthenticationStatus<
  T extends MultifactorAuthorizationFallbackScenario,
> = UseMultifactorAuthorizationFallback<T> & {
  isModalShown: boolean;
};

// Main component props
type MultifactorAuthorizationFallbackProps<
  T extends MultifactorAuthorizationFallbackScenario,
> = {
  scenario: T;
  children: (
    shouldShowSecret: boolean,
    authorize: (props?: Record<string, unknown>) => Promise<void>,
    status: ExtendedMultifactorAuthenticationStatus<T>,
  ) => React.ReactNode;
} & (T extends keyof MultifactorAuthenticationScenarioParameters
  ? { params: MultifactorAuthenticationScenarioParameters[T] }
  : { params?: undefined });

export type {
  MultifactorAuthorizationFallbackProps,
  ExtendedMultifactorAuthenticationStatus,
};
