import { ValueOf } from "type-fest";
import CONST from "@src/CONST";
import { BiometricsStatus } from "@hooks/useBiometrics/types";

type DeviceBiometricsStatus = ValueOf<
  typeof CONST.BIOMETRICS.DEVICE_BIOMETRICS_STATUS
>;

type BiometricsAuthFactor = ValueOf<typeof CONST.BIOMETRICS.AUTH_FACTORS>;

type BiometricsDeviceStatusMapKey =
  keyof typeof CONST.BIOMETRICS.DEVICE_STATUS_FACTORS_MAP;

/**
 * Maps the required authentication factors based on the device's biometric status
 * i.e. it creates a record of `parameter` and its corresponding `type` for each factor based on the device status.
 *
 * @example
 * For `DeviceBiometricsStatus = "NOT_CONFIGURED"`, the resulting type would be:
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

type BiometricsStatusWithOTP = BiometricsStatus<{
  successful: boolean;
  isOTPRequired: boolean;
}>;

export type {
  DeviceBiometricsStatus,
  BiometricsStatusWithOTP,
  BiometricsAuthFactors,
  BiometricsAuthFactor,
  BiometricsDeviceStatusMapKey,
};
