import type { TranslationPaths } from "@src/languages/types";
import { BiometricsPrivateKeyStore } from "@libs/Biometrics/BiometricsKeyStore";
import { signToken as signTokenED25519 } from "@libs/ED25519";
import { requestBiometricsChallenge } from "@libs/actions/Biometrics";
import authorizeBiometricsAction from "@libs/Biometrics/authorizeBiometricsAction";
import CONST from "@src/CONST";
import { BiometricsPartialStatus } from "@hooks/useBiometricsStatus/types";

/**
 * This class can be used to create an object associated with a transaction.
 * Methods of the created object are called without any arguments or parameters.
 * The standard flow is request -> sign -> send.
 *
 * This logic ensures that the transaction on which we are operating will not change between steps,
 * thereby preventing unexpected errors.
 * It also facilitates obtaining the current status and feedback of each step in the challenge process.
 */
class BiometricsChallenge {
  /** Current status of the auth process */
  private auth: BiometricsPartialStatus<string | undefined> = {
    value: undefined,
    reason: "biometrics.reason.generic.notRequested",
  };

  constructor(private readonly transactionID: string) {
    this.transactionID = transactionID;
  }

  /** Internal helper method to create an error value object */
  private createErrorReturnValue(
    reasonKey: TranslationPaths,
  ): BiometricsPartialStatus<boolean> {
    return {
      value: false,
      reason: reasonKey,
    };
  }

  /** Request challenge from the API */
  public request(): Promise<BiometricsPartialStatus<boolean>> {
    return requestBiometricsChallenge()
      .then(({ httpCode, challenge, reason }) =>
        Promise.all([
          challenge,
          reason,
          httpCode === 401 ? Promise.resolve(false) : Promise.resolve(true),
        ]),
      )
      .then(([challenge, apiReason, syncedBE]) => {
        if (!syncedBE) {
          return {
            value: false,
            reason: "biometrics.reason.error.keyMissingOnTheBE",
          };
        }

        const challengeString = !!challenge
          ? JSON.stringify(challenge)
          : undefined;

        const isReasonIncluded = !apiReason.endsWith("unknownResponse");

        const reason = isReasonIncluded
          ? apiReason
          : "biometrics.reason.error.badToken";

        this.auth = {
          value: challengeString,
          reason: challenge
            ? "biometrics.reason.success.tokenReceived"
            : reason,
        };

        return {
          ...this.auth,
          value: true,
        };
      });
  }

  /**
   * Sign requested challenge with the private key.
   * Chained private key status can be provided to avoid fetching the private key again if it was already obtained.
   *
   * IMPORTANT: Using this method will display authentication prompt
   */
  public sign(
    chainedPrivateKeyStatus?: BiometricsPartialStatus<string | null>,
  ): Promise<BiometricsPartialStatus<boolean>> {
    const {
      auth: { value: authValue },
    } = this;

    if (!authValue) {
      return Promise.resolve(
        this.createErrorReturnValue("biometrics.reason.error.tokenMissing"),
      );
    }

    const privateKeyPromise = !!chainedPrivateKeyStatus?.value
      ? Promise.resolve(chainedPrivateKeyStatus)
      : BiometricsPrivateKeyStore.get();

    return privateKeyPromise.then(({ value, type, reason }) => {
      if (!value) {
        return this.createErrorReturnValue(
          reason || "biometrics.reason.error.keyMissing",
        );
      }

      this.auth = {
        value: signTokenED25519(authValue, value),
        reason: "biometrics.reason.success.tokenSigned",
        type,
      };

      return {
        ...this.auth,
        value: true,
      };
    });
  }

  /**
   * Send signed challenge to the API to verify it
   * If the device is not configured for biometrics, or it is re-registering, a validation code must be provided.
   * This function assumes that if the validation code is provided, the device is not configured for biometrics.
   */
  public send(
    validateCode?: number,
  ): Promise<BiometricsPartialStatus<boolean>> {
    if (!this.auth.value) {
      return Promise.resolve(
        this.createErrorReturnValue("biometrics.reason.error.signatureMissing"),
      );
    }

    let authorizationResult;

    if (validateCode) {
      authorizationResult = authorizeBiometricsAction(
        CONST.BIOMETRICS.DEVICE_BIOMETRICS_STATUS.NOT_CONFIGURED,
        this.transactionID,
        {
          signedChallenge: this.auth.value,
          validateCode,
        },
      );
    } else {
      authorizationResult = authorizeBiometricsAction(
        CONST.BIOMETRICS.DEVICE_BIOMETRICS_STATUS.CONFIGURED,
        this.transactionID,
        {
          signedChallenge: this.auth.value,
        },
      );
    }

    return authorizationResult.then(({ reason, value }) => {
      if (!value) {
        const isReasonIncluded = !reason.endsWith("unknownResponse");

        return this.createErrorReturnValue(
          isReasonIncluded
            ? reason
            : "biometrics.reason.error.challengeRejected",
        );
      }
      return {
        value: true,
        reason: "biometrics.reason.success.verificationSuccess",
        type: this.auth.type,
      };
    });
  }
}

export default BiometricsChallenge;
