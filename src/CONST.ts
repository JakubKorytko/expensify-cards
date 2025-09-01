import { AUTH_TYPE } from "expo-secure-store";

const CONST = {
  BIOMETRICS: {
    KEYCHAIN_SERVICE: "Expensify",
    KEY_ALIASES: {
      PUBLIC_KEY: "3DS_SCA_KEY_PUBLIC",
      PRIVATE_KEY: "3DS_SCA_KEY_PRIVATE",
    },
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
    FEEDBACK_TYPE: {
      NONE: "None",
      CHALLENGE: "Challenge",
      KEY: "Key",
    },
    MESSAGE_SOURCE: {
      API: "API",
      SECURE_STORE: "SecureStore",
    },
    EXPO_ERRORS: {
      SEPARATOR: "Caused by:",
      SEARCH_STRING: {
        NOT_IN_FOREGROUND: "not in the foreground",
        IN_PROGRESS: "in progress",
        CANCELED: "canceled",
      },
    },
  },
} as const;

export default CONST;
