import API, { SIDE_EFFECT_REQUEST_COMMANDS } from "@/src/api";
import type { AuthReturnValue, TranslationPaths } from "./types";
import { PrivateKeyStorage, PublicKeyStorage } from "./KeyStorage";
import { signToken as signTokenED25519 } from "./ED25519";
import Reason from "./Reason";

class Challenge {
  private auth: AuthReturnValue<string | undefined> = {
    value: undefined,
    reason: Reason.TPath("biometrics.reason.generic.notRequested"),
  };

  constructor(private readonly transactionID: string) {
    this.transactionID = transactionID;
  }

  private resetKeys(): Promise<AuthReturnValue<boolean>> {
    return PrivateKeyStorage.delete().then(PublicKeyStorage.delete);
  }

  private createErrorReturnValue(
    reasonKey: TranslationPaths,
  ): AuthReturnValue<boolean> {
    return {
      value: false,
      reason: Reason.TPath(reasonKey),
    };
  }

  public request(): Promise<AuthReturnValue<boolean>> {
    return API.makeRequestWithSideEffects(
      SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE,
      {},
      {},
    )
      .then(({ jsonCode, challenge }) =>
        Promise.all([
          challenge,
          jsonCode === 401 ? this.resetKeys() : Promise.resolve({}),
        ]),
      )
      .then(([challenge]) => {
        const challengeString = !!challenge
          ? JSON.stringify(challenge)
          : undefined;

        const reason = challenge
          ? Reason.TPath("biometrics.reason.success.tokenReceived")
          : Reason.TPath("biometrics.reason.error.badToken");

        this.auth = {
          value: challengeString,
          reason,
        };

        return {
          ...this.auth,
          value: true,
        };
      });
  }

  public sign(): Promise<AuthReturnValue<boolean>> {
    const {
      auth: { value: authValue },
    } = this;

    if (!authValue) {
      return Promise.resolve(
        this.createErrorReturnValue("biometrics.reason.error.tokenMissing"),
      );
    }

    return PrivateKeyStorage.get().then(({ value, type }) => {
      if (!value) {
        return this.createErrorReturnValue(
          "biometrics.reason.error.keyMissing",
        );
      }

      this.auth = {
        value: signTokenED25519(authValue, value),
        reason: Reason.TPath("biometrics.reason.success.tokenSigned"),
        type,
      };

      return {
        ...this.auth,
        value: true,
      };
    });
  }

  public send(): Promise<AuthReturnValue<boolean>> {
    if (!this.auth.value) {
      return Promise.resolve(
        this.createErrorReturnValue("biometrics.reason.error.signatureMissing"),
      );
    }

    return API.makeRequestWithSideEffects(
      SIDE_EFFECT_REQUEST_COMMANDS.AUTHORIZE_TRANSACTION,
      {
        transactionID: this.transactionID,
        signedChallenge: this.auth.value,
      },
      {},
    ).then(({ jsonCode }) => {
      if (jsonCode !== 200) {
        return this.createErrorReturnValue(
          "biometrics.reason.error.challengeRejected",
        );
      }

      return {
        value: true,
        reason: Reason.TPath("biometrics.reason.success.verificationSuccess"),
        type: this.auth.type,
      };
    });
  }
}

export default Challenge;
