import API, { SIDE_EFFECT_REQUEST_COMMANDS } from "@/base/api";
import { ValueOf, TranslationPaths } from "@/base/mockTypes";

/** HTTP codes returned by the API, mapped to the biometrics translation paths */
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

/** Type guard to check whether object keys include provided value */
const isKeyOf = <Y extends object>(
  key: keyof Y | string | number,
  object: Y,
): key is keyof Y => {
  return key in object;
};

/** Helper method to create an object with an HTTP code and the reason translation path */
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

/**
 * To keep the code clean and readable, these functions return parsed data in order to:
 *
 * - Check whether biometrics action was successful as we need to know it as fast as possible
 *   to make the usage of authentication seamless and to tell if we should abort the process
 *   if an error occurred.
 *
 * - To avoid storing challenge in the persistent memory for security reasons.
 *
 * - As there is a certain short time frame in which the challenge needs to be signed,
 *   we should not delay the possibility to do so for the user.
 *
 * This is not a standard practice in the code base.
 * Please consult before using this pattern.
 */

/** Send biometrics public key to the API. */
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

/** Ask API for the biometrics challenge. */
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

/** Authorize transaction using signed challenge. */
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
