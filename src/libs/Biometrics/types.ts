import { ValueOf } from "type-fest";
import CONST from "@src/CONST";
import { TranslationPaths } from "@src/languages/types";

/**
 * Represents the current biometric status of the device, such as whether biometrics are
 * configured, supported, or disabled.
 */
type BiometricsAction = ValueOf<typeof CONST.BIOMETRICS.ACTION>;

/**
 * Represents a single authentication factor used in biometric flows, like signatures
 * or validation codes.
 */
type BiometricsFactor = ValueOf<typeof CONST.BIOMETRICS.FACTORS>;

/**
 * Keys used to look up required authentication factors for different device statuses
 * in the device status factors map.
 */
type BiometricsActionMapKey = keyof typeof CONST.BIOMETRICS.ACTION_FACTORS_MAP;

/**
 * Maps the required authentication factors based on the device's biometric status.
 * Creates a record type where each key is a required parameter (like signedChallenge or validateCode)
 * and the value is the corresponding type for that parameter.
 * Optional parameters will have an undefined union type.
 *
 * For example, when device status is "AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE", the type would be:
 * {
 *  signedChallenge: string;
 *  validateCode: number;
 * }
 */
type BiometricsFactors<T extends BiometricsAction> = {
  [K in (typeof CONST.BIOMETRICS.ACTION_FACTORS_MAP)[T][number] as K["parameter"]]: K extends {
    optional: true;
  }
    ? K["type"] | undefined
    : K["type"];
};

type BiometricsActionResponse = { httpCode: number; reason: TranslationPaths };

export type {
  BiometricsAction,
  BiometricsActionResponse,
  BiometricsFactors,
  BiometricsFactor,
  BiometricsActionMapKey,
};
