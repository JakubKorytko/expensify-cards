const CONST = {
  KEYCHAIN_SERVICE: "Expensify",
  KEY_ALIASES: {
    PUBLIC_KEY: "3DS_SCA_KEY_PUBLIC",
    PRIVATE_KEY: "3DS_SCA_KEY_PRIVATE",
  },
  AUTH_TYPE: {
    NONE: {
      CODE: -1,
      NAME: "None",
    },
    IOS: {
      CODE: 0,
      NAME: "iOS",
    },
    CREDENTIALS: {
      CODE: 1,
      NAME: "Credentials",
    },
    BIOMETRICS: {
      CODE: 2,
      NAME: "Biometrics",
    },
  } as const,
  REASON_CODES: {
    SUCCESS: {
      TOKEN_SIGNED: "Successfully signed token",
      KEY_SAVED: "Successfully saved key in the SecureStore",
      KEY_RETRIEVED: "Successfully retrieved key from the SecureStore",
      KEY_NOT_IN_SECURE_STORE: "SecureStore entry for the key is empty",
      TOKEN_RECEIVED: "Successfully received token",
      VERIFICATION_SUCCESS: "Verification was successful",
      KEY_PAIR_GENERATED: "Key pair generated successfully",
      KEY_DELETED: "Key deleted successfully",
    },
    ERROR: {
      TOKEN_MISSING: "Token is missing",
      KEY_MISSING: "Key is missing",
      KEY_AND_TOKEN_MISSING: "Key and token is missing",
      KEY_EXISTS: "Key already exists in the SecureStore",
      KEY_EXISTS_IN_BE: "Key is already stored on the backend",
      BAD_TOKEN: "Requested token is missing or invalid",
      CHALLENGE_REJECTED: "API rejected the challenge",
      UNABLE_TO_SAVE_KEY: "Unable to save the key in the SecureStore",
      UNABLE_TO_DELETE_KEY: "Unable to delete key from the SecureStore",
      UNABLE_TO_RETRIEVE_KEY: "Unable to retrieve key from the SecureStore",
      SIGNATURE_MISSING: "Signature is missing",
      VALIDATE_CODE_REQUIRED: "Validate code required",
    },
  },
  FEEDBACK_TYPE: {
    CHALLENGE: "Challenge",
    KEY: "Key",
  },
  REASON_MESSAGE: {
    SUCCESS: "You’ve successfully authenticated.",
    SUCCESS_USING: "You’ve successfully authenticated using",
    FAILED: "Your authentication attempt was unsuccessful.",
    FAILED_BECAUSE: "Your authentication attempt failed with error",
  },
  MISC: {
    EXPO_ERROR_SEPARATOR: "Caused by:",
  },
  USER_EMAIL: "user@example.com",
};

export default CONST;
