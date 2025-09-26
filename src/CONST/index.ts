import { AUTH_TYPE } from "expo-secure-store";

/**
 * Defines the requirements for each authentication factor used in the biometrics process.
 * These requirements include an identifier, a user-friendly name, the parameter name expected by the API,
 */
const BIOMETRICS_AUTH_FACTORS_REQUIREMENTS = {
  SIGNED_CHALLENGE: {
    id: "SIGNED_CHALLENGE",
    name: "Signed Challenge",
    parameter: "signedChallenge",
    type: String(),
    length: undefined,
  },
  OTP: {
    id: "OTP",
    name: "Two-Factor Authentication or SMS One-Time Password",
    parameter: "otp",
    type: Number(),
    length: 6,
    optional: true,
  },
  VALIDATE_CODE: {
    id: "VALIDATE_CODE",
    name: "Email One-Time Password",
    parameter: "validateCode",
    type: Number(),
    length: 6,
  },
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
    /** What does action's feedback refer to? Which part of biometrics is impacted by it? */
    FEEDBACK_TYPE: {
      NONE: "None",
      CHALLENGE: "Challenge",
      KEY: "Key",
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
    /** All possible requirements for biometric authentication */
    AUTH_FACTORS_REQUIREMENTS: BIOMETRICS_AUTH_FACTORS_REQUIREMENTS,
    /** Status of the device regarding biometric capabilities and configuration */
    DEVICE_BIOMETRICS_STATUS: {
      NOT_SUPPORTED: "NOT_SUPPORTED",
      NOT_CONFIGURED: "NOT_CONFIGURED",
      CONFIGURED: "CONFIGURED",
    },
    /** All possible authentication factors that can be used in the biometrics process */
    AUTH_FACTORS: {
      SIGNED_CHALLENGE: "SIGNED_CHALLENGE",
      VALIDATE_CODE: "VALIDATE_CODE",
      OTP: "OTP",
    },
    /** Mapping of device biometric status to the required authentication factors */
    DEVICE_STATUS_FACTORS_MAP: {
      NOT_SUPPORTED: [
        BIOMETRICS_AUTH_FACTORS_REQUIREMENTS.VALIDATE_CODE,
        BIOMETRICS_AUTH_FACTORS_REQUIREMENTS.OTP,
      ],
      NOT_CONFIGURED: [
        BIOMETRICS_AUTH_FACTORS_REQUIREMENTS.SIGNED_CHALLENGE,
        BIOMETRICS_AUTH_FACTORS_REQUIREMENTS.VALIDATE_CODE,
      ],
      CONFIGURED: [BIOMETRICS_AUTH_FACTORS_REQUIREMENTS.SIGNED_CHALLENGE],
    },
  },
  // ...
} as const;

export default CONST;
