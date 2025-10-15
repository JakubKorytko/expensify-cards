/**
 * Translation strings for the application.
 * Contains translations for multifactorial authentication-related messages, including success/failure states,
 * error messages, and API responses.
 */
const translations = {
  // ...
  multifactorAuthentication: {
    /** Messages and titles displayed after multifactorial authentication operations */
    statusMessage: {
      successMessage: (authorization?: boolean, using?: string) =>
        `You have successfully ${authorization ? "authorized the challenge" : "authenticated"}${using ? ` using ${using}` : ""}`,
      failedMessage: (authorization?: boolean, because?: string) =>
        `Your ${authorization ? "authorization" : "authentication"} ${because ? `failed: ${because}` : "was unsuccessful"}`,
      successTitle: (authorization?: boolean) =>
        `${authorization ? "Authorization" : "Authentication"} successful`,
      failedTitle: (authorization?: boolean) =>
        `${authorization ? "Authorization" : "Authentication"} failed`,
    },
    /** Title indicating multifactorial authentication registration status */
    title: (registered: boolean = true) =>
      `Multifactor Authentication (${registered ? "Registered" : "Not registered"})`,
    reason: {
      /** Success messages for multifactorial authentication operations */
      success: {
        keySavedInSecureStore: "Key successfully saved in SecureStore",
        keyRetrievedFromSecureStore:
          "Key successfully retrieved from SecureStore",
        keyNotInSecureStore: "No key found in SecureStore",
        keyPairGenerated: "Key pair successfully generated",
        tokenReceived: "Token received successfully",
        tokenSigned: "Token signed successfully",
        verificationSuccess: "Verification completed successfully",
        keyDeletedFromSecureStore: "Key successfully deleted from SecureStore",
      },
      /** Error messages for multifactorial authentication operation failures */
      error: {
        unableToSaveKey: "Failed to save key in SecureStore",
        unableToRetrieve: "Failed to retrieve key from SecureStore",
        unableToDelete: "Failed to delete key from SecureStore",
        badToken: "Invalid or missing token",
        tokenMissing: "Token is missing",
        keyMissing: "Key is missing",
        signatureMissing: "Signature is missing",
        challengeRejected: "Challenge rejected by API",
        validateCodeMissing: "Validation code is missing",
        otpMissing: "OTP code is missing",
        keyMissingOnTheBE: "Key is stored locally but not found on server",
        multifactorAuthenticationNotSupported:
          "This device does not support multifactorial authentication",
      },
      /** Error messages specific to Expo's SecureStore */
      expoErrors: {
        notInForeground: "Application must be in the foreground",
        alreadyInProgress: "Authentication already in progress",
        canceled: "Authentication canceled by user",
        generic: "An error occurred",
        keyExists: "This key already exists",
        noAuthentication: "No authentication methods available",
        oldAndroid: "This feature is not supported on your device",
      },
      /** Generic status messages */
      generic: {
        notRequested: "No request made yet",
        apiError: "API error occurred",
        authFactorsError: "Authentication factors error",
        authFactorsSufficient: "Authentication factors verified",
      },
    },
    /** API response messages */
    apiResponse: {
      registrationRequired: "Registration is required",
      challengeGenerated: "Challenge generated successfully",
      noPublicKey: "Public key not provided",
      keyAlreadyRegistered: "This public key is already registered",
      validationCodeRequired: "Please provide a validation code",
      validationCodeInvalid: "Invalid validation code",
      otpCodeInvalid: "Invalid OTP code",
      otpCodeRequired: "Please provide an OTP code",
      multifactorAuthenticationSuccess:
        "Multi-factor authentication registration successful",
      noTransactionID: "Transaction ID not provided",
      userNotRegistered: "User registration not found",
      unableToAuthorize: "Authorization failed with provided credentials",
      userAuthorized: "User authorized successfully",
      badRequest: "Invalid request",
      unknownResponse: "Unrecognized response type",
    },
    /** User input prompts during multifactorial authentication flows */
    provideValidateCode: "Enter your verification code to continue",
    provideOTPCode: "Enter your one-time password to continue",
  },
  // ...
};

export default translations;
