/**
 * This module defines the available biometric authentication actions and their parameters.
 * It maps each action type to its corresponding implementation method and any post-processing logic.
 * The actions include setting up biometrics and authorizing transactions with different authentication flows.
 */

import {
  BiometricsActionMap,
  BiometricsActionParams,
} from "@libs/Biometrics/types";
import CONST from "@src/CONST";
import {
  authorizeTransaction,
  registerBiometrics,
} from "@libs/actions/Biometrics";
import { postAuthorizeTransactionFallback } from "@libs/Biometrics/postBiometricsActions";

/**
 * Defines the required parameters for each biometric action type.
 * Each action requires specific parameters:
 * - Regular transaction authorization needs a transaction ID
 * - Authorization with validation code needs a transaction ID
 * - Fallback authorization needs a transaction ID
 * - Biometrics setup needs a public key
 */
type BiometricsActionParameters = {
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION]: {
    transactionID: string;
  };
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE]: {
    transactionID: string;
  };
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION_FALLBACK]: {
    transactionID: string;
  };
  [CONST.BIOMETRICS.ACTION.SETUP_BIOMETRICS]: {
    publicKey: string;
  };
};

/**
 * Maps each biometric action to its implementation details.
 * Regular actions just need an action method.
 * The fallback action includes additional post-processing and validation code storage.
 */
const biometricsActions = {
  [CONST.BIOMETRICS.ACTION.SETUP_BIOMETRICS]: {
    actionMethod: registerBiometrics,
  },
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION]: {
    actionMethod: authorizeTransaction,
  },
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE]: {
    actionMethod: authorizeTransaction,
  },
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION_FALLBACK]: {
    actionMethod: authorizeTransaction,
    postActionMethod: postAuthorizeTransactionFallback,
    factorToStore: CONST.BIOMETRICS.FACTORS.VALIDATE_CODE,
  },
} as const satisfies BiometricsActionMap;

export default biometricsActions;
export type { BiometricsActionParams, BiometricsActionParameters };
