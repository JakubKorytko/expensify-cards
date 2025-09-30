import { BiometricsStatus } from "@hooks/useBiometrics/types";
import CONST from "@src/CONST";
import { authorizeTransaction } from "../actions/Biometrics";
import { BiometricsPublicKeyStore } from "@libs/Biometrics/BiometricsKeyStore";
import {
  BiometricsAuthFactor,
  BiometricsAuthFactors,
  DeviceBiometricsStatus,
  BiometricsDeviceStatusMapKey,
} from "@libs/Biometrics/types";

/**
 * Determines the current biometrics device status.
 * i.e. whether the device supports biometrics or device credentials and whether the user has configured it.
 */
function getDeviceBiometricsStatus(): Promise<DeviceBiometricsStatus> {
  const { supportedAuthentication } = BiometricsPublicKeyStore;

  const isAnythingSupported = Object.values(supportedAuthentication).some(
    Boolean,
  );

  if (!isAnythingSupported) {
    return Promise.resolve(
      CONST.BIOMETRICS.DEVICE_BIOMETRICS_STATUS.NOT_SUPPORTED,
    );
  }

  return BiometricsPublicKeyStore.get().then(
    ({ value }) =>
      CONST.BIOMETRICS.DEVICE_BIOMETRICS_STATUS[
        value ? "CONFIGURED" : "NOT_CONFIGURED"
      ],
  );
}

/**
 * Verifies that the provided factors meet the required factors for authorization.
 * Specifically checks for the presence of OTP and validateCode if they are required.
 */
function verifyRequiredFactors({
  otp,
  validateCode,
  requiredFactors,
  isValidateCodeVerified,
}: {
  otp?: number;
  validateCode?: number;
  requiredFactors: BiometricsAuthFactor[];
  isValidateCodeVerified: boolean;
}): BiometricsStatus<boolean> {
  const isValidateCodeRequired = requiredFactors.includes(
    CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE,
  );
  const isOtpIncludedAsFactor = requiredFactors.includes(
    CONST.BIOMETRICS.AUTH_FACTORS.OTP,
  );

  const areBothRequired = isOtpIncludedAsFactor && isValidateCodeRequired;

  /** If both are required, and the validate code hasn't been verified yet, only validateCode is needed */
  const isOtpRequired = areBothRequired
    ? isValidateCodeVerified
    : isOtpIncludedAsFactor;

  /** Check that we have everything we need to proceed */
  if (isValidateCodeRequired && !validateCode) {
    return {
      value: false,
      reason: "biometrics.reason.error.validateCodeMissing",
    };
  }

  if (isOtpRequired && !otp) {
    return {
      value: false,
      reason: "biometrics.reason.error.otpMissing",
    };
  }

  return {
    value: true,
    reason: "biometrics.reason.generic.authFactorsSufficient",
  };
}

/**
 * Returns a list of required authorization factors based on the current device biometrics status.
 */
function getBiometricsAuthorizationFactors(): Promise<BiometricsAuthFactor[]> {
  return getDeviceBiometricsStatus().then((deviceStatus) =>
    CONST.BIOMETRICS.DEVICE_STATUS_FACTORS_MAP[deviceStatus].map(
      (factor) => factor.id,
    ),
  );
}

/**
 * Validates whether the provided authorization factors are sufficient based on the current device biometrics status.
 */
function areBiometricsFactorsSufficient<T extends DeviceBiometricsStatus>(
  deviceStatus: T,
  factors: BiometricsAuthFactors<T>,
  isValidateCodeVerified: boolean,
): BiometricsStatus<boolean> {
  const requiredFactors =
    CONST.BIOMETRICS.DEVICE_STATUS_FACTORS_MAP[deviceStatus];

  for (const factor of requiredFactors) {
    const param = factor.parameter;
    let message = "";

    /** We should skip OTP check if the validate code was not verified before */
    if (
      factor.id === CONST.BIOMETRICS.AUTH_FACTORS.OTP &&
      !isValidateCodeVerified
    ) {
      continue;
    }

    if (!(param in factors)) {
      message = `Missing required factor: ${factor.name} (${factor.parameter})`;
    }

    const value = factors[param as keyof BiometricsAuthFactors<T>];

    if (!message && typeof value !== typeof factor.type) {
      message = `Invalid type for factor: ${factor.name} (${factor.parameter}). Expected ${typeof factor.type}, got ${typeof value}`;
    }

    if (
      !message &&
      typeof factor.length === "number" &&
      String(value).length !== factor.length
    ) {
      message = `Invalid length for factor: ${factor.name} (${factor.parameter}). Expected length ${factor.length}, got length ${String(value).length}`;
    }

    if (message) {
      return {
        value: false,
        reason: "biometrics.reason.generic.authFactorsError",
        message,
      };
    }
  }

  return {
    value: true,
    reason: "biometrics.reason.generic.authFactorsSufficient",
  };
}

/**
 * Authorizes a transaction using biometrics and/or other factors based on the device's biometrics status.
 * Validates that the provided factors are sufficient before attempting authorization.
 */
function authorizeBiometricsAction<T extends BiometricsDeviceStatusMapKey>(
  deviceStatus: T,
  transactionID: string,
  factors: BiometricsAuthFactors<T>,
  isValidateCodeVerified: boolean = true,
): Promise<
  BiometricsStatus<{
    successful: boolean;
    isOTPRequired: boolean;
  }>
> {
  const factorsCheckResult = areBiometricsFactorsSufficient(
    deviceStatus,
    factors,
    isValidateCodeVerified,
  );

  if (!factorsCheckResult.value) {
    return Promise.resolve({
      ...factorsCheckResult,
      value: {
        successful: false,
        isOTPRequired: false,
      },
    });
  }

  return authorizeTransaction({
    ...factors,
    transactionID,
  }).then(({ httpCode, reason }) => ({
    value: {
      successful: String(httpCode).startsWith("2"),
      isOTPRequired: httpCode === 202,
    },
    reason,
  }));
}

export default authorizeBiometricsAction;
export { getBiometricsAuthorizationFactors, verifyRequiredFactors };
