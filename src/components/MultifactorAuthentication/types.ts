import React from "react";
import { BiometricsFallbackScenario } from "@libs/Biometrics/scenarios/types";
import { BiometricsScenarioParameters } from "@libs/Biometrics/scenarios";
import { UseBiometricsAuthorizationFallback } from "@hooks/useMultiAuthentication/types";

// Base type for biometrics status including modal state
type ExtendedBiometricsStatus<T extends BiometricsFallbackScenario> =
  UseBiometricsAuthorizationFallback<T> & {
    isModalShown: boolean;
  };

// Main component props
type BiometricsFallbackProps<T extends BiometricsFallbackScenario> = {
  scenario: T;
  children: (
    shouldShowSecret: boolean,
    authorize: (props?: Record<string, unknown>) => Promise<void>,
    status: ExtendedBiometricsStatus<T>,
  ) => React.ReactNode;
} & (T extends keyof BiometricsScenarioParameters
  ? { params: BiometricsScenarioParameters[T] }
  : { params?: undefined });

export type { BiometricsFallbackProps, ExtendedBiometricsStatus };
