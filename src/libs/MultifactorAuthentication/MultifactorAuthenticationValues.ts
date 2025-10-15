import MultifactorAuthenticationStore from "./MultifactorAuthenticationStore";

/**
 * Defines the origin of the authentication factor, either from multifactorial authentication or fallback authentication.
 */
const MULTI_FACTOR_AUTHENTICATION_FACTOR_ORIGIN = {
  MULTI_FACTOR_AUTHENTICATION: "MultifactorAuthentication",
  FALLBACK: "Fallback",
} as const;

/** All possible authentication factors that can be used in the multifactorial authentication process */
const MULTI_FACTOR_AUTHENTICATION_FACTORS = {
  SIGNED_CHALLENGE: "SIGNED_CHALLENGE",
  VALIDATE_CODE: "VALIDATE_CODE",
  OTP: "OTP",
} as const;

const MULTI_FACTOR_AUTHENTICATION_VALUES = {
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
      CODE: MultifactorAuthenticationStore.authTypes.UNKNOWN,
      NAME: "Unknown",
    },
    NONE: {
      CODE: MultifactorAuthenticationStore.authTypes.NONE,
      NAME: "None",
    },
    CREDENTIALS: {
      CODE: MultifactorAuthenticationStore.authTypes.CREDENTIALS,
      NAME: "Credentials",
    },
    BIOMETRICS: {
      CODE: MultifactorAuthenticationStore.authTypes.BIOMETRICS,
      NAME: "Biometrics",
    },
    FACE_ID: {
      CODE: MultifactorAuthenticationStore.authTypes.FACE_ID,
      NAME: "FaceID",
    },
    TOUCH_ID: {
      CODE: MultifactorAuthenticationStore.authTypes.TOUCH_ID,
      NAME: "TouchID",
    },
    OPTIC_ID: {
      CODE: MultifactorAuthenticationStore.authTypes.OPTIC_ID,
      NAME: "OpticID",
    },
  },
  /** What does scenario's status refer to? Which part of multifactorial authentication is impacted by it? */
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
   * Defines the requirements for each authentication factor used in the multifactorial authentication process.
   * Each factor has:
   * - An identifier used internally
   * - A user-friendly display name
   * - The parameter name expected by the API
   * - The data type (string or number)
   * - Length requirements if applicable
   * - Whether it originates from multifactorial authentication or fallback authentication
   */
  FACTORS_REQUIREMENTS: {
    SIGNED_CHALLENGE: {
      id: MULTI_FACTOR_AUTHENTICATION_FACTORS.SIGNED_CHALLENGE,
      name: "Signed Challenge",
      parameter: "signedChallenge",
      type: String(),
      length: undefined,
      origin:
        MULTI_FACTOR_AUTHENTICATION_FACTOR_ORIGIN.MULTI_FACTOR_AUTHENTICATION,
    },
    OTP: {
      id: MULTI_FACTOR_AUTHENTICATION_FACTORS.OTP,
      name: "Two-Factor Authentication or SMS One-Time Password",
      parameter: "otp",
      type: Number(),
      length: 6,
      origin: MULTI_FACTOR_AUTHENTICATION_FACTOR_ORIGIN.FALLBACK,
    },
    VALIDATE_CODE: {
      id: MULTI_FACTOR_AUTHENTICATION_FACTORS.VALIDATE_CODE,
      name: "Email One-Time Password",
      parameter: "validateCode",
      type: Number(),
      length: 6,
      origin: MULTI_FACTOR_AUTHENTICATION_FACTOR_ORIGIN.FALLBACK,
    },
  },
  FACTOR_COMBINATIONS: {
    ONE_FACTOR: [MULTI_FACTOR_AUTHENTICATION_FACTORS.VALIDATE_CODE],
    TWO_FACTOR: [
      MULTI_FACTOR_AUTHENTICATION_FACTORS.VALIDATE_CODE,
      MULTI_FACTOR_AUTHENTICATION_FACTORS.OTP,
    ],
    MULTI_FACTOR_AUTHENTICATION: [
      MULTI_FACTOR_AUTHENTICATION_FACTORS.SIGNED_CHALLENGE,
    ],
  },
  FACTORS_ORIGIN: MULTI_FACTOR_AUTHENTICATION_FACTOR_ORIGIN,
  /** Defines the different scenarios that can be performed in the multifactorial authentication process */
  SCENARIO: {
    SETUP_BIOMETRICS: "SETUP_BIOMETRICS",
    AUTHORIZE_TRANSACTION: "AUTHORIZE_TRANSACTION",
  },
  FACTORS: MULTI_FACTOR_AUTHENTICATION_FACTORS,
} as const;

export default MULTI_FACTOR_AUTHENTICATION_VALUES;
