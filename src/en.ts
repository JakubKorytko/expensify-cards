type NestedRecord<T> = { [key: string]: T | NestedRecord<T> };
type ElementType = string | ((...args: any[]) => string);

const translations: NestedRecord<ElementType> | ElementType = {
  biometrics: {
    feedbackMessage: {
      success: (authorization?: boolean) =>
        `You’ve successfully ${authorization ? "authorized challenge" : "authenticated"}.`,
      successUsing: (authorization?: boolean) =>
        `You’ve successfully ${authorization ? "authorized challenge" : "authenticated"} using`,
      failed: (authorization?: boolean) =>
        `Your ${authorization ? "authorization" : "authentication"} attempt was unsuccessful.`,
      failedBecause: (authorization?: boolean) =>
        `Your ${authorization ? "authorization" : "authentication"} attempt failed with error`,
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
        unableToRetrieve: "Unable to retrieve key from the SecureStore",
        badToken: "Requested token is missing or invalid",
        tokenMissing: "Token is missing",
        keyMissing: "Key is missing",
        signatureMissing: "Signature is missing",
        challengeRejected: "API rejected the challenge",
      },
      generic: {
        notRequested: "Not requested yet",
        apiError: "API error",
      },
    },
  },
};

export default translations;
export type { NestedRecord, ElementType };
