import { AUTH_TYPE } from "expo-secure-store";

const CONST = {
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
      /**
       * This is purely for backwards compatibility.
       * Although it is not listed as a return value of the getAuthenticationType() method,
       * it is still present in the Android code.
       * @see https://developer.android.com/reference/android/hardware/biometrics/BiometricPrompt.AuthenticationResult#getAuthenticationType()
       * @see https://developer.android.com/reference/androidx/biometric/BiometricPrompt#AUTHENTICATION_RESULT_TYPE_UNKNOWN()
       * @platform android
       */
      UNKNOWN: {
        CODE: AUTH_TYPE.UNKNOWN,
        NAME: "Unknown",
      },
      /**
       * Returned when the authentication fails
       * @platform android
       * @platform ios
       */
      NONE: {
        CODE: AUTH_TYPE.NONE,
        NAME: "None",
      },
      /**
       * Generic type, not specified whether it was a passcode or pattern.
       * @platform android
       * @platform ios
       */
      CREDENTIALS: {
        CODE: AUTH_TYPE.CREDENTIALS,
        NAME: "Credentials",
      },
      /**
       * Generic type, not specified whether it was a face scan or a fingerprint
       * @platform android
       */
      BIOMETRICS: {
        CODE: AUTH_TYPE.BIOMETRICS,
        NAME: "Biometrics",
      },
      /**
       * FaceID was used to authenticate
       * @platform ios
       */
      FACE_ID: {
        CODE: AUTH_TYPE.FACE_ID,
        NAME: "FaceID",
      },
      /**
       * TouchID was used to authenticate
       * @platform ios
       */
      TOUCH_ID: {
        CODE: AUTH_TYPE.TOUCH_ID,
        NAME: "TouchID",
      },
      /**
       * OpticID was used to authenticate (reserved by apple, used on Apple Vision Pro, not iOS)
       */
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
} as const;

export default CONST;
