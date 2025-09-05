import { AUTH_TYPE } from "expo-secure-store";

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
      },
    },
  },
  // ...
} as const;

export default CONST;
