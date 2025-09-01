import API, { SIDE_EFFECT_REQUEST_COMMANDS } from "@/base/api";
import { TranslationPaths, ValueOf } from "@src/types";

const RESPONSE_TRANSLATION_PATH = {
  UNKNOWN: "unknownResponse",
  REQUEST_BIOMETRIC_CHALLENGE: {
    401: "registrationRequired",
    200: "challengeGenerated",
  },
  REGISTER_BIOMETRICS: {
    422: "noPublicKey",
    409: "keyAlreadyRegistered",
    401: "validationCodeRequired",
    400: "validationCodeInvalid",
    200: "biometricsSuccess",
  },
  AUTHORIZE_TRANSACTION: {
    422: "noTransactionID",
    401: "userNotRegistered",
    409: "unableToAuthorize",
    200: "userAuthorized",
    400: "badRequest",
  },
} as const;

const isKeyOf = <Y extends object>(
  key: keyof Y | string | number,
  object: Y,
): key is keyof Y => {
  return key in object;
};

function parseHttpCode(
  jsonCode: string | number | undefined,
  source: Omit<ValueOf<typeof RESPONSE_TRANSLATION_PATH>, "UNKNOWN">,
): {
  httpCode: number;
  reason: TranslationPaths;
} {
  const httpCode = Number(jsonCode) || 0;

  if (isKeyOf(httpCode, source)) {
    return {
      httpCode,
      reason: `biometrics.apiResponse.${source[httpCode]}`,
    };
  }

  return {
    httpCode,
    reason: `biometrics.apiResponse.${RESPONSE_TRANSLATION_PATH.UNKNOWN}`,
  };
}

function registerBiometrics(publicKey: string) {
  return API.makeRequestWithSideEffects(
    SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_BIOMETRICS,
    {
      publicKey,
    },
    {},
  ).then(({ jsonCode }) =>
    parseHttpCode(jsonCode, RESPONSE_TRANSLATION_PATH.REGISTER_BIOMETRICS),
  );
}

function requestBiometricsChallenge() {
  return API.makeRequestWithSideEffects(
    SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE,
    {},
    {},
  ).then(({ jsonCode, challenge }) => ({
    ...parseHttpCode(
      jsonCode,
      RESPONSE_TRANSLATION_PATH.REQUEST_BIOMETRIC_CHALLENGE,
    ),
    challenge,
  }));
}

function authorizeTransaction(transactionID: string, signedChallenge: string) {
  return API.makeRequestWithSideEffects(
    SIDE_EFFECT_REQUEST_COMMANDS.AUTHORIZE_TRANSACTION,
    {
      transactionID,
      signedChallenge,
    },
    {},
  ).then(({ jsonCode }) =>
    parseHttpCode(jsonCode, RESPONSE_TRANSLATION_PATH.AUTHORIZE_TRANSACTION),
  );
}

export { registerBiometrics, requestBiometricsChallenge, authorizeTransaction };
