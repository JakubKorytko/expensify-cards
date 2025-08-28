import API, { READ_COMMANDS, WRITE_COMMANDS } from "@/src/api";
import type { AuthReturnValue } from "./types";
import { PrivateKeyStorage, PublicKeyStorage } from "./KeyStorage";
import { signToken as signTokenED25519 } from "./ED25519";
import { ReasonTranslation } from "./Reason";

class Challenge {
  auth: AuthReturnValue<string | undefined> = {
    value: undefined,
    reason: new ReasonTranslation("biometrics.reason.generic.notRequested"),
  };
  signed?: boolean;
  authorized?: boolean;

  async request(): Promise<AuthReturnValue<boolean>> {
    const { status, response } = await API.read(
      READ_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE,
    );

    if (status === 401) {
      await PrivateKeyStorage.delete();
      await PublicKeyStorage.delete();
    }

    const challenge = !!response ? response.challenge : undefined;
    const reason = challenge
      ? new ReasonTranslation("biometrics.reason.success.tokenReceived")
      : new ReasonTranslation("biometrics.reason.error.badToken");

    this.auth = {
      value: challenge ? JSON.stringify(challenge) : challenge,
      reason,
    };

    return {
      ...this.auth,
      value: true,
    };
  }

  async sign(): Promise<AuthReturnValue<boolean>> {
    if (!this.auth.value) {
      return {
        value: false,
        reason: new ReasonTranslation("biometrics.reason.error.tokenMissing"),
      };
    }

    const key = await PrivateKeyStorage.get();

    if (!key.value) {
      return {
        value: false,
        reason: new ReasonTranslation("biometrics.reason.error.keyMissing"),
      };
    }

    this.auth = {
      value: signTokenED25519(this.auth.value, key.value),
      reason: new ReasonTranslation("biometrics.reason.success.tokenSigned"),
      type: key.type,
    };

    this.signed = true;

    return {
      ...this.auth,
      value: true,
    };
  }

  async send(transactionID: string): Promise<AuthReturnValue<boolean>> {
    if (!this.signed || !this.auth.value) {
      return {
        value: false,
        reason: new ReasonTranslation(
          "biometrics.reason.error.signatureMissing",
        ),
      };
    }

    const { status } = await API.write(WRITE_COMMANDS.AUTHORIZE_TRANSACTION, {
      transactionID,
      signedChallenge: this.auth.value,
    });

    const authorized = status === 200;

    if (!authorized) {
      return {
        value: false,
        reason: new ReasonTranslation(
          "biometrics.reason.error.challengeRejected",
        ),
      };
    }

    this.authorized = true;

    return {
      value: true,
      reason: new ReasonTranslation(
        "biometrics.reason.success.verificationSuccess",
      ),
      type: this.auth.type,
    };
  }
}

export default Challenge;
