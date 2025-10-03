import {
  BiometricsPrivateKeyStore,
  BiometricsPublicKeyStore,
} from "@libs/Biometrics/BiometricsKeyStore";
import {
  BiometricsStatus,
  BiometricsStepWithStatus,
} from "@hooks/useBiometrics/types";
import CONST from "@src/CONST";
import { BiometricsPartialStatus } from "@hooks/useBiometricsStatus/types";

/**
 * Initial, neutral biometrics status shape used to bootstrap hook state.
 * - isRequestFulfilled defaults to true so UI isn't blocked initially.
 */
const INITIAL_BIOMETRICS_STATUS = {
  requiredFactorForNextStep: undefined,
  wasRecentStepSuccessful: undefined,
  isBiometryConfigured: false,
  isRequestFulfilled: true,
};

/**
 * Returns whether the device supports either biometrics or device credentials
 * based on values exposed by the key store implementation.
 */
function doesDeviceSupportBiometrics() {
  const { biometrics, credentials } =
    BiometricsPublicKeyStore.supportedAuthentication;

  return biometrics || credentials;
}

/**
 * Checks if a biometrics public key exists in the secure store.
 * Presence indicates prior successful registration/configuration.
 */
async function isBiometryConfigured() {
  const key = await BiometricsPublicKeyStore.get();
  return !!key.value;
}

/**
 * Removes both private and public keys from the secure store.
 * Useful for recovering from partial/failed registrations.
 */
async function resetKeys() {
  await BiometricsPrivateKeyStore.delete();
  await BiometricsPublicKeyStore.delete();
}

/**
 * Builds status for the case where the device cannot support biometrics.
 */
function createUnsupportedDeviceStatus(
  prevStatus: BiometricsStatus<BiometricsStepWithStatus>,
) {
  return {
    ...prevStatus,
    value: {
      requiredFactorForNextStep: undefined,
      isRequestFulfilled: true,
      isBiometryConfigured: false,
      wasRecentStepSuccessful: false,
    },
  };
}

/**
 * Builds status when a required validate code is missing.
 */
function createValidateCodeMissingStatus(
  prevStatus: BiometricsStatus<BiometricsStepWithStatus>,
): BiometricsStatus<BiometricsStepWithStatus> {
  return {
    ...prevStatus,
    value: {
      ...prevStatus.value,
      wasRecentStepSuccessful: false,
      isRequestFulfilled: false,
      requiredFactorForNextStep: CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE,
    },
    reason: "biometrics.reason.error.validateCodeMissing",
  };
}

/**
 * Builds status from a key store error result.
 */
function createKeyErrorStatus(
  keyResult: BiometricsPartialStatus<boolean>,
): (
  prevStatus: BiometricsStatus<BiometricsStepWithStatus>,
) => BiometricsStatus<BiometricsStepWithStatus> {
  return (prevStatus: BiometricsStatus<BiometricsStepWithStatus>) => ({
    ...prevStatus,
    ...keyResult,
    value: {
      ...prevStatus.value,
      wasRecentStepSuccessful: false,
      isRequestFulfilled: true,
      requiredFactorForNextStep: undefined,
    },
  });
}

/**
 * Builds status from a registration API call outcome.
 */
function createRegistrationResultStatus(
  authReason: BiometricsPartialStatus<boolean>,
): (
  prevStatus: BiometricsStatus<BiometricsStepWithStatus>,
) => BiometricsStatus<BiometricsStepWithStatus> {
  return (prevStatus: BiometricsStatus<BiometricsStepWithStatus>) => ({
    ...prevStatus,
    ...authReason,
    value: {
      ...prevStatus.value,
      wasRecentStepSuccessful: authReason.value,
      isRequestFulfilled: true,
      requiredFactorForNextStep: undefined,
    },
  });
}

/**
 * Marks the current status as fulfilled, clearing pending requirements.
 */
function createFulfillStatus(
  prevStatus: BiometricsStatus<BiometricsStepWithStatus>,
): BiometricsStatus<BiometricsStepWithStatus> {
  return prevStatus.value.isRequestFulfilled
    ? prevStatus
    : {
        ...prevStatus,
        value: {
          ...prevStatus.value,
          isRequestFulfilled: true,
          requiredFactorForNextStep: undefined,
          wasRecentStepSuccessful:
            !prevStatus.value.requiredFactorForNextStep &&
            prevStatus.value.wasRecentStepSuccessful,
        },
      };
}

/**
 * Updates the "isBiometryConfigured" field from a boolean probe result.
 */
function createRefreshStatusStatus(
  isBiometricsConfiguredValue: boolean,
): (
  prevStatus: BiometricsStatus<BiometricsStepWithStatus>,
) => BiometricsStatus<BiometricsStepWithStatus> {
  return (prevStatus: BiometricsStatus<BiometricsStepWithStatus>) => ({
    ...prevStatus,
    value: {
      ...prevStatus.value,
      isBiometryConfigured: isBiometricsConfiguredValue,
    },
  });
}

/**
 * Namespaced helper factory for building common biometrics status states.
 */
const Status = {
  createUnsupportedDeviceStatus,
  createValidateCodeMissingStatus,
  createKeyErrorStatus,
  createRegistrationResultStatus,
  createFulfillStatus,
  createRefreshStatusStatus,
} as const;

export {
  doesDeviceSupportBiometrics,
  isBiometryConfigured,
  resetKeys,
  INITIAL_BIOMETRICS_STATUS,
  Status,
};
