import type { ValueOf } from "type-fest";
import { TranslationPaths } from "@src/languages/types";
import { AUTH_TYPE } from "expo-secure-store";
import CONST from "@src/CONST";
import {
  BiometricsFallbackScenario,
  BiometricsFallbackScenarioParams,
  BiometricsFactor,
} from "@libs/Biometrics/scenarios/types";

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
type BiometricsAuthorizationMethod = (
  params: AuthorizationParams,
) => Promise<BiometricsStatus<boolean>>;

/**
 * Available biometric scenarios including registration, authorization, reset and cancel
 */
type BiometricsMethods = {
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
 * Hook return type containing biometrics state and available scenarios
 */
type UseBiometrics = [BiometricsState, BiometricsMethods];

/**
 * Factory function type for creating a BiometricsRecentStatus object
 */
type CreateBiometricsRecentStatus = (
  result: BiometricsStatus<unknown>,
  cancel: () => BiometricsStatus<unknown>,
) => BiometricsRecentStatus;

/**
 * Function that handles biometric authorization of transactions.
 * Takes a transaction ID, optional validate code, and optional chained private key status.
 * Returns a promise resolving to the authorization status.
 */
type BiometricsAuthorization = (params: {
  transactionID: string;
  validateCode?: number;
  chainedPrivateKeyStatus?: BiometricsStatus<string | null>;
}) => Promise<BiometricsStatus<boolean>>;

/**
 * Hook return type for biometric transaction authorization.
 * Provides current authorization status, authorize function to initiate authorization,
 * and cancel function to cancel the current authorization flow.
 */
type UseBiometricsAuthorization = {
  status: BiometricsStatus<boolean>;
  authorize: BiometricsAuthorization;
  cancel: () => void;
};

/**
 * Function type for authorizing transactions when biometrics is not available.
 * Uses provided factors as alternative authentication factors.
 * Returns a status containing the first verified factor.
 */
type AuthorizeUsingFallback<T extends BiometricsFallbackScenario> = (
  params: BiometricsFallbackScenarioParams<T>,
) => Promise<BiometricsStatus<number | undefined>>;

/**
 * Hook return type for biometrics fallback authorization.
 * Provides status tracking, authorization function, and request canceling.
 * Status tracks the current verified factor and authorization state.
 */
type UseBiometricsAuthorizationFallback<T extends BiometricsFallbackScenario> =
  BiometricsStatusMessage &
    BiometricsStep & {
      authorize: AuthorizeUsingFallback<T>;
      cancel: () => BiometricsStatus<number | undefined>;
    };

/**
 * Base type for the register function that handles biometric setup.
 * Takes a validate code and additional params, returns a BiometricsStatus.
 */
type RegisterFunction<T, R> = (
  params: { validateCode?: number } & T,
) => Promise<BiometricsStatus<R>>;

/**
 * Function to register biometrics on the device.
 * Returns different status types based on whether authorization is chained:
 * - With chained=true: Returns a string status for the next authorization step
 * - With chained=false: Returns a boolean indicating registration success
 * - With chained unspecified: Returns either boolean or string based on flow
 */
type Register = RegisterFunction<{ chainedWithAuthorization: true }, string> &
  RegisterFunction<{ chainedWithAuthorization?: false }, boolean> &
  RegisterFunction<{ chainedWithAuthorization?: boolean }, boolean | string>;

/**
 * Information about the device's biometric capabilities and configuration state
 */
type BiometricsInfo = {
  /** Whether the device supports biometric auth (fingerprint/face) or fallback (PIN/pattern) */
  deviceSupportBiometrics: boolean;

  /** Whether biometrics is already set up with a stored public key */
  isBiometryConfigured: boolean;
};

/**
 * User-facing status messages for the current biometric state
 */
type BiometricsStatusMessage = {
  /** Detailed message explaining the current state or required scenario */
  message: string;

  /** Brief status header (e.g. "Authentication Successful") */
  title: string;
};

/**
 * Authentication hook return type combining status information and available scenarios.
 * Returns a tuple with current state and methods to control the biometric setup flow.
 */
type UseBiometricsSetup = BiometricsStep &
  BiometricsInfo &
  BiometricsStatusMessage & {
    /** Sets up biometrics by generating keys and registering with backend */
    register: Register;

    /** Clears biometric configuration by removing stored keys */
    revoke: () => Promise<BiometricsStatus<boolean>>;

    /** Completes current request and updates UI state accordingly */
    cancel: () => BiometricsStatus<boolean>;
  };

/**
 * Represents the step of the biometric operation.
 */
type BiometricsStep = {
  /** Whether the recent step was successful */
  wasRecentStepSuccessful: boolean | undefined;

  /** The required factor for the next step */
  requiredFactorForNextStep: BiometricsFactor | undefined;

  /** Whether the request has been fulfilled */
  isRequestFulfilled: boolean;
};

type BiometricsPartialStatusConditional<omitStep> = omitStep extends false
  ? {
      /** The status of the biometric operation */
      step: BiometricsStep;
    }
  : object;

/**
 * Represents the core status information for biometric operations.
 * @template T - The type of the value of the biometric operation.
 * @template omitStep - Whether to omit the step from the partial status.
 */
type BiometricsPartialStatus<
  T,
  omitStep = false,
> = BiometricsPartialStatusConditional<omitStep> & {
  /**
   * The result value of the biometric operation.
   * Can be of various types depending on the operation, commonly boolean or string.
   */
  value: T;

  /**
   * Translation key explaining the current status or error condition.
   * Used to provide user feedback about what happened.
   */
  reason: TranslationPaths;

  /**
   * The numeric authentication type identifier from SecureStore.
   * Indicates which authentication method was used (e.g. biometric, passcode).
   */
  type?: ValueOf<typeof AUTH_TYPE>;
};

/**
 * Complete status object for biometric operations, extending the partial status.
 * Used to track and communicate the full state of biometric authentication/authorization,
 * including user-facing messages and authentication details.
 */
type BiometricsStatus<T, omitStatus = false> = BiometricsPartialStatus<
  T,
  omitStatus
> & {
  /** Human-readable name of the authentication method used */
  typeName?: string;

  /**
   * Formatted message combining status, reason, and authentication type
   * for displaying detailed feedback to users
   */
  message: string;

  /**
   * Concise status message suitable for headers or brief notifications
   * Examples: "Authorization Successful", "Authentication Failed"
   */
  title: string;
};

/** Valid biometric scenario types as defined in constants */
type BiometricsStatusKeyType = ValueOf<typeof CONST.BIOMETRICS.SCENARIO_TYPE>;

/** Names of supported authentication types */
type AuthTypeName = ValueOf<typeof CONST.BIOMETRICS.AUTH_TYPE>["NAME"];

/**
 * Function to update the biometrics status.
 * @param partialStatus - New status data or function to transform existing status
 * @returns Updated BiometricsStatus object
 */
type SetBiometricsStatus<T> = (
  partialStatus:
    | BiometricsPartialStatus<T>
    | ((prevStatus: BiometricsStatus<T>) => BiometricsStatus<T>),
) => BiometricsStatus<T>;

/** Valid type for the useBiometricsStatus hook */
type UseBiometricsStatus<T> = [BiometricsStatus<T>, SetBiometricsStatus<T>];

export type {
  BiometricsStatus,
  BiometricsStep,
  SetBiometricsStatus,
  BiometricsStatusKeyType,
  AuthTypeName,
  BiometricsPartialStatus,
  UseBiometricsStatus,
  UseBiometricsSetup,
  Register,
  BiometricsAuthorizationMethod,
  AuthorizeUsingFallback,
  UseBiometricsAuthorizationFallback,
  BiometricsAuthorization,
  UseBiometricsAuthorization,
  UseBiometrics,
  BiometricsRecentStatus,
  CreateBiometricsRecentStatus,
  BiometricsMethods,
  BiometricsState,
};
