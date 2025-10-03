const translations = {
  // ...
  biometrics: {
    statusMessage: {
      successMessage: (authorization?: boolean, using?: string) =>
        `You’ve successfully ${authorization ? "authorized challenge" : "authenticated"}${using ? ` using ${using}` : ""}`,
      failedMessage: (authorization?: boolean, because?: string) =>
        `Your ${authorization ? "authorization" : "authentication"} attempt ${because ? `failed with error: ${because}` : "was unsuccessful."}`,
      successTitle: (authorization?: boolean) =>
        `${authorization ? "Authorization" : "Authentication"} successful`,
      failedTitle: (authorization?: boolean) =>
        `${authorization ? "Authorization" : "Authentication"} failed`,
    },
    title: (registered: boolean = true) =>
      `Biometrics (${registered ? "Registered" : "Not registered"})`,
    reason: {
      success: {
        keySavedInSecureStore: "Successfully saved key in the SecureStore",
        keyRetrievedFromSecureStore:
          "Successfully retrieved key from the SecureStore",
        keyNotInSecureStore: "SecureStore entry for the key is empty",
        keyPairGenerated: "Key pair generated successfully",
        tokenReceived: "Successfully received token",
        tokenSigned: "Successfully signed token",
        verificationSuccess: "Verification was successful",
        keyDeletedFromSecureStore:
          "Successfully deleted key from the SecureStore",
      },
      error: {
        unableToSaveKey: "Unable to save the key in the SecureStore",
        unableToRetrieve: "Unable to retrieve the key from the SecureStore",
        unableToDelete: "Unable to delete the key from the SecureStore",
        badToken: "Requested token is missing or invalid",
        tokenMissing: "Token is missing",
        keyMissing: "Key is missing",
        signatureMissing: "Signature is missing",
        challengeRejected: "API rejected the challenge",
        validateCodeMissing: "Validation code is missing",
        otpMissing: "OTP code is missing",
        keyMissingOnTheBE:
          "Key is stored locally but is missing on the backend",
        biometricsNotSupported: "Biometrics are not supported on this device",
      },
      expoErrors: {
        notInForeground: "App is not in the foreground",
        alreadyInProgress: "Authentication is already in progress",
        canceled: "Authentication was canceled",
        generic: "Something went wrong",
        keyExists: "Key already exists",
        noAuthentication: "No authentication method available",
        oldAndroid: "This functionality is not available on your device",
      },
      generic: {
        notRequested: "Not requested yet",
        apiError: "API error",
        authFactorsError: "Auth factors error",
        authFactorsSufficient: "Auth factors are sufficient",
      },
    },
    apiResponse: {
      registrationRequired: "Registration required",
      challengeGenerated: "Challenge generated successfully",
      noPublicKey: "No public key provided",
      keyAlreadyRegistered: "Public key is already registered",
      validationCodeRequired: "Validation code is required",
      validationCodeInvalid: "Validation code is invalid",
      otpCodeInvalid: "OTP code is invalid",
      otpCodeRequired: "OTP code is required",
      biometricsSuccess: "Biometrics registered successfully",
      noTransactionID: "No transaction ID provided",
      userNotRegistered: "User is not registered",
      unableToAuthorize: "Unable to authorize user using provided parameters",
      userAuthorized: "User authorized successfully",
      badRequest: "Bad request",
      unknownResponse: "Unknown response type",
    },
    provideValidateCode: "You need to provide the validate code to proceed",
    provideOTPCode: "You need to provide the OTP code to proceed",
  },
  // ...
};

export default translations;
