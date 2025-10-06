import CONST from "@src/CONST";
import { authorizeTransaction } from "../actions/Biometrics";
import {
  BiometricsAuthFactors,
  DeviceBiometricsStatus,
  BiometricsDeviceStatusMapKey,
  BiometricsPartialStatusWithOTP,
} from "@libs/Biometrics/types";
import { BiometricsPartialStatus } from "@hooks/useBiometricsStatus/types";

/**
 * Validates that all required authentication factors are present and of the correct type/format.
 * Checks each factor's presence, type, and length requirements.
 * Skips OTP validation if the validation code hasn't been verified yet.
 */
function areBiometricsFactorsSufficient<T extends DeviceBiometricsStatus>(
  deviceStatus: T,
  factors: BiometricsAuthFactors<T>,
  isValidateCodeVerified: boolean,
): BiometricsPartialStatus<true | string, true> {
  const requiredFactors =
    CONST.BIOMETRICS.DEVICE_STATUS_FACTORS_MAP[deviceStatus];

  for (const { id, parameter, name, type, length } of requiredFactors) {
    if (id === CONST.BIOMETRICS.AUTH_FACTORS.OTP && !isValidateCodeVerified) {
      continue;
    }

    if (!(parameter in factors)) {
      return {
        value: `Missing required factor: ${name} (${parameter})`,
        reason: "biometrics.reason.generic.authFactorsError",
      };
    }

    const value = factors[parameter as keyof BiometricsAuthFactors<T>];

    if (typeof value !== typeof type) {
      return {
        value: `Invalid type for factor: ${name} (${parameter}). Expected ${typeof type}, got ${typeof value}`,
        reason: "biometrics.reason.generic.authFactorsError",
      };
    }

    if (typeof length === "number" && String(value).length !== length) {
      return {
        value: `Invalid length for factor: ${name} (${parameter}). Expected length ${length}, got length ${String(value).length}`,
        reason: "biometrics.reason.generic.authFactorsError",
      };
    }
  }

  return {
    value: true,
    reason: "biometrics.reason.generic.authFactorsSufficient",
  };
}

/**
 * Main authorization function that handles the complete transaction flow.
 * First validates that all required factors are present and valid.
 * Then sends the authorization request to the server.
 * Returns whether the authorization was successful and if additional OTP verification is needed.
 */
async function authorizeBiometricsAction<
  T extends BiometricsDeviceStatusMapKey,
>(
  deviceStatus: T,
  transactionID: string,
  factors: BiometricsAuthFactors<T>,
  isValidateCodeVerified: boolean = true,
): Promise<BiometricsPartialStatusWithOTP> {
  const factorsCheckResult = areBiometricsFactorsSufficient(
    deviceStatus,
    factors,
    isValidateCodeVerified,
  );

  if (factorsCheckResult.value !== true) {
    return {
      ...factorsCheckResult,
      value: { successful: false, isOTPRequired: false },
    };
  }

  const { httpCode, reason } = await authorizeTransaction({
    ...factors,
    transactionID,
  });

  return {
    value: {
      successful: String(httpCode).startsWith("2"),
      isOTPRequired: httpCode === 202,
    },
    reason,
  };
}

export default authorizeBiometricsAction;
