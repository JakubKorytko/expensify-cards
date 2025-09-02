import type { BiometricsStatus } from "@src/hooks/useBiometrics/types";
import type { TranslationPaths } from "@/base/mockTypes";
import {
  BiometricsPrivateKeyStore,
  BiometricsPublicKeyStore,
} from "@libs/BiometricsKeyStorage";
import { signToken as signTokenED25519 } from "@libs/ED25519";
import {
  authorizeTransaction,
  requestBiometricsChallenge,
} from "@libs/actions/Biometrics";

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
  private auth: BiometricsStatus<string | undefined> = {
    value: undefined,
    reason: "biometrics.reason.generic.notRequested",
  };

  constructor(private readonly transactionID: string) {
    this.transactionID = transactionID;
  }

  /**
   * Internal helper method to remove both keys from SecureStore
   * Called when the keys are stored on the device but not on the backend.
   */
  private resetKeys(): Promise<BiometricsStatus<boolean>> {
    return BiometricsPrivateKeyStore.delete().then(() =>
      BiometricsPublicKeyStore.delete(),
    );
  }

  /** Internal helper method to create an error value object */
  private createErrorReturnValue(
    reasonKey: TranslationPaths,
  ): BiometricsStatus<boolean> {
    return {
      value: false,
      reason: reasonKey,
    };
  }

  /** Request challenge from the API */
  public request(): Promise<BiometricsStatus<boolean>> {
    return requestBiometricsChallenge()
      .then(({ httpCode, challenge, reason }) =>
        Promise.all([
          challenge,
          reason,
          httpCode === 401 ? this.resetKeys() : Promise.resolve({}),
        ]),
      )
      .then(([challenge, apiReason]) => {
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
   *
   * IMPORTANT: Using this method will display authentication prompt
   */
  public sign(): Promise<BiometricsStatus<boolean>> {
    const {
      auth: { value: authValue },
    } = this;

    if (!authValue) {
      return Promise.resolve(
        this.createErrorReturnValue("biometrics.reason.error.tokenMissing"),
      );
    }

    return BiometricsPrivateKeyStore.get().then(({ value, type, reason }) => {
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

  /** Send signed challenge to the API to verify it */
  public send(): Promise<BiometricsStatus<boolean>> {
    if (!this.auth.value) {
      return Promise.resolve(
        this.createErrorReturnValue("biometrics.reason.error.signatureMissing"),
      );
    }

    return authorizeTransaction(this.transactionID, this.auth.value).then(
      ({ httpCode, reason }) => {
        if (httpCode !== 200) {
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
      },
    );
  }
}

export default BiometricsChallenge;
