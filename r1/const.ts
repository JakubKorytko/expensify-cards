const CONST = {
  KEYCHAIN_SERVICE: "Expensify",
  KEY_ALIASES: {
    PUBLIC_KEY: "3DS_SCA_KEY_PUBLIC",
    PRIVATE_KEY: "3DS_SCA_KEY_PRIVATE",
  },
  AUTH_TYPE: {
    UNKNOWN: {
      CODE: -1,
      NAME: "Unknown",
    },
    NONE: {
      CODE: 0,
      NAME: "None",
    },
    CREDENTIALS: {
      CODE: 1,
      NAME: "Credentials",
    },
    BIOMETRICS: {
      CODE: 2,
      NAME: "Biometrics",
    },
    FACE_ID: {
      CODE: 3,
      NAME: "FaceID",
    },
    TOUCH_ID: {
      CODE: 4,
      NAME: "TouchID",
    },
    OPTIC_ID: {
      CODE: 5,
      NAME: "OpticID",
    },
  } as const,
  FEEDBACK_TYPE: {
    NONE: "None",
    CHALLENGE: "Challenge",
    KEY: "Key",
  } as const,
  MISC: {
    EXPO_ERROR_SEPARATOR: "Caused by:",
  },
};

export default CONST;
