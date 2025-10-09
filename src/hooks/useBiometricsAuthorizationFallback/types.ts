import { BiometricsStatus, BiometricsStep } from "../useBiometricsStatus/types";
import {
  BiometricsFallbackAction,
  BiometricsFallbackActionParams,
  StoredValueType,
} from "@libs/Biometrics/types";

/**
 * Function type for authorizing transactions when biometrics is not available.
 * Uses provided factors as alternative authentication factors.
 * Returns a status containing the first verified factor.
 */
type AuthorizeUsingFallback<T extends BiometricsFallbackAction> = (
  params: BiometricsFallbackActionParams<T>,
) => Promise<BiometricsStatus<StoredValueType<T> | undefined>>;

/**
 * User-facing status messages for the current biometric state
 */
type BiometricsStatusMessage = {
  /** Detailed message explaining the current state or required action */
  message: string;

  /** Brief status header (e.g. "Authentication Successful") */
  title: string;
};

/**
 * Hook return type for biometrics fallback authorization.
 * Provides status tracking, authorization function, and request canceling.
 * Status tracks the current verified factor and authorization state.
 */
type UseBiometricsAuthorizationFallback<T extends BiometricsFallbackAction> =
  BiometricsStatusMessage &
    BiometricsStep & {
      authorize: AuthorizeUsingFallback<T>;
      cancel: () => BiometricsStatus<StoredValueType<T> | undefined>;
    };

export type { AuthorizeUsingFallback, UseBiometricsAuthorizationFallback };
