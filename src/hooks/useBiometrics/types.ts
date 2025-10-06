import { Register } from "@hooks/useBiometricsSetup/types";
import { BiometricsStatus } from "../useBiometricsStatus/types";

/**
 * Represents the most recent biometrics status and method to cancel it
 */
type BiometricsRecentStatus = {
  status: BiometricsStatus<boolean>;
  cancel: () => BiometricsStatus<unknown>;
};

/**
 * Parameters required for biometric authorization
 */
type AuthorizationParams = {
  otp?: number;
  validateCode?: number;
  transactionID: string;
};

/**
 * Function type for performing biometric authorization
 */
type BiometricsAuthorization = (
  params: AuthorizationParams,
) => Promise<BiometricsStatus<boolean>>;

/**
 * Available biometric actions including registration, authorization, reset and cancel
 */
type BiometricsActions = {
  register: Register;
  authorize: BiometricsAuthorization;
  resetSetup: () => Promise<BiometricsStatus<boolean>>;
  cancel: () => BiometricsStatus<boolean>;
};

/**
 * Current state of biometrics including status and configuration state
 */
type BiometricsState = BiometricsStatus<boolean> & {
  isBiometryConfigured: boolean;
};

/**
 * Hook return type containing biometrics state and available actions
 */
type UseBiometrics = [BiometricsState, BiometricsActions];

/**
 * Factory function type for creating a BiometricsRecentStatus object
 */
type CreateBiometricsRecentStatus = (
  result: BiometricsStatus<unknown>,
  cancel: () => BiometricsStatus<unknown>,
) => BiometricsRecentStatus;

export type {
  BiometricsAuthorization,
  UseBiometrics,
  BiometricsRecentStatus,
  CreateBiometricsRecentStatus,
  BiometricsActions,
  BiometricsState,
};
