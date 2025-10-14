import {
  MultiFactorAuthenticationPrivateKeyStore,
  MultiFactorAuthenticationPublicKeyStore,
} from "@libs/MultiFactorAuthentication/MultiFactorAuthenticationKeyStore";
import {
  MultiFactorAuthenticationStatus,
  MultiFactorAuthenticationPartialStatus,
  AuthTypeName,
  CreateMultiFactorAuthenticationRecentStatus,
} from "./types";
import CONST from "@src/CONST";
import {
  MultiFactorAuthenticationFactor,
  MultiFactorAuthorizationFallbackScenarioParams,
  MultiFactorAuthenticationScenario,
} from "@libs/MultiFactorAuthentication/scenarios/types";

/**
 * Creates a MultiFactorAuthenticationRecentStatus object that contains both the status and cancel method.
 * The status includes whether the most recent multifactorial authentication step was successful.
 * The cancel method is used to cancel the multifactorial authentication operation.
 */
const createRecentStatus: CreateMultiFactorAuthenticationRecentStatus = (
  result,
  cancel,
) => ({
  status: { ...result, value: !!result.step.wasRecentStepSuccessful },
  cancel,
});

/**
 * Creates a status object for failed multifactorial authentication authorization attempts.
 * Takes the error status from a failed multifactorial authentication operation and merges it with the previous status,
 * marking the attempt as unsuccessful while fulfilling the request to prevent retries.
 */
const createAuthorizeErrorStatus =
  (errorStatus: MultiFactorAuthenticationPartialStatus<boolean, true>) =>
  (prevStatus: MultiFactorAuthenticationStatus<boolean>) => ({
    ...prevStatus,
    ...errorStatus,
    step: {
      wasRecentStepSuccessful: false,
      isRequestFulfilled: true,
      requiredFactorForNextStep: undefined,
    },
  });

function areMultiFactorAuthorizationFallbackParamsValid<
  T extends MultiFactorAuthenticationScenario,
>(
  scenario: T,
  params: Record<string, unknown>,
): params is MultiFactorAuthorizationFallbackScenarioParams<T> {
  return Object.keys(params).every((key) => {
    return CONST.MULTI_FACTOR_AUTHENTICATION.FACTOR_COMBINATIONS.TWO_FACTOR.find(
      (factor) =>
        CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS[factor]
          .parameter === key,
    );
  });
}

/**
 * Checks if the device supports either multifactorial authentication (like fingerprint/face)
 * or device credentials (like PIN/pattern) by querying the key store capabilities.
 */
function doesDeviceSupportBiometrics() {
  const { biometrics, credentials } =
    MultiFactorAuthenticationPublicKeyStore.supportedAuthentication;
  return biometrics || credentials;
}

/**
 * Checks if multifactorial authentication is already set up by looking for a public key in secure storage.
 * A stored public key indicates successful prior configuration.
 */
async function isBiometryConfigured() {
  return !!(await MultiFactorAuthenticationPublicKeyStore.get()).value;
}

/**
 * Cleans up multifactorial authentication configuration by removing both private and public keys
 * from secure storage. Used when resetting or recovering from failed setup.
 */
async function resetKeys() {
  await Promise.all([
    MultiFactorAuthenticationPrivateKeyStore.delete(),
    MultiFactorAuthenticationPublicKeyStore.delete(),
  ]);
}

/**
 * Creates the common status fields used across different status states.
 * Tracks success, fulfillment and any required authentication factor.
 */
const createBaseStep = (
  wasSuccessful: boolean,
  isRequestFulfilled: boolean,
  requiredFactor?: MultiFactorAuthenticationFactor,
) => ({
  wasRecentStepSuccessful: wasSuccessful,
  isRequestFulfilled,
  requiredFactorForNextStep: requiredFactor,
});

/**
 * Creates a status indicating the device lacks multifactorial authentication capability.
 * Sets success to false but marks request as fulfilled since no further scenario is possible.
 */
function createUnsupportedDeviceStatus(
  prevStatus: MultiFactorAuthenticationStatus<boolean>,
) {
  return {
    ...prevStatus,
    value: false,
    step: createBaseStep(false, true),
  };
}

/**
 * Creates a status requesting a validation code from the user.
 * Sets success to false and unfulfilled since user input is required.
 */
function createValidateCodeMissingStatus(
  prevStatus: MultiFactorAuthenticationStatus<boolean>,
): MultiFactorAuthenticationStatus<boolean> {
  return {
    ...prevStatus,
    step: createBaseStep(
      false,
      false,
      CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE,
    ),
    reason: "multiFactorAuthentication.reason.error.validateCodeMissing",
  };
}

/**
 * Creates a status from a key store error.
 * Preserves the error details but marks the request as fulfilled since retry is needed.
 */
function createKeyErrorStatus({
  reason,
  type,
}: MultiFactorAuthenticationPartialStatus<boolean, true>) {
  return (
    prevStatus: MultiFactorAuthenticationStatus<boolean>,
  ): MultiFactorAuthenticationStatus<boolean> => ({
    ...prevStatus,
    reason,
    type,
    step: createBaseStep(false, true),
  });
}

/**
 * Creates a status reflecting the result of registering with the backend.
 * Success is based on the API response but always marks as fulfilled.
 */
function createRegistrationResultStatus(
  partialStatus: Partial<MultiFactorAuthenticationPartialStatus<boolean>>,
) {
  return (
    prevStatus: MultiFactorAuthenticationStatus<boolean>,
  ): MultiFactorAuthenticationStatus<boolean> => ({
    ...prevStatus,
    ...partialStatus,
    step: createBaseStep(!!partialStatus.step?.wasRecentStepSuccessful, true),
  });
}

/**
 * Creates a status marking the current request as complete.
 * Success depends on having no pending requirements and previous success.
 * Returns unchanged status if already fulfilled.
 */
function createFulfillStatus(
  prevStatus: MultiFactorAuthenticationStatus<boolean>,
): MultiFactorAuthenticationStatus<boolean> {
  if (prevStatus.step.isRequestFulfilled) {
    return prevStatus;
  }

  const wasSuccessful =
    !prevStatus.step.requiredFactorForNextStep &&
    !!prevStatus.step.wasRecentStepSuccessful;

  return {
    ...prevStatus,
    step: createBaseStep(wasSuccessful, true),
  };
}

/**
 * Creates a status reflecting whether multifactorial authentication is configured.
 * Only updates the configuration flag while preserving other status fields.
 */
function createRefreshStatusStatus(
  isMultiFactorAuthenticationConfiguredValue: boolean,
) {
  return (
    prevStatus: MultiFactorAuthenticationStatus<boolean>,
  ): MultiFactorAuthenticationStatus<boolean> => ({
    ...prevStatus,
    value: isMultiFactorAuthenticationConfiguredValue,
  });
}

/**
 * Collection of status creator functions for handling different multifactorial authentication states.
 * Each function builds a properly formatted status object for its specific case.
 */
const Status = {
  createUnsupportedDeviceStatus,
  createValidateCodeMissingStatus,
  createKeyErrorStatus,
  createRegistrationResultStatus,
  createFulfillStatus,
  createRefreshStatusStatus,
} as const;

/**
 * Helper function that converts a numeric authentication type from SecureStore into
 * a human-readable string name.
 */
const getAuthTypeName = <T>({
  type,
}: MultiFactorAuthenticationPartialStatus<T>): AuthTypeName | undefined =>
  Object.values(CONST.MULTI_FACTOR_AUTHENTICATION.AUTH_TYPE).find(
    ({ CODE }) => CODE === type,
  )?.NAME;

export {
  areMultiFactorAuthorizationFallbackParamsValid,
  createRecentStatus,
  getAuthTypeName,
  doesDeviceSupportBiometrics,
  isBiometryConfigured,
  resetKeys,
  createAuthorizeErrorStatus,
  Status,
};
