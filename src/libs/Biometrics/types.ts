import { ValueOf } from "type-fest";
import CONST from "@src/CONST";
import { BiometricsPartialStatus } from "@hooks/useBiometricsStatus/types";

/**
 * Represents the current biometric status of the device, such as whether biometrics are 
 * configured, supported, or disabled.
 */
type DeviceBiometricsStatus = ValueOf<
  typeof CONST.BIOMETRICS.DEVICE_BIOMETRICS_STATUS
>;

/**
 * Represents a single authentication factor used in biometric flows, like signatures
 * or validation codes.
 */
type BiometricsAuthFactor = ValueOf<typeof CONST.BIOMETRICS.AUTH_FACTORS>;

/**
 * Keys used to look up required authentication factors for different device statuses
 * in the device status factors map.
 */
type BiometricsDeviceStatusMapKey =
  keyof typeof CONST.BIOMETRICS.DEVICE_STATUS_FACTORS_MAP;

/**
 * Maps the required authentication factors based on the device's biometric status.
 * Creates a record type where each key is a required parameter (like signedChallenge or validateCode)
 * and the value is the corresponding type for that parameter.
 * Optional parameters will have an undefined union type.
 *
 * For example, when device status is "NOT_CONFIGURED", the type would be:
 * {
 *  signedChallenge: string;
 *  validateCode: number;
 * }
 */
type BiometricsAuthFactors<T extends DeviceBiometricsStatus> = {
  [K in (typeof CONST.BIOMETRICS.DEVICE_STATUS_FACTORS_MAP)[T][number] as K["parameter"]]: K extends {
    optional: true;
  }
    ? K["type"] | undefined
    : K["type"];
};

/**
 * Status type that includes whether authentication was successful and if an 
 * additional OTP (one-time password) verification is required.
 */
type BiometricsPartialStatusWithOTP = BiometricsPartialStatus<{
  successful: boolean;
  isOTPRequired: boolean;
}, true>;

export type {
  DeviceBiometricsStatus,
  BiometricsPartialStatusWithOTP,
  BiometricsAuthFactors,
  BiometricsAuthFactor,
  BiometricsDeviceStatusMapKey,
};
