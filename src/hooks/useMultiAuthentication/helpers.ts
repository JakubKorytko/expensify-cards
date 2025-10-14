import {
  BiometricsPrivateKeyStore,
  BiometricsPublicKeyStore,
} from "@libs/Biometrics/BiometricsKeyStore";
import {
  BiometricsStatus,
  BiometricsPartialStatus,
  AuthTypeName,
  CreateBiometricsRecentStatus,
} from "./types";
import CONST from "@src/CONST";
import {
  BiometricsFactor,
  BiometricsFallbackScenarioParams,
  BiometricsScenario,
} from "@libs/Biometrics/scenarios/types";

/**
 * Creates a BiometricsRecentStatus object that contains both the status and cancel method.
 * The status includes whether the most recent biometric step was successful.
 * The cancel method is used to cancel the biometric operation.
 */
const createRecentStatus: CreateBiometricsRecentStatus = (result, cancel) => ({
  status: { ...result, value: !!result.step.wasRecentStepSuccessful },
  cancel,
});

/**
 * Creates a status object for failed biometric authorization attempts.
 * Takes the error status from a failed biometric operation and merges it with the previous status,
 * marking the attempt as unsuccessful while fulfilling the request to prevent retries.
 */
const createAuthorizeErrorStatus =
  (errorStatus: BiometricsPartialStatus<boolean, true>) =>
  (prevStatus: BiometricsStatus<boolean>) => ({
    ...prevStatus,
    ...errorStatus,
    step: {
      wasRecentStepSuccessful: false,
      isRequestFulfilled: true,
      requiredFactorForNextStep: undefined,
    },
  });

function areBiometricsFallbackParamsValid<T extends BiometricsScenario>(
  scenario: T,
  params: Record<string, unknown>,
): params is BiometricsFallbackScenarioParams<T> {
  return Object.keys(params).every((key) => {
    return CONST.BIOMETRICS.FACTOR_COMBINATIONS.TWO_FACTOR.find(
      (factor) =>
        CONST.BIOMETRICS.FACTORS_REQUIREMENTS[factor].parameter === key,
    );
  });
}

/**
 * Checks if the device supports either biometric authentication (like fingerprint/face)
 * or device credentials (like PIN/pattern) by querying the key store capabilities.
 */
function doesDeviceSupportBiometrics() {
  const { biometrics, credentials } =
    BiometricsPublicKeyStore.supportedAuthentication;
  return biometrics || credentials;
}

/**
 * Checks if biometrics is already set up by looking for a public key in secure storage.
 * A stored public key indicates successful prior configuration.
 */
async function isBiometryConfigured() {
  return !!(await BiometricsPublicKeyStore.get()).value;
}

/**
 * Cleans up biometrics configuration by removing both private and public keys
 * from secure storage. Used when resetting or recovering from failed setup.
 */
async function resetKeys() {
  await Promise.all([
    BiometricsPrivateKeyStore.delete(),
    BiometricsPublicKeyStore.delete(),
  ]);
}

/**
 * Creates the common status fields used across different status states.
 * Tracks success, fulfillment and any required authentication factor.
 */
const createBaseStep = (
  wasSuccessful: boolean,
  isRequestFulfilled: boolean,
  requiredFactor?: BiometricsFactor,
) => ({
  wasRecentStepSuccessful: wasSuccessful,
  isRequestFulfilled,
  requiredFactorForNextStep: requiredFactor,
});

/**
 * Creates a status indicating the device lacks biometric capability.
 * Sets success to false but marks request as fulfilled since no further scenario is possible.
 */
function createUnsupportedDeviceStatus(prevStatus: BiometricsStatus<boolean>) {
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
  prevStatus: BiometricsStatus<boolean>,
): BiometricsStatus<boolean> {
  return {
    ...prevStatus,
    step: createBaseStep(false, false, CONST.BIOMETRICS.FACTORS.VALIDATE_CODE),
    reason: "biometrics.reason.error.validateCodeMissing",
  };
}

/**
 * Creates a status from a key store error.
 * Preserves the error details but marks the request as fulfilled since retry is needed.
 */
function createKeyErrorStatus({
  reason,
  type,
}: BiometricsPartialStatus<boolean, true>) {
  return (
    prevStatus: BiometricsStatus<boolean>,
  ): BiometricsStatus<boolean> => ({
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
  partialStatus: Partial<BiometricsPartialStatus<boolean>>,
) {
  return (
    prevStatus: BiometricsStatus<boolean>,
  ): BiometricsStatus<boolean> => ({
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
  prevStatus: BiometricsStatus<boolean>,
): BiometricsStatus<boolean> {
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
 * Creates a status reflecting whether biometrics is configured.
 * Only updates the configuration flag while preserving other status fields.
 */
function createRefreshStatusStatus(isBiometricsConfiguredValue: boolean) {
  return (
    prevStatus: BiometricsStatus<boolean>,
  ): BiometricsStatus<boolean> => ({
    ...prevStatus,
    value: isBiometricsConfiguredValue,
  });
}

/**
 * Collection of status creator functions for handling different biometric states.
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
}: BiometricsPartialStatus<T>): AuthTypeName | undefined =>
  Object.values(CONST.BIOMETRICS.AUTH_TYPE).find(({ CODE }) => CODE === type)
    ?.NAME;

export {
  areBiometricsFallbackParamsValid,
  createRecentStatus,
  getAuthTypeName,
  doesDeviceSupportBiometrics,
  isBiometryConfigured,
  resetKeys,
  createAuthorizeErrorStatus,
  Status,
};
