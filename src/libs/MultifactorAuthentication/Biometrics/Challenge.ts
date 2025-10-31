import {requestBiometricChallenge} from '@libs/actions/MultifactorAuthentication';
import type {TranslationPaths} from '@src/languages/types';
import {signToken as signTokenED25519} from './ED25519';
import {isChallengeSigned, processScenario} from './helpers';
import {PrivateKeyStore, PublicKeyStore} from './KeyStore';
import type {MFAChallenge, MultifactorAuthenticationPartialStatus, MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioAdditionalParams, SignedChallenge} from './types';
import VALUES from './VALUES';

/**
 * Handles the multifactorial authentication challenge flow for a specific transaction.
 * Maintains state between steps to ensure transaction consistency.
 *
 * The standard authentication flow is:
 * 1. Request a challenge from the API
 * 2. Sign the challenge using multifactorial authentication
 * 3. Send the signed challenge back for verification
 *
 * Each step provides detailed status feedback through MultifactorAuthenticationPartialStatus objects.
 */
class MultifactorAuthenticationChallenge<T extends MultifactorAuthenticationScenario> {
    /** Tracks the current state and status of the authentication process */
    private auth: MultifactorAuthenticationPartialStatus<MFAChallenge | SignedChallenge | undefined, true> = {
        value: undefined,
        reason: 'multifactorAuthentication.reason.generic.notRequested',
    };

    constructor(
        private readonly scenario: T,
        private readonly params: MultifactorAuthenticationScenarioAdditionalParams<T>,
    ) {}

    /** Creates a standardized error response with the given reason key */
    private createErrorReturnValue(reasonKey: TranslationPaths): MultifactorAuthenticationPartialStatus<boolean, true> {
        return {value: false, reason: reasonKey};
    }

    /**
     * Initiates the challenge process by requesting a new challenge from the API.
     * Verifies the backend is properly synced and handles the challenge response.
     */
    public async request(accountID: number): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        const {httpCode, challenge, reason: apiReason} = await requestBiometricChallenge();
        const syncedBE = httpCode !== 401;

        if (!syncedBE) {
            await PrivateKeyStore.delete(accountID);
            await PublicKeyStore.delete(accountID);
            return this.createErrorReturnValue('multifactorAuthentication.reason.error.keyMissingOnTheBE');
        }

        const reason = apiReason.endsWith('unknownResponse') ? 'multifactorAuthentication.reason.error.badToken' : apiReason;

        this.auth = {
            value: challenge,
            reason: challenge ? 'multifactorAuthentication.reason.success.tokenReceived' : reason,
        };

        return {...this.auth, value: true};
    }

    /**
     * Signs the challenge using the private key stored in secure storage.
     * Triggers a biometric authentication prompt when accessing the private key.
     * Can reuse a previously fetched private key status to avoid multiple auth prompts.
     */
    public async sign(
        accountID: number,
        chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null, true>,
    ): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        if (!this.auth.value) {
            return this.createErrorReturnValue('multifactorAuthentication.reason.error.tokenMissing');
        }

        if (isChallengeSigned(this.auth.value)) {
            return this.createErrorReturnValue('multifactorAuthentication.reason.error.challengeIsAlreadySigned');
        }

        const {value, type, reason} = chainedPrivateKeyStatus?.value ? chainedPrivateKeyStatus : await PrivateKeyStore.get(accountID);

        if (!value) {
            return this.createErrorReturnValue(reason || 'multifactorAuthentication.reason.error.keyMissing');
        }

        this.auth = {
            value: signTokenED25519(accountID, this.auth.value, value),
            reason: 'multifactorAuthentication.reason.success.tokenSigned',
            type,
        };

        return {...this.auth, value: true};
    }

    /**
     * Sends the signed challenge to the API for verification.
     * Handles both configured and not configured device states.
     * For not configured devices or re-registration, requires a validation code.
     */
    public async send(): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        if (!this.auth.value || !isChallengeSigned(this.auth.value)) {
            return this.createErrorReturnValue('multifactorAuthentication.reason.error.signatureMissing');
        }

        const authorizationResult = processScenario(
            this.scenario,
            {
                ...this.params,
                signedChallenge: this.auth.value,
            },
            VALUES.FACTOR_COMBINATIONS.BIOMETRICS_AUTHENTICATION,
        );

        const {
            reason,
            step: {wasRecentStepSuccessful, isRequestFulfilled},
        } = await authorizationResult;

        if (!wasRecentStepSuccessful || !isRequestFulfilled) {
            return this.createErrorReturnValue(reason.endsWith('unknownResponse') ? 'multifactorAuthentication.reason.error.challengeRejected' : reason);
        }

        return {
            value: true,
            reason: 'multifactorAuthentication.reason.success.verificationSuccess',
            type: this.auth.type,
        };
    }
}

export default MultifactorAuthenticationChallenge;
