import { generateKeys, signToken as signTokenED25519 } from "@/scripts/ed25519";
import api from "@/api";
import { PrivateKeyStorage, PublicKeyStorage } from "@/scripts/keyStorage";
import {
  APIResponses,
  authReasonCodes,
  AuthReturnValue,
  authType,
} from "@/scripts/authCodes";
import { useCallback, useEffect, useState } from "react";
import Logger from "@/scripts/Logger";

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

  const signedToken = signTokenED25519(token, key.value);

  Logger.m(authReasonCodes.successfulSign, signedToken);

  return {
    value: signedToken,
    reason: authReasonCodes.successfulSign,
  };
};

const requestToken = async (): Promise<AuthReturnValue<string | undefined>> => {
  Logger.m("Requesting token from API...");
  const apiToken = await api("/token");
  const token = await apiToken.json();

  if (!!token && "hex" in token && typeof token.hex === "string") {
    Logger.m(authReasonCodes.successfullyReceivedToken, token.hex);
    return {
      value: token.hex,
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
  token: string | undefined,
  signedToken: string | undefined,
): Promise<AuthReturnValue<boolean>> => {
  if (!token || !signedToken) {
    let reason;

    if (!token && !signedToken) {
      reason = authReasonCodes.tokenAndSignatureMissing;
    } else if (!token) {
      reason = authReasonCodes.tokenMissing;
    } else {
      reason = authReasonCodes.signatureMissing;
    }

    Logger.w(reason);

    return {
      value: false,
      reason,
    };
  }

  Logger.m("Sending signed token to API...");

  const val = await api("/verify", {
    signature: signedToken,
    token: token,
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

  const verifiedToken = await verifySignedToken(token.value, signedToken.value);
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

  const result = await api("/key", {
    key: publicKey,
  });

  const message = await result.text();

  if (message === APIResponses.keyExists) {
    return {
      value: false,
      reason: authReasonCodes.keyExistsInBE,
    };
  }

  if (message === APIResponses.keyNotPresentInBody) {
    return {
      value: false,
      reason: authReasonCodes.invalidRequestKeyMissingInBody,
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

  await api.revokeKey();

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
