import { generateKeys, signToken as signTokenED25519 } from "@/scripts/ed25519";
import { PrivateKeyStorage, PublicKeyStorage } from "@/scripts/keyStorage";
import {
  authReasonCodes,
  AuthReturnValue,
  authType,
} from "@/scripts/authCodes";
import { useCallback, useEffect, useState } from "react";
import Logger from "@/scripts/Logger";
import API from "@/api";

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randomTransactionID = () => rnd(100_000_000, 999_999_999).toString();

const signToken = async (
  token: string | undefined,
): Promise<AuthReturnValue<string | undefined>> => {
  const key = await PrivateKeyStorage.get();

  if (!key.value || !token) {
    let reason;

    if (!key && !token) {
      reason = authReasonCodes.keyAndTokenMissing;
    } else if (!token) {
      reason = authReasonCodes.tokenMissing;
    } else {
      reason = authReasonCodes.keyMissing;
    }

    Logger.m(reason);

    return {
      value: undefined,
      reason,
      authType: key.authType,
    };
  }

  Logger.m("Signing token", token, "with key", key.value);
  const signedToken = signTokenED25519(token, key.value);

  Logger.m(authReasonCodes.successfulSign, signedToken);

  return {
    value: signedToken,
    reason: authReasonCodes.successfulSign,
  };
};

const requestToken = async (): Promise<AuthReturnValue<string | undefined>> => {
  Logger.m("Requesting token from API...");
  const apiToken = await API.read("RequestBiometricChallenge");
  let token;

  try {
    token = await apiToken.json();
  } catch (e) {
    Logger.e(e);
  }

  if (!!token && "challenge" in token && typeof token.challenge === "string") {
    Logger.m(authReasonCodes.successfullyReceivedToken, token.challenge);
    return {
      value: token.challenge,
      reason: authReasonCodes.successfullyReceivedToken,
    };
  }

  Logger.w(authReasonCodes.badToken);
  return {
    value: undefined,
    reason: authReasonCodes.badToken,
  };
};

const verifySignedToken = async (
  signedToken: string | undefined,
): Promise<AuthReturnValue<boolean>> => {
  if (!signedToken) {
    Logger.w(authReasonCodes.signatureMissing);

    return {
      value: false,
      reason: authReasonCodes.signatureMissing,
    };
  }

  Logger.m("Sending signed token to API...");

  const val = await API.write("AuthorizeTransaction", {
    transactionID: randomTransactionID(),
    signedChallenge: signedToken,
  });

  const bool = (await val.text()) === "true";
  const reason = bool
    ? authReasonCodes.verificationSuccessful
    : authReasonCodes.apiRejectedToken;

  Logger[bool ? "m" : "w"](reason);

  return {
    value: bool,
    reason,
  };
};

const runTokenization = async (): Promise<AuthReturnValue<boolean>> => {
  const token = await requestToken();

  if (!token.value) {
    return {
      value: false,
      reason: token.reason,
    };
  }

  const signedToken = await signToken(token.value);

  if (!signedToken.value) {
    return {
      value: false,
      reason: signedToken.reason,
    };
  }

  const verifiedToken = await verifySignedToken(signedToken.value);
  return wrapAuthReturnWithAuthTypeMessage(verifiedToken);
};

const requestKey = async (): Promise<AuthReturnValue<boolean>> => {
  const { privateKey, publicKey } = generateKeys();

  Logger.m(
    "Generated key pair",
    "\nPrivate key:",
    privateKey,
    "\nPublic key:",
    publicKey,
  );

  const setResult = await PrivateKeyStorage.set(privateKey);

  if (!setResult.value) {
    Logger.w(setResult.reason);

    return {
      value: false,
      reason: setResult.reason,
    };
  }

  const result = await API.write("RegisterBiometrics", {
    publicKey,
  });

  const message = await result.text();

  if (result.status !== 200) {
    return {
      value: false,
      reason: message,
    };
  }

  const publicKeyResult = await PublicKeyStorage.set(publicKey);

  if (!publicKeyResult.value) {
    return {
      value: false,
      reason: publicKeyResult.reason,
    };
  }

  return {
    value: true,
    reason: authReasonCodes.keyPairGeneratedSuccessfully,
    authType: setResult.authType,
  };
};

const revokeKey = async (): Promise<AuthReturnValue<boolean>> => {
  const privateKeyResult = await PrivateKeyStorage.delete();

  if (!privateKeyResult.value) {
    return privateKeyResult;
  }

  const publicKeyResult = await PublicKeyStorage.delete();

  if (!publicKeyResult.value) {
    return publicKeyResult;
  }

  return {
    value: true,
    reason: authReasonCodes.keyDeletedSuccessfully,
  };
};

const checkBiometricsStatus = async () => {
  const publicKey = await PublicKeyStorage.get();
  return !!publicKey.value;
};

type Biometrics = {
  request: () => Promise<AuthReturnValue<boolean>>;
  revoke: () => Promise<AuthReturnValue<boolean>>;
  signToken: () => Promise<AuthReturnValue<boolean>>;
  isConfigured: boolean;
};

const authTypeMessages: Record<number, string> = {
  [authType.NONE]: "None",
  [authType.IOS]: "iOS",
  [authType.CREDENTIALS]: "Credentials",
  [authType.BIOMETRICS]: "Biometrics",
};

const wrapAuthReturnWithAuthTypeMessage = <T>(
  returnValue: AuthReturnValue<T>,
) => {
  if (returnValue.authType === undefined) return returnValue;

  return {
    ...returnValue,
    authTypeMessage: authTypeMessages[returnValue.authType],
  };
};

function useBiometrics(): Biometrics {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    checkBiometricsStatus().then((value) => setIsConfigured(value));
  }, []);

  const request = useCallback(async () => {
    const result = await requestKey();
    const biometricsStatus = await checkBiometricsStatus();
    setIsConfigured(biometricsStatus);
    return wrapAuthReturnWithAuthTypeMessage(result);
  }, []);

  const revoke = useCallback(async () => {
    const result = await revokeKey();
    const biometricsStatus = await checkBiometricsStatus();
    setIsConfigured(biometricsStatus);
    return wrapAuthReturnWithAuthTypeMessage(result);
  }, []);

  return {
    request,
    signToken: runTokenization,
    revoke,
    isConfigured,
  };
}

export default useBiometrics;
export type { Biometrics };
