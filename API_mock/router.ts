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

router.post["/resend_validate_code"] = ({
  email,
}: Partial<ReadCommands["ResendValidateCode"]["parameters"]>): boolean => {
  Logger.m("Generating new validation code");

  if (!email) {
    return false;
  }

  const randomCode = generateSixDigitNumber();

  STORAGE.validateCodes[email] ??= [];
  STORAGE.validateCodes[email].push(randomCode);

  Logger.m("Generated new validation code:", randomCode, "for email", email);

  return true;
};

router.get["/request_biometric_challenge"] = async (): Promise<
  ChallengeObject | string
> => {
  Logger.m("Requested biometric challenge");

  if (!STORAGE.publicKeys[USER_EMAIL]) {
    return Logger.w("Registration required");
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
    challenge,
  };
};

router.post["/register_biometrics"] = ({
  publicKey,
  validateCode,
}: Partial<WriteCommands["RegisterBiometrics"]["parameters"]>):
  | string
  | true => {
  const validateCodes = STORAGE.validateCodes[USER_EMAIL] ?? [];

  Logger.m(
    "Received request with publicKey",
    publicKey,
    validateCode ? `and validate code ${validateCode}` : "and no validate code",
  );

  if (!publicKey) {
    return Logger.w("No public key provided");
  }

  if (!!STORAGE.publicKeys[USER_EMAIL]?.includes(publicKey)) {
    return Logger.w("Public key is already registered");
  }

  if (!validateCode && STORAGE.publicKeys[USER_EMAIL]?.length > 0) {
    return Logger.w("Validate code required");
  }

  if (validateCode && STORAGE.publicKeys[USER_EMAIL]?.length > 0) {
    const isValidateCodeCorrect =
      !!validateCodes.at(-1) && validateCodes.at(-1) === validateCode;

    if (!isValidateCodeCorrect) {
      return Logger.w("Validate code invalid");
    }

    validateCodes.pop();
  }

  STORAGE.publicKeys[USER_EMAIL] ??= [];
  STORAGE.publicKeys[USER_EMAIL].push(publicKey);

  Logger.m("Registered biometrics for public key", publicKey);

  return true;
};

router.post["/authorize_transaction"] = ({
  transactionID,
  validateCode,
  signedChallenge,
}: Partial<WriteCommands["AuthorizeTransaction"]["parameters"]>):
  | string
  | boolean => {
  const validateCodes = STORAGE.validateCodes[USER_EMAIL] ?? [];

  if (!transactionID) {
    return Logger.w("No transaction ID provided");
  }

  const userPublicKeys = STORAGE.publicKeys[USER_EMAIL];

  if (!userPublicKeys || !userPublicKeys.length) {
    return Logger.w("User is not registered");
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
    Logger[authorized ? "m" : "w"](
      authorized
        ? "User authorized successfully using challenge"
        : "Unable to authorize user using challenge",
    );

    return authorized;
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

    Logger[isValidateCodeCorrect ? "m" : "w"](
      isValidateCodeCorrect
        ? "User authorized successfully using validate code"
        : "Unable to authorize user using validate code",
    );

    return isValidateCodeCorrect;
  }

  return Logger.w("Bad request");
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
