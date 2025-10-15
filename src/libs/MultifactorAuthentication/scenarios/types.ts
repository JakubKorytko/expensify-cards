import { ValueOf } from "type-fest";
import CONST from "@src/CONST";
import { TranslationPaths } from "@src/languages/types";
import {
  MULTI_FACTOR_AUTHENTICATION_SCENARIOS,
  MultifactorAuthenticationScenarioParameters,
} from "@libs/MultifactorAuthentication/scenarios";

type MultifactorAuthenticationScenarioConfig =
  typeof MULTI_FACTOR_AUTHENTICATION_SCENARIOS;

/**
 * Response type for multifactorial authentication scenario operations
 */
type MultifactorAuthenticationScenarioResponse = {
  httpCode: number;
  reason: TranslationPaths;
};

/**
 * Response type that includes a success indicator
 */
type MultifactorAuthenticationScenarioResponseWithSuccess = {
  httpCode: number | undefined;
  successful: boolean;
};

type Simplify<T> = T extends object ? { [K in keyof T]: Simplify<T[K]> } : T;

/**
 * Core type definitions for multifactorial authentication functionality
 */

/**
 * Represents a specific multifactorial authentication scenario from the constants
 */
type MultifactorAuthenticationScenario = ValueOf<
  typeof CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO
>;

/**
 * Represents a scenario that has fallback options
 */
type MultifactorAuthorizationFallbackScenario = ValueOf<{
  [K in keyof MultifactorAuthenticationScenarioConfig as MultifactorAuthenticationScenarioConfig[K] extends {
    allow2FA: true;
  }
    ? K
    : never]: K;
}>;

/**
 * Represents a specific multifactorial authentication factor from the constants
 */
type MultifactorAuthenticationFactor = ValueOf<
  typeof CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS
>;

type MultifactorAuthenticationFactors = {
  [K in MultifactorAuthenticationFactorsRequirements[keyof MultifactorAuthenticationFactorsRequirements] as K extends {
    origin: typeof CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_ORIGIN.FALLBACK;
  }
    ? never
    : K["parameter"]]: K["type"];
};

/**
 * Maps fallback scenarios to their required factors
 */
type MultifactorAuthorizationFallbackFactors = {
  [K in MultifactorAuthenticationFactorsRequirements[keyof MultifactorAuthenticationFactorsRequirements] as K extends {
    origin: typeof CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_ORIGIN.FALLBACK;
  }
    ? K["parameter"]
    : never]?: K["type"];
};

type AllMultifactorAuthenticationFactors = Simplify<
  MultifactorAuthenticationFactors & MultifactorAuthorizationFallbackFactors
>;

type MultifactorAuthenticationScenarioAdditionalParams<
  T extends MultifactorAuthenticationScenario,
> = T extends keyof MultifactorAuthenticationScenarioParameters
  ? MultifactorAuthenticationScenarioParameters[T]
  : object;

/**
 * Parameters required for a multifactorial authentication scenario, optionally including stored factor verification
 */
type MultifactorAuthenticationScenarioParams<
  T extends MultifactorAuthenticationScenario,
> = Partial<AllMultifactorAuthenticationFactors> &
  MultifactorAuthenticationScenarioAdditionalParams<T>;

/**
 * Parameters required for a fallback scenario
 */
type MultifactorAuthorizationFallbackScenarioParams<
  T extends MultifactorAuthorizationFallbackScenario,
> = MultifactorAuthorizationFallbackFactors &
  MultifactorAuthenticationScenarioAdditionalParams<T>;

/**
 * Function signature for handling a multifactorial authentication scenario
 */
type MultifactorAuthenticationScenarioMethod<
  T extends MultifactorAuthenticationScenario,
> = (
  params: MultifactorAuthenticationScenarioParams<T>,
) => Promise<MultifactorAuthenticationScenarioResponse>;

/**
 * Maps scenarios to their handlers and configuration
 */
type MultifactorAuthenticationScenarioMap = {
  [T in MultifactorAuthenticationScenario]: {
    action: MultifactorAuthenticationScenarioMethod<T>;
    allow2FA: boolean;
    allowBiometrics: boolean;
  };
};

/**
 * Defines the requirements for each multifactorial authentication factor
 */
type MultifactorAuthenticationFactorsRequirements =
  typeof CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS;

export type {
  MultifactorAuthenticationFactor,
  MultifactorAuthenticationScenarioParams,
  MultifactorAuthorizationFallbackFactors,
  MultifactorAuthorizationFallbackScenario,
  MultifactorAuthorizationFallbackScenarioParams,
  MultifactorAuthenticationScenario,
  MultifactorAuthenticationScenarioResponse,
  MultifactorAuthenticationScenarioMethod,
  MultifactorAuthenticationScenarioMap,
  AllMultifactorAuthenticationFactors,
  MultifactorAuthenticationScenarioResponseWithSuccess,
};
