import API, { READ_COMMANDS, WRITE_COMMANDS } from "@/src/api";
import type { AuthReturnValue, TranslationPaths } from "./types";
import { PrivateKeyStorage, PublicKeyStorage } from "./KeyStorage";
import { signToken as signTokenED25519 } from "./ED25519";
import Reason from "./Reason";

class Challenge {
  public auth: AuthReturnValue<string | undefined> = {
    value: undefined,
    reason: Reason.TPath("biometrics.reason.generic.notRequested"),
  };

  private async resetKeys(): Promise<void> {
    await PrivateKeyStorage.delete();
    await PublicKeyStorage.delete();
  }

  private createErrorReturnValue(
    reasonKey: TranslationPaths,
  ): AuthReturnValue<boolean> {
    return {
      value: false,
      reason: Reason.TPath(reasonKey),
    };
  }

  public async request(): Promise<AuthReturnValue<boolean>> {
    const { status, response } = await API.read(
      READ_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE,
    );

    if (status === 401) await this.resetKeys();

    const challenge = !!response
      ? JSON.stringify(response.challenge)
      : undefined;

    const reason = challenge
      ? Reason.TPath("biometrics.reason.success.tokenReceived")
      : Reason.TPath("biometrics.reason.error.badToken");

    this.auth = {
      value: challenge,
      reason,
    };

    return {
      ...this.auth,
      value: true,
    };
  }

  public async sign(): Promise<AuthReturnValue<boolean>> {
    if (!this.auth.value) {
      return this.createErrorReturnValue(
        "biometrics.reason.error.tokenMissing",
      );
    }

    const { value, type } = await PrivateKeyStorage.get();

    if (!value) {
      return this.createErrorReturnValue("biometrics.reason.error.keyMissing");
    }

    this.auth = {
      value: signTokenED25519(this.auth.value, value),
      reason: Reason.TPath("biometrics.reason.success.tokenSigned"),
      type,
    };

    return {
      ...this.auth,
      value: true,
    };
  }

  public async send(transactionID: string): Promise<AuthReturnValue<boolean>> {
    if (!this.auth.value) {
      return this.createErrorReturnValue(
        "biometrics.reason.error.signatureMissing",
      );
    }

    const { status } = await API.write(WRITE_COMMANDS.AUTHORIZE_TRANSACTION, {
      transactionID,
      signedChallenge: this.auth.value,
    });

    if (status !== 200) {
      return this.createErrorReturnValue(
        "biometrics.reason.error.challengeRejected",
      );
    }

    return {
      value: true,
      reason: Reason.TPath("biometrics.reason.success.verificationSuccess"),
      type: this.auth.type,
    };
  }
}

export default Challenge;
