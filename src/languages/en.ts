const translations = {
  // ...
  biometrics: {
    feedbackMessage: {
      success: (authorization?: boolean, using?: string) =>
        `You’ve successfully ${authorization ? "authorized challenge" : "authenticated"}${using ? ` using ${using}` : ""}`,
      failed: (authorization?: boolean, because?: string) =>
        `Your ${authorization ? "authorization" : "authentication"} attempt ${because ? `failed with error: ${because}` : "was unsuccessful."}`,
    },
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
      },
      expoErrors: {
        notInForeground: "App is not in the foreground",
        alreadyInProgress: "Authentication is already in progress",
        canceled: "Authentication was canceled",
        generic: "Something went wrong",
      },
      generic: {
        notRequested: "Not requested yet",
        apiError: "API error",
      },
    },
    apiResponse: {
      registrationRequired: "Registration required",
      challengeGenerated: "Challenge generated successfully",
      noPublicKey: "No public key provided",
      keyAlreadyRegistered: "Public key is already registered",
      validationCodeRequired: "Validation code is required",
      validationCodeInvalid: "Validation code is invalid",
      biometricsSuccess: "Biometrics registered successfully",
      noTransactionID: "No transaction ID provided",
      userNotRegistered: "User is not registered",
      unableToAuthorize: "Unable to authorize user using provided parameters",
      userAuthorized: "User authorized successfully",
      badRequest: "Bad request",
      unknownResponse: "Unknown response type",
    },
  },
  // ...
};

export default translations;
