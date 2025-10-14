import { ValueOf } from "type-fest";
import CONST from "@src/CONST";
import { TranslationPaths } from "@src/languages/types";
import {
  BIOMETRICS_SCENARIOS,
  BiometricsScenarioParameters,
} from "@libs/Biometrics/scenarios";

type BiometricsScenarioConfig = typeof BIOMETRICS_SCENARIOS;

/**
 * Response type for biometric scenario operations
 */
type BiometricsScenarioResponse = {
  httpCode: number;
  reason: TranslationPaths;
};

/**
 * Response type that includes a success indicator
 */
type BiometricsScenarioResponseWithSuccess = {
  httpCode: number | undefined;
  successful: boolean;
};

type Simplify<T> = T extends object ? { [K in keyof T]: Simplify<T[K]> } : T;

/**
 * Core type definitions for biometrics functionality
 */

/**
 * Represents a specific biometrics scenario from the constants
 */
type BiometricsScenario = ValueOf<typeof CONST.BIOMETRICS.SCENARIO>;

/**
 * Represents a scenario that has fallback options
 */
type BiometricsFallbackScenario = ValueOf<{
  [K in keyof BiometricsScenarioConfig as BiometricsScenarioConfig[K] extends {
    allow2FA: true;
  }
    ? K
    : never]: K;
}>;

/**
 * Represents a specific biometric factor from the constants
 */
type BiometricsFactor = ValueOf<typeof CONST.BIOMETRICS.FACTORS>;

type BiometricFactors = {
  [K in BiometricsFactorsRequirements[keyof BiometricsFactorsRequirements] as K extends {
    origin: typeof CONST.BIOMETRICS.FACTORS_ORIGIN.FALLBACK;
  }
    ? never
    : K["parameter"]]: K["type"];
};

/**
 * Maps fallback scenarios to their required factors
 */
type BiometricsFallbackFactors = {
  [K in BiometricsFactorsRequirements[keyof BiometricsFactorsRequirements] as K extends {
    origin: typeof CONST.BIOMETRICS.FACTORS_ORIGIN.FALLBACK;
  }
    ? K["parameter"]
    : never]?: K["type"];
};

type AllBiometricsFactors = Simplify<
  BiometricFactors & BiometricsFallbackFactors
>;

type BiometricsScenarioAdditionalParams<T extends BiometricsScenario> =
  T extends keyof BiometricsScenarioParameters
    ? BiometricsScenarioParameters[T]
    : object;

/**
 * Parameters required for a biometric scenario, optionally including stored factor verification
 */
type BiometricsScenarioParams<T extends BiometricsScenario> =
  Partial<AllBiometricsFactors> & BiometricsScenarioAdditionalParams<T>;

/**
 * Parameters required for a fallback scenario
 */
type BiometricsFallbackScenarioParams<T extends BiometricsFallbackScenario> =
  BiometricsFallbackFactors & BiometricsScenarioAdditionalParams<T>;

/**
 * Function signature for handling a biometric scenario
 */
type BiometricsScenarioMethod<T extends BiometricsScenario> = (
  params: BiometricsScenarioParams<T>,
) => Promise<BiometricsScenarioResponse>;

/**
 * Maps scenarios to their handlers and configuration
 */
type BiometricsScenarioMap = {
  [T in BiometricsScenario]: {
    action: BiometricsScenarioMethod<T>;
    allow2FA: boolean;
    allowBiometrics: boolean;
  };
};

/**
 * Defines the requirements for each biometric factor
 */
type BiometricsFactorsRequirements =
  typeof CONST.BIOMETRICS.FACTORS_REQUIREMENTS;

export type {
  BiometricsFactor,
  BiometricsScenarioParams,
  BiometricsFallbackFactors,
  BiometricsFallbackScenario,
  BiometricsFallbackScenarioParams,
  BiometricsScenario,
  BiometricsScenarioResponse,
  BiometricsScenarioMethod,
  BiometricsScenarioMap,
  AllBiometricsFactors,
  BiometricsScenarioResponseWithSuccess,
};
