const APIResponses = {
  keyExists: "Key already exists",
  keyNotPresentInBody: "Key is not present in body",
};

const authReasonCodes = {
  successfulSign: "Successfully signed token",
  tokenMissing: "Token is missing",
  keyMissing: "Key is missing",
  keyAndTokenMissing: "Token and key is missing",
  keyExists: "Key already exists in the SecureStore",
  keySavedInSecureStore: "Successfully saved key in SecureStore",
  keyRetrievedFromSecureStore: "Successfully retrieved key from SecureStore",
  keyExistsInBE: "Key already exists on the backend",
  invalidRequestKeyMissingInBody:
    "Invalid request to API, key not present in request body",
  successfullyReceivedToken: "Successfully received token",
  badToken: "Requested token is missing or invalid",
  verificationSuccessful: "Verification successful",
  apiRejectedToken: "API rejected the token",
  signatureMissing: "Invalid or missing signature",
  tokenAndSignatureMissing: "Token and signature is missing",
  keyPairGeneratedSuccessfully: "Key pair generated successfully",
  keyDeletedSuccessfully: "Key deleted successfully",
};

type AuthReturnValue<T> = {
  value: T;
  reason: string;
};

const PUBLIC_KEY = "3DS_SCA_KEY_PUBLIC";
const PRIVATE_KEY = "3DS_SCA_KEY_PRIVATE";

export { authReasonCodes, APIResponses, PRIVATE_KEY, PUBLIC_KEY };
export type { AuthReturnValue };
