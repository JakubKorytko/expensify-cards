/**
 * This module defines the available biometric authentication scenarios and their parameters.
 * It maps each scenario type to its corresponding implementation method and any post-processing logic.
 * The scenarios include setting up biometrics and authorizing transactions with different authentication flows.
 */
import { BiometricsScenarioMap } from "@libs/Biometrics/scenarios/types";
import CONST from "@src/CONST";
import {
  authorizeTransaction,
  registerBiometrics,
} from "@libs/actions/Biometrics";

/**
 * Defines the required parameters for each biometric scenario type.
 * Each scenario requires specific parameters:
 * - Regular transaction authorization needs a transaction ID
 * - Authorization with validation code needs a transaction ID
 * - Fallback authorization needs a transaction ID
 * - Biometrics setup needs a public key
 */
type BiometricsScenarioParameters = {
  [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION]: {
    transactionID: string;
  };
  [CONST.BIOMETRICS.SCENARIO.SETUP_BIOMETRICS]: {
    publicKey: string;
  };
};

/**
 * Maps each biometric scenario to its implementation details.
 * Regular scenarios just need a scenario method.
 * The fallback scenario includes additional post-processing and validation code storage.
 */
const BIOMETRICS_SCENARIOS = {
  [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION]: {
    allowBiometrics: true,
    allow2FA: true,
    action: authorizeTransaction,
  },
  [CONST.BIOMETRICS.SCENARIO.SETUP_BIOMETRICS]: {
    allowBiometrics: false,
    allow2FA: true,
    action: registerBiometrics,
  },
} as const satisfies BiometricsScenarioMap;

export { BIOMETRICS_SCENARIOS };
export type { BiometricsScenarioParameters };
