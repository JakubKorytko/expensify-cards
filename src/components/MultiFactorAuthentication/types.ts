import React from "react";
import { MultiFactorAuthorizationFallbackScenario } from "@libs/MultiFactorAuthentication/scenarios/types";
import { MultiFactorAuthenticationScenarioParameters } from "@libs/MultiFactorAuthentication/scenarios";
import { UseMultiFactorAuthorizationFallback } from "@hooks/useMultiAuthentication/types";

// Base type for multifactorial authentication status including modal state
type ExtendedMultiFactorAuthenticationStatus<
  T extends MultiFactorAuthorizationFallbackScenario,
> = UseMultiFactorAuthorizationFallback<T> & {
  isModalShown: boolean;
};

// Main component props
type MultiFactorAuthorizationFallbackProps<
  T extends MultiFactorAuthorizationFallbackScenario,
> = {
  scenario: T;
  children: (
    shouldShowSecret: boolean,
    authorize: (props?: Record<string, unknown>) => Promise<void>,
    status: ExtendedMultiFactorAuthenticationStatus<T>,
  ) => React.ReactNode;
} & (T extends keyof MultiFactorAuthenticationScenarioParameters
  ? { params: MultiFactorAuthenticationScenarioParameters[T] }
  : { params?: undefined });

export type {
  MultiFactorAuthorizationFallbackProps,
  ExtendedMultiFactorAuthenticationStatus,
};
