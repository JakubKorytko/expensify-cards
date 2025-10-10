/**
 * This module defines the available biometric authentication scenarios and their parameters.
 * It maps each scenario type to its corresponding implementation method and any post-processing logic.
 * The scenarios include setting up biometrics and authorizing transactions with different authentication flows.
 */
import {
  BiometricsScenarioMap,
  BiometricsRequiredFactorsRecord,
} from "@libs/Biometrics/scenarios/types";
import CONST from "@src/CONST";
import {
  authorizeTransaction,
  registerBiometrics,
} from "@libs/actions/Biometrics";
import { postAuthorizeTransactionFallback } from "@libs/Biometrics/scenarios/postBiometricsScenarioMethods";
import processBiometricsScenario from "@libs/Biometrics/scenarios/processBiometricsScenario";

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
  [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE]: {
    transactionID: string;
  };
  [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_FALLBACK]: {
    transactionID: string;
  };
  [CONST.BIOMETRICS.SCENARIO.SETUP_BIOMETRICS]: {
    publicKey: string;
  };
};

const biometricsScenarioRequiredFactors = {
  [CONST.BIOMETRICS.SCENARIO.SETUP_BIOMETRICS]: [
    CONST.BIOMETRICS.FACTORS.VALIDATE_CODE,
  ],
  [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION]: [
    CONST.BIOMETRICS.FACTORS.SIGNED_CHALLENGE,
  ],
  [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE]: [
    CONST.BIOMETRICS.FACTORS.SIGNED_CHALLENGE,
    CONST.BIOMETRICS.FACTORS.VALIDATE_CODE,
  ],
  [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_FALLBACK]: [
    CONST.BIOMETRICS.FACTORS.VALIDATE_CODE,
    CONST.BIOMETRICS.FACTORS.OTP,
  ],
} as const satisfies BiometricsRequiredFactorsRecord;

/**
 * Maps each biometric scenario to its implementation details.
 * Regular scenarios just need a scenario method.
 * The fallback scenario includes additional post-processing and validation code storage.
 */
const biometricsScenarios = {
  [CONST.BIOMETRICS.SCENARIO.SETUP_BIOMETRICS]: {
    scenarioMethod: registerBiometrics,
  },
  [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION]: {
    scenarioMethod: authorizeTransaction,
  },
  [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE]: {
    scenarioMethod: authorizeTransaction,
  },
  [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_FALLBACK]: {
    scenarioMethod: authorizeTransaction,
    postScenarioMethod: postAuthorizeTransactionFallback,
    factorToStore: CONST.BIOMETRICS.FACTORS.VALIDATE_CODE,
  },
} as const satisfies BiometricsScenarioMap;

export {
  biometricsScenarios,
  biometricsScenarioRequiredFactors,
  processBiometricsScenario,
};
export type { BiometricsScenarioParameters };
