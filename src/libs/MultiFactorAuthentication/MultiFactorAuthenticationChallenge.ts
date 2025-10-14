import type { TranslationPaths } from "@src/languages/types";
import { MultiFactorAuthenticationPrivateKeyStore } from "@libs/MultiFactorAuthentication/MultiFactorAuthenticationKeyStore";
import { signToken as signTokenED25519 } from "@libs/ED25519";
import { requestMultiFactorAuthenticationChallenge } from "@libs/actions/MultiFactorAuthentication";
import processMultiFactorAuthenticationScenario from "@libs/MultiFactorAuthentication/scenarios/processMultiFactorAuthenticationScenario";
import CONST from "@src/CONST";
import { MultiFactorAuthenticationPartialStatus } from "@hooks/useMultiAuthentication/types";

/**
 * Handles the multifactorial authentication challenge flow for a specific transaction.
 * Maintains state between steps to ensure transaction consistency.
 *
 * The standard authentication flow is:
 * 1. Request a challenge from the API
 * 2. Sign the challenge using multifactorial authentication
 * 3. Send the signed challenge back for verification
 *
 * Each step provides detailed status feedback through MultiFactorAuthenticationPartialStatus objects.
 */
class MultiFactorAuthenticationChallenge {
  /** Tracks the current state and status of the authentication process */
  private auth: MultiFactorAuthenticationPartialStatus<
    string | undefined,
    true
  > = {
    value: undefined,
    reason: "multiFactorAuthentication.reason.generic.notRequested",
  };

  constructor(private readonly transactionID: string) {}

  /** Creates a standardized error response with the given reason key */
  private createErrorReturnValue(
    reasonKey: TranslationPaths,
  ): MultiFactorAuthenticationPartialStatus<boolean, true> {
    return { value: false, reason: reasonKey };
  }

  /**
   * Initiates the challenge process by requesting a new challenge from the API.
   * Verifies the backend is properly synced and handles the challenge response.
   */
  public async request(): Promise<
    MultiFactorAuthenticationPartialStatus<boolean, true>
  > {
    const {
      httpCode,
      challenge,
      reason: apiReason,
    } = await requestMultiFactorAuthenticationChallenge();
    const syncedBE = httpCode !== 401;

    if (!syncedBE) {
      return this.createErrorReturnValue(
        "multiFactorAuthentication.reason.error.keyMissingOnTheBE",
      );
    }

    const challengeString = challenge ? JSON.stringify(challenge) : undefined;
    const reason = apiReason.endsWith("unknownResponse")
      ? "multiFactorAuthentication.reason.error.badToken"
      : apiReason;

    this.auth = {
      value: challengeString,
      reason: challenge
        ? "multiFactorAuthentication.reason.success.tokenReceived"
        : reason,
    };

    return { ...this.auth, value: true };
  }

  /**
   * Signs the challenge using the private key stored in secure storage.
   * Triggers a biometric authentication prompt when accessing the private key.
   * Can reuse a previously fetched private key status to avoid multiple auth prompts.
   */
  public async sign(
    chainedPrivateKeyStatus?: MultiFactorAuthenticationPartialStatus<
      string | null,
      true
    >,
  ): Promise<MultiFactorAuthenticationPartialStatus<boolean, true>> {
    if (!this.auth.value) {
      return this.createErrorReturnValue(
        "multiFactorAuthentication.reason.error.tokenMissing",
      );
    }

    const { value, type, reason } = chainedPrivateKeyStatus?.value
      ? chainedPrivateKeyStatus
      : await MultiFactorAuthenticationPrivateKeyStore.get();

    if (!value) {
      return this.createErrorReturnValue(
        reason || "multiFactorAuthentication.reason.error.keyMissing",
      );
    }

    this.auth = {
      value: signTokenED25519(this.auth.value, value),
      reason: "multiFactorAuthentication.reason.success.tokenSigned",
      type,
    };

    return { ...this.auth, value: true };
  }

  /**
   * Sends the signed challenge to the API for verification.
   * Handles both configured and unconfigured device states.
   * For unconfigured devices or re-registration, requires a validation code.
   */
  public async send(): Promise<
    MultiFactorAuthenticationPartialStatus<boolean, true>
  > {
    if (!this.auth.value) {
      return this.createErrorReturnValue(
        "multiFactorAuthentication.reason.error.signatureMissing",
      );
    }

    const authorizationResult = processMultiFactorAuthenticationScenario(
      CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION,
      {
        signedChallenge: this.auth.value,

        transactionID: this.transactionID,
      },
    );

    const {
      reason,
      step: { wasRecentStepSuccessful, isRequestFulfilled },
    } = await authorizationResult;

    if (!wasRecentStepSuccessful || !isRequestFulfilled) {
      return this.createErrorReturnValue(
        reason.endsWith("unknownResponse")
          ? "multiFactorAuthentication.reason.error.challengeRejected"
          : reason,
      );
    }

    return {
      value: true,
      reason: "multiFactorAuthentication.reason.success.verificationSuccess",
      type: this.auth.type,
    };
  }
}

export default MultiFactorAuthenticationChallenge;
