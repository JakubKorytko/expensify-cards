/**
 * This module defines the available multifactorial authentication scenarios and their parameters.
 * It maps each scenario type to its corresponding implementation method and any post-processing logic.
 * The scenarios include setting up multifactorial authentication and authorizing transactions with different authentication flows.
 */
import {authorizeTransaction} from '@libs/actions/MultifactorAuthentication';
import type {MultifactorAuthenticationScenarioMap} from '@libs/MultifactorAuthentication/Biometrics/types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import ROUTES from '@src/ROUTES';
import SCENARIO from './scenarios';

/**
 * Defines the required parameters for each multifactorial authentication scenario type.
 * Each scenario requires specific parameters:
 * - Regular transaction authorization needs a transaction ID
 * - Authorization with validation code needs a transaction ID
 * - Fallback authorization needs a transaction ID
 * - Multi-factor authentication setup needs a public key
 */
type MultifactorAuthenticationScenarioParameters = {
    [SCENARIO.AUTHORIZE_TRANSACTION]: {
        transactionID: string;
    };
};

/**
 * Maps each multifactorial authentication scenario to its implementation details.
 * Regular scenarios just need a scenario method.
 * The fallback scenario includes additional post-processing and validation code storage.
 */
const MULTI_FACTOR_AUTHENTICATION_SCENARIOS = {
    [SCENARIO.AUTHORIZE_TRANSACTION]: {
        securityLevel: VALUES.SECURITY_LEVEL.BIOMETRICS_WITH_FALLBACK,
        action: authorizeTransaction,
        route: ROUTES.AUTHORIZE_TRANSACTION,
    },
} as const satisfies MultifactorAuthenticationScenarioMap;

export default MULTI_FACTOR_AUTHENTICATION_SCENARIOS;
export type {MultifactorAuthenticationScenarioParameters};
