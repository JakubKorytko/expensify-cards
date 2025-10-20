/**
 * This module defines the available multifactorial authentication scenarios and their parameters.
 * It maps each scenario type to its corresponding implementation method and any post-processing logic.
 * The scenarios include setting up multifactorial authentication and authorizing transactions with different authentication flows.
 */
import {authorizeTransaction, registerBiometrics} from '@libs/actions/MultifactorAuthentication';
import type {MultifactorAuthenticationScenarioMap} from './types';
import VALUES from './VALUES';

/**
 * Defines the required parameters for each multifactorial authentication scenario type.
 * Each scenario requires specific parameters:
 * - Regular transaction authorization needs a transaction ID
 * - Authorization with validation code needs a transaction ID
 * - Fallback authorization needs a transaction ID
 * - Multi-factor authentication setup needs a public key
 */
type MultifactorAuthenticationScenarioParameters = {
    [VALUES.SCENARIO.AUTHORIZE_TRANSACTION]: {
        transactionID: string;
    };
    [VALUES.SCENARIO.SETUP_BIOMETRICS]: {
        publicKey: string;
    };
};

/**
 * Maps each multifactorial authentication scenario to its implementation details.
 * Regular scenarios just need a scenario method.
 * The fallback scenario includes additional post-processing and validation code storage.
 */
const MULTI_FACTOR_AUTHENTICATION_SCENARIOS = {
    [VALUES.SCENARIO.AUTHORIZE_TRANSACTION]: {
        securityLevel: VALUES.SECURITY_LEVEL.BIOMETRICS_WITH_FALLBACK,
        action: authorizeTransaction,
    },
    [VALUES.SCENARIO.SETUP_BIOMETRICS]: {
        securityLevel: VALUES.SECURITY_LEVEL.FALLBACK_ONLY,
        action: registerBiometrics,
    },
} as const satisfies MultifactorAuthenticationScenarioMap;

export default MULTI_FACTOR_AUTHENTICATION_SCENARIOS;
export type {MultifactorAuthenticationScenarioParameters};
