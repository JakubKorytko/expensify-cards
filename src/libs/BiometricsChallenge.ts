import type { BiometricsStatus } from "@src/hooks/useBiometrics/types";
import type { TranslationPaths } from "@/base/mockTypes";
import {
  PrivateKeyStorage,
  PublicKeyStorage,
} from "@libs/BiometricsKeyStorage";
import { signToken as signTokenED25519 } from "@libs/ED25519";
import {
  authorizeTransaction,
  requestBiometricsChallenge,
} from "@libs/actions/Biometrics";

class BiometricsChallenge {
  private auth: BiometricsStatus<string | undefined> = {
    value: undefined,
    reason: "biometrics.reason.generic.notRequested",
  };

  constructor(private readonly transactionID: string) {
    this.transactionID = transactionID;
  }

  private resetKeys(): Promise<BiometricsStatus<boolean>> {
    return PrivateKeyStorage.delete().then(() => PublicKeyStorage.delete());
  }

  private createErrorReturnValue(
    reasonKey: TranslationPaths,
  ): BiometricsStatus<boolean> {
    return {
      value: false,
      reason: reasonKey,
    };
  }

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

  public sign(): Promise<BiometricsStatus<boolean>> {
    const {
      auth: { value: authValue },
    } = this;

    if (!authValue) {
      return Promise.resolve(
        this.createErrorReturnValue("biometrics.reason.error.tokenMissing"),
      );
    }

    return PrivateKeyStorage.get().then(({ value, type, reason }) => {
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
