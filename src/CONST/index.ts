import { AUTH_TYPE } from "expo-secure-store";

/**
 * Defines the origin of the authentication factor, either from biometrics or fallback authentication.
 */
const BIOMETRICS_FACTOR_ORIGIN = {
  BIOMETRICS: "Biometrics",
  FALLBACK: "Fallback",
} as const;

const CONST = {
  // ...
  BIOMETRICS: {
    /** Name of the service associated with the keys in SecureStore */
    KEYCHAIN_SERVICE: "Expensify",
    /** Names that the keys are stored under in the SecureStore.  */
    KEY_ALIASES: {
      PUBLIC_KEY: "3DS_SCA_KEY_PUBLIC",
      PRIVATE_KEY: "3DS_SCA_KEY_PRIVATE",
    },
    NEED_SECOND_FACTOR_HTTP_CODE: 202,
    /** Type of used authentication method returned by the SecureStore mapped to names */
    AUTH_TYPE: {
      UNKNOWN: {
        CODE: AUTH_TYPE.UNKNOWN,
        NAME: "Unknown",
      },
      NONE: {
        CODE: AUTH_TYPE.NONE,
        NAME: "None",
      },
      CREDENTIALS: {
        CODE: AUTH_TYPE.CREDENTIALS,
        NAME: "Credentials",
      },
      BIOMETRICS: {
        CODE: AUTH_TYPE.BIOMETRICS,
        NAME: "Biometrics",
      },
      FACE_ID: {
        CODE: AUTH_TYPE.FACE_ID,
        NAME: "FaceID",
      },
      TOUCH_ID: {
        CODE: AUTH_TYPE.TOUCH_ID,
        NAME: "TouchID",
      },
      OPTIC_ID: {
        CODE: AUTH_TYPE.OPTIC_ID,
        NAME: "OpticID",
      },
    },
    /** What does scenario's status refer to? Which part of biometrics is impacted by it? */
    SCENARIO_TYPE: {
      NONE: "None",
      AUTHORIZATION: "Authorization",
      AUTHENTICATION: "Authentication",
    },
    /**
     * Used to obtain the reason for the error from its message,
     * enabling it to be mapped into our text for translation.
     */
    EXPO_ERRORS: {
      SEPARATOR: "Caused by:",
      SEARCH_STRING: {
        NOT_IN_FOREGROUND: "not in the foreground",
        IN_PROGRESS: "in progress",
        CANCELED: "canceled",
        EXISTS: "already exists",
        NO_AUTHENTICATION: "No authentication method available",
        OLD_ANDROID: "NoSuchMethodError",
      },
    },
    /**
     * Defines the requirements for each authentication factor used in the biometrics process.
     * Each factor has:
     * - An identifier used internally
     * - A user-friendly display name
     * - The parameter name expected by the API
     * - The data type (string or number)
     * - Length requirements if applicable
     * - Whether it originates from biometrics or fallback authentication
     */
    FACTORS_REQUIREMENTS: {
      SIGNED_CHALLENGE: {
        id: "SIGNED_CHALLENGE",
        name: "Signed Challenge",
        parameter: "signedChallenge",
        type: String(),
        length: undefined,
        origin: BIOMETRICS_FACTOR_ORIGIN.BIOMETRICS,
      },
      OTP: {
        id: "OTP",
        name: "Two-Factor Authentication or SMS One-Time Password",
        parameter: "otp",
        type: Number(),
        length: 6,
        origin: BIOMETRICS_FACTOR_ORIGIN.FALLBACK,
      },
      VALIDATE_CODE: {
        id: "VALIDATE_CODE",
        name: "Email One-Time Password",
        parameter: "validateCode",
        type: Number(),
        length: 6,
        origin: BIOMETRICS_FACTOR_ORIGIN.FALLBACK,
      },
    },
    FACTORS_ORIGIN: BIOMETRICS_FACTOR_ORIGIN,
    /** Defines the different scenarios that can be performed in the biometric process */
    SCENARIO: {
      SETUP_BIOMETRICS: "SETUP_BIOMETRICS",
      AUTHORIZE_TRANSACTION_FALLBACK: "AUTHORIZE_TRANSACTION_FALLBACK",
      AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE:
        "AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE",
      AUTHORIZE_TRANSACTION: "AUTHORIZE_TRANSACTION",
      TEST_OTP_FIRST: "TEST_OTP_FIRST",
    },
    /** All possible authentication factors that can be used in the biometrics process */
    FACTORS: {
      SIGNED_CHALLENGE: "SIGNED_CHALLENGE",
      VALIDATE_CODE: "VALIDATE_CODE",
      OTP: "OTP",
    },
  },
  // ...
} as const;

export default CONST;
