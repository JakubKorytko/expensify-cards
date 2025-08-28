import { Logger } from "@/src/helpers";
import { ChallengeObject, ReadCommands, WriteCommands } from "@/src/api";
import {
  ed,
  generateSixDigitNumber,
  isChallengeValid,
  STORAGE,
  USER_EMAIL,
} from "@/API_mock/utils";

const router: {
  post: Record<string, Function>;
  get: Record<string, Function>;
} = {
  post: {},
  get: {},
};

const MISSING_PARAMETER = {
  status: 422,
  response: undefined,
};

const REQUEST_SUCCESSFUL = {
  status: 200,
  response: undefined,
};

const UNAUTHORIZED = {
  status: 401,
  response: undefined,
};

const BAD_REQUEST = {
  status: 400,
  response: undefined,
};

const CONFLICT = {
  status: 409,
  response: undefined,
};

router.post["/resend_validate_code"] = ({
  email,
}: Partial<
  WriteCommands["ResendValidateCode"]["parameters"]
>): WriteCommands["ResendValidateCode"]["returns"] => {
  Logger.m("Generating new validation code");

  if (!email) {
    return {
      ...MISSING_PARAMETER,
      message: Logger.w("Email parameter is missing in the request"),
    };
  }

  const randomCode = generateSixDigitNumber();

  STORAGE.validateCodes[email] ??= [];
  STORAGE.validateCodes[email].push(randomCode);
  Logger.m("Generated new validation code:", randomCode, "for email", email);

  return {
    ...REQUEST_SUCCESSFUL,
    message: `Validate code sent to email ${email}`,
  };
};

router.get["/request_biometric_challenge"] = async (): Promise<
  ReadCommands["RequestBiometricChallenge"]["returns"]
> => {
  Logger.m("Requested biometric challenge");

  if (!STORAGE.publicKeys[USER_EMAIL]) {
    return {
      ...UNAUTHORIZED,
      message: Logger.w("Registration required"),
    };
  }

  const nonce = ed.etc.bytesToHex(ed.etc.randomBytes(16));
  const expirationDate = Date.now() + 10 * 1000 * 60; // 10 minutes

  const challenge = {
    nonce,
    expires: expirationDate,
  };

  const challengeString = JSON.stringify(challenge);
  STORAGE.challenges[challengeString] = challenge;

  setTimeout(
    () => {
      Logger.m(`Challenge ${challengeString} expired, removed from storage`);
      delete STORAGE.challenges[challengeString];
    },
    10 * 1000 * 60,
  );

  Logger.m("Challenge", challengeString, "sent to the client");

  return {
    response: { challenge },
    status: 200,
    message: "Challenge generated successfully",
  };
};

router.post["/register_biometrics"] = ({
  publicKey,
  validateCode,
}: Partial<
  WriteCommands["RegisterBiometrics"]["parameters"]
>): WriteCommands["RegisterBiometrics"]["returns"] => {
  const validateCodes = STORAGE.validateCodes[USER_EMAIL] ?? [];

  Logger.m(
    "Received request with publicKey",
    publicKey,
    validateCode ? `and validate code ${validateCode}` : "and no validate code",
  );

  if (!publicKey) {
    return {
      ...MISSING_PARAMETER,
      message: Logger.w("No public key provided"),
    };
  }

  if (!!STORAGE.publicKeys[USER_EMAIL]?.includes(publicKey)) {
    return {
      ...CONFLICT,
      message: Logger.w("Public key is already registered"),
    };
  }

  if (!validateCode && STORAGE.publicKeys[USER_EMAIL]?.length > 0) {
    return {
      ...MISSING_PARAMETER,
      message: Logger.w("Validation code required"),
    };
  }

  if (validateCode && STORAGE.publicKeys[USER_EMAIL]?.length > 0) {
    const isValidateCodeCorrect =
      !!validateCodes.at(-1) && validateCodes.at(-1) === validateCode;

    if (!isValidateCodeCorrect) {
      return {
        ...CONFLICT,
        message: Logger.w("Validation code invalid"),
      };
    }

    validateCodes.pop();
  }

  STORAGE.publicKeys[USER_EMAIL] ??= [];
  STORAGE.publicKeys[USER_EMAIL].push(publicKey);

  Logger.m("Registered biometrics for public key", publicKey);

  return {
    ...REQUEST_SUCCESSFUL,
    message: "Biometrics registered successfully",
  };
};

router.post["/authorize_transaction"] = ({
  transactionID,
  validateCode,
  signedChallenge,
}: Partial<
  WriteCommands["AuthorizeTransaction"]["parameters"]
>): WriteCommands["AuthorizeTransaction"]["returns"] => {
  const validateCodes = STORAGE.validateCodes[USER_EMAIL] ?? [];

  if (!transactionID) {
    return {
      ...MISSING_PARAMETER,
      message: Logger.w("No transaction ID provided"),
    };
  }

  const userPublicKeys = STORAGE.publicKeys[USER_EMAIL];

  if (!userPublicKeys || !userPublicKeys.length) {
    return {
      ...UNAUTHORIZED,
      message: Logger.w("User is not registered"),
    };
  }

  if (signedChallenge) {
    Logger.m(
      "Authorizing transaction",
      transactionID,
      "with signed challenge",
      signedChallenge,
    );

    const authorized = userPublicKeys.some((publicKey) =>
      isChallengeValid(signedChallenge, publicKey),
    );

    return authorized
      ? {
          ...REQUEST_SUCCESSFUL,
          message: Logger.m("User authorized successfully using challenge"),
        }
      : {
          ...CONFLICT,
          message: Logger.w("Unable to authorize user using challenge"),
        };
  }

  if (validateCode && !!validateCodes.at(-1)) {
    Logger.m(
      "Authorizing transaction",
      transactionID,
      "with validate code",
      validateCode,
    );

    const isValidateCodeCorrect = validateCodes.at(-1) === validateCode;
    if (isValidateCodeCorrect) {
      validateCodes.pop();
    }

    return isValidateCodeCorrect
      ? {
          ...REQUEST_SUCCESSFUL,
          message: Logger.m("User authorized successfully using validate code"),
        }
      : {
          ...CONFLICT,
          message: Logger.w("Unable to authorize user using validate code"),
        };
  }

  return {
    ...BAD_REQUEST,
    message: Logger.w("Bad request"),
  };
};

const fetch = async (
  path: string,
  options: {
    method: "GET" | "POST";
    body?: Record<string, unknown>;
  },
) => {
  const methodLowerCase = options.method === "GET" ? "get" : "post";
  return await router[methodLowerCase][path](options.body);
};

export default fetch;
