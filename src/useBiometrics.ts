import { generateKeys, signToken as signTokenED25519 } from "@/src/ed25519";
import { PrivateKeyStorage, PublicKeyStorage } from "@/src/keyStorage";
import { useCallback, useEffect, useState } from "react";
import type {
  AuthReturnValue,
  AuthType,
  Biometrics,
  Feedback,
} from "@/src/types";
import { Logger, randomTransactionID } from "@/src/helpers";
import API from "@/src/api";
import CONST from "@/src/const";

const getAuthType = (authCode: number): AuthType | undefined =>
  Object.values(CONST.AUTH_TYPE).find((authType) => authType.CODE === authCode);

const signChallenge = async (
  token: string | undefined,
): Promise<AuthReturnValue<string | undefined>> => {
  const key = await PrivateKeyStorage.get();

  if (!key.value || !token) {
    let reason;

    if (!key && !token) {
      reason = CONST.REASON_CODES.ERROR.KEY_AND_TOKEN_MISSING;
    } else if (!token) {
      reason = CONST.REASON_CODES.ERROR.TOKEN_MISSING;
    } else {
      reason = CONST.REASON_CODES.ERROR.KEY_MISSING;
    }

    Logger.m(reason);

    return {
      value: undefined,
      reason,
    };
  }

  const signedToken = signTokenED25519(token, key.value);

  Logger.mw(CONST.REASON_CODES.SUCCESS.TOKEN_SIGNED, {
    token: signedToken,
  });

  return {
    value: signedToken,
    reason: CONST.REASON_CODES.SUCCESS.TOKEN_SIGNED,
    authType: key.authType,
  };
};

const requestChallenge = async (): Promise<
  AuthReturnValue<string | undefined>
> => {
  const apiToken = await API.read("RequestBiometricChallenge");
  let token;

  try {
    token = await apiToken.json();
  } catch (e) {
    Logger.e(e);
  }

  if (!!token && "challenge" in token && typeof token.challenge === "string") {
    Logger.mw(CONST.REASON_CODES.SUCCESS.TOKEN_RECEIVED, {
      token: token.challenge,
    });

    return {
      value: token.challenge,
      reason: CONST.REASON_CODES.SUCCESS.TOKEN_RECEIVED,
    };
  }

  Logger.w(CONST.REASON_CODES.ERROR.BAD_TOKEN);

  return {
    value: undefined,
    reason: CONST.REASON_CODES.ERROR.BAD_TOKEN,
  };
};

const sendSignedChallenge = async (
  signedToken: AuthReturnValue<string | undefined>,
): Promise<AuthReturnValue<boolean>> => {
  if (!signedToken) {
    Logger.w(CONST.REASON_CODES.ERROR.SIGNATURE_MISSING);

    return {
      value: false,
      reason: CONST.REASON_CODES.ERROR.SIGNATURE_MISSING,
    };
  }

  Logger.m("Sending signed challenge to the API...");

  const val = await API.write("AuthorizeTransaction", {
    transactionID: randomTransactionID(),
    signedChallenge: signedToken.value,
  });

  const bool = (await val.text()) === "true";
  const reason = bool
    ? CONST.REASON_CODES.SUCCESS.VERIFICATION_SUCCESS
    : CONST.REASON_CODES.ERROR.CHALLENGE_REJECTED;

  Logger[bool ? "m" : "w"](reason);

  return {
    value: bool,
    reason,
    authType: signedToken.authType,
  };
};

const runChallenge = async (): Promise<AuthReturnValue<boolean>> => {
  const token = await requestChallenge();

  if (!token.value) {
    return {
      value: false,
      reason: token.reason,
    };
  }

  const signedToken = await signChallenge(token.value);

  console.log("PODPISANY", signedToken);
  if (!signedToken.value) {
    return {
      value: false,
      reason: signedToken.reason,
    };
  }

  return await sendSignedChallenge(signedToken);
};

const requestKey = async (
  validateCode?: number,
): Promise<AuthReturnValue<boolean>> => {
  const { privateKey, publicKey } = generateKeys();

  const setResult = await PrivateKeyStorage.set(privateKey);

  if (!setResult.value) {
    Logger.w(setResult.reason);

    return {
      value: false,
      reason: setResult.reason,
    };
  }

  const publicKeyResult = await PublicKeyStorage.set(publicKey);

  if (!publicKeyResult.value) {
    return {
      value: false,
      reason: publicKeyResult.reason,
    };
  }

  const result = await API.write("RegisterBiometrics", {
    publicKey,
    validateCode,
  });

  const message = await result.text();

  if (result.status !== 200) {
    Logger.w(message || "API error");

    await revokeKey();

    return {
      value: false,
      reason: message || "API error",
    };
  }

  Logger.mw(CONST.REASON_CODES.SUCCESS.KEY_PAIR_GENERATED, {
    publicKey,
    privateKey,
  });

  return {
    value: true,
    reason: CONST.REASON_CODES.SUCCESS.KEY_PAIR_GENERATED,
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

  Logger.w(CONST.REASON_CODES.SUCCESS.KEY_DELETED);

  return {
    value: true,
    reason: CONST.REASON_CODES.SUCCESS.KEY_DELETED,
  };
};

const checkBiometricsStatus = async () => {
  const publicKey = await PublicKeyStorage.get();
  return !!publicKey.value;
};

const wrapAuthReturnWithAuthTypeMessage = <T>(
  returnValue: AuthReturnValue<T>,
) => {
  if (returnValue.authType === undefined) return returnValue;

  return {
    ...returnValue,
    authTypeMessage: getAuthType(returnValue.authType)?.NAME,
  };
};

const emptyAuthReason = {
  reason: "Not requested yet",
  value: false,
};

function useBiometrics(): Biometrics {
  const [status, setStatus] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<Feedback>({
    challenge: { ...emptyAuthReason },
    key: { ...emptyAuthReason },
    lastAction: undefined,
  });
  const [generator, setGenerator] = useState<
    | AsyncGenerator<
        AuthReturnValue<boolean>,
        AuthReturnValue<boolean>,
        number | undefined
      >
    | undefined
  >();

  const refreshStatus = useCallback(
    async () => setStatus(await checkBiometricsStatus()),
    [],
  );

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const requestGenerator = useCallback(
    async function* () {
      let result = await requestKey();

      if (
        !result.value &&
        result.reason === CONST.REASON_CODES.ERROR.VALIDATE_CODE_REQUIRED
      ) {
        await API.read("ResendValidateCode", {
          email: CONST.USER_EMAIL,
        });
        result = await requestKey(yield result);
      }
      const wrappedResult = wrapAuthReturnWithAuthTypeMessage(result);
      setFeedback((_feedback) => ({
        ..._feedback,
        key: wrappedResult,
        lastAction: CONST.FEEDBACK_TYPE.KEY,
      }));
      await refreshStatus();
      return wrappedResult;
    },
    [refreshStatus],
  );

  const request = useCallback(async () => {
    const gen = requestGenerator();
    const { value: authValue } = await gen.next();
    if (authValue.reason === CONST.REASON_CODES.ERROR.VALIDATE_CODE_REQUIRED) {
      setGenerator(gen);
    } else {
      setGenerator(undefined);
    }
    return authValue;
  }, [requestGenerator]);

  const requestContinue = useCallback(
    async (code?: number) => {
      if (!generator) {
        return await request();
      }
      const { value: authValue } = await generator.next(code);
      setGenerator(undefined);
      return authValue;
    },
    [generator, request],
  );

  const revoke = useCallback(async () => {
    const result = await revokeKey();
    const wrappedResult = wrapAuthReturnWithAuthTypeMessage(result);
    setFeedback((_feedback) => ({
      ..._feedback,
      key: wrappedResult,
      lastAction: CONST.FEEDBACK_TYPE.KEY,
    }));
    await refreshStatus();
    return wrappedResult;
  }, [refreshStatus]);

  const challenge = useCallback(async () => {
    const result = await runChallenge();
    const wrappedResult = wrapAuthReturnWithAuthTypeMessage(result);
    setFeedback((_feedback) => ({
      ..._feedback,
      challenge: wrappedResult,
      lastAction: CONST.FEEDBACK_TYPE.CHALLENGE,
    }));
    return wrappedResult;
  }, []);

  return {
    request: !!generator ? requestContinue : request,
    validateCodeRequired: !!generator,
    challenge,
    revoke,
    feedback,
    status,
  };
}

export default useBiometrics;
export type { Biometrics };
