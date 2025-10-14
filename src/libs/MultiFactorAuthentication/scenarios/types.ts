import { ValueOf } from "type-fest";
import CONST from "@src/CONST";
import { TranslationPaths } from "@src/languages/types";
import {
  MULTI_FACTOR_AUTHENTICATION_SCENARIOS,
  MultiFactorAuthenticationScenarioParameters,
} from "@libs/MultiFactorAuthentication/scenarios";

type MultiFactorAuthenticationScenarioConfig =
  typeof MULTI_FACTOR_AUTHENTICATION_SCENARIOS;

/**
 * Response type for multifactorial authentication scenario operations
 */
type MultiFactorAuthenticationScenarioResponse = {
  httpCode: number;
  reason: TranslationPaths;
};

/**
 * Response type that includes a success indicator
 */
type MultiFactorAuthenticationScenarioResponseWithSuccess = {
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
type MultiFactorAuthenticationScenario = ValueOf<
  typeof CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO
>;

/**
 * Represents a scenario that has fallback options
 */
type MultiFactorAuthorizationFallbackScenario = ValueOf<{
  [K in keyof MultiFactorAuthenticationScenarioConfig as MultiFactorAuthenticationScenarioConfig[K] extends {
    allow2FA: true;
  }
    ? K
    : never]: K;
}>;

/**
 * Represents a specific multifactorial authentication factor from the constants
 */
type MultiFactorAuthenticationFactor = ValueOf<
  typeof CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS
>;

type MultiFactorAuthenticationFactors = {
  [K in MultiFactorAuthenticationFactorsRequirements[keyof MultiFactorAuthenticationFactorsRequirements] as K extends {
    origin: typeof CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_ORIGIN.FALLBACK;
  }
    ? never
    : K["parameter"]]: K["type"];
};

/**
 * Maps fallback scenarios to their required factors
 */
type MultiFactorAuthorizationFallbackFactors = {
  [K in MultiFactorAuthenticationFactorsRequirements[keyof MultiFactorAuthenticationFactorsRequirements] as K extends {
    origin: typeof CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_ORIGIN.FALLBACK;
  }
    ? K["parameter"]
    : never]?: K["type"];
};

type AllMultiFactorAuthenticationFactors = Simplify<
  MultiFactorAuthenticationFactors & MultiFactorAuthorizationFallbackFactors
>;

type MultiFactorAuthenticationScenarioAdditionalParams<
  T extends MultiFactorAuthenticationScenario,
> = T extends keyof MultiFactorAuthenticationScenarioParameters
  ? MultiFactorAuthenticationScenarioParameters[T]
  : object;

/**
 * Parameters required for a multifactorial authentication scenario, optionally including stored factor verification
 */
type MultiFactorAuthenticationScenarioParams<
  T extends MultiFactorAuthenticationScenario,
> = Partial<AllMultiFactorAuthenticationFactors> &
  MultiFactorAuthenticationScenarioAdditionalParams<T>;

/**
 * Parameters required for a fallback scenario
 */
type MultiFactorAuthorizationFallbackScenarioParams<
  T extends MultiFactorAuthorizationFallbackScenario,
> = MultiFactorAuthorizationFallbackFactors &
  MultiFactorAuthenticationScenarioAdditionalParams<T>;

/**
 * Function signature for handling a multifactorial authentication scenario
 */
type MultiFactorAuthenticationScenarioMethod<
  T extends MultiFactorAuthenticationScenario,
> = (
  params: MultiFactorAuthenticationScenarioParams<T>,
) => Promise<MultiFactorAuthenticationScenarioResponse>;

/**
 * Maps scenarios to their handlers and configuration
 */
type MultiFactorAuthenticationScenarioMap = {
  [T in MultiFactorAuthenticationScenario]: {
    action: MultiFactorAuthenticationScenarioMethod<T>;
    allow2FA: boolean;
    allowBiometrics: boolean;
  };
};

/**
 * Defines the requirements for each multifactorial authentication factor
 */
type MultiFactorAuthenticationFactorsRequirements =
  typeof CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS;

export type {
  MultiFactorAuthenticationFactor,
  MultiFactorAuthenticationScenarioParams,
  MultiFactorAuthorizationFallbackFactors,
  MultiFactorAuthorizationFallbackScenario,
  MultiFactorAuthorizationFallbackScenarioParams,
  MultiFactorAuthenticationScenario,
  MultiFactorAuthenticationScenarioResponse,
  MultiFactorAuthenticationScenarioMethod,
  MultiFactorAuthenticationScenarioMap,
  AllMultiFactorAuthenticationFactors,
  MultiFactorAuthenticationScenarioResponseWithSuccess,
};
