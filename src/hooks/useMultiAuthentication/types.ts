import type { ValueOf } from "type-fest";
import { TranslationPaths } from "@src/languages/types";
import { AUTH_TYPE } from "expo-secure-store";
import CONST from "@src/CONST";
import {
  MultifactorAuthorizationFallbackScenario,
  MultifactorAuthorizationFallbackScenarioParams,
  MultifactorAuthenticationFactor,
} from "@libs/MultifactorAuthentication/scenarios/types";

/**
 * Represents the most recent multifactorial authentication status and method to cancel it
 */
type MultifactorAuthenticationRecentStatus = {
  status: MultifactorAuthenticationStatus<boolean>;
  cancel: () => MultifactorAuthenticationStatus<unknown>;
};

/**
 * Parameters required for multifactorial authentication authorization
 */
type AuthorizationParams = {
  otp?: number;
  validateCode?: number;
  transactionID: string;
};

/**
 * Function type for performing multifactorial authentication authorization
 */
type MultifactorAuthorizationMethod = (
  params: AuthorizationParams,
) => Promise<MultifactorAuthenticationStatus<boolean>>;

/**
 * Available multifactorial authentication scenarios including registration, authorization, reset and cancel
 */
type MultifactorAuthenticationMethods = {
  register: Register;
  authorize: MultifactorAuthorization;
  resetSetup: () => Promise<MultifactorAuthenticationStatus<boolean>>;
  cancel: () => MultifactorAuthenticationStatus<boolean>;
};

/**
 * Current state of multifactorial authentication including status and configuration state
 */
type MultifactorAuthenticationState =
  MultifactorAuthenticationStatus<boolean> & {
    isBiometryConfigured: boolean;
  };

/**
 * Hook return type containing multifactorial authentication state and available scenarios
 */
type UseMultifactorAuthentication = [
  MultifactorAuthenticationState,
  MultifactorAuthenticationMethods,
];

/**
 * Factory function type for creating a MultifactorAuthenticationRecentStatus object
 */
type CreateMultifactorAuthenticationRecentStatus = (
  result: MultifactorAuthenticationStatus<unknown>,
  cancel: () => MultifactorAuthenticationStatus<unknown>,
) => MultifactorAuthenticationRecentStatus;

/**
 * Function that handles multifactorial authentication authorization of transactions.
 * Takes a transaction ID, optional validate code, and optional chained private key status.
 * Returns a promise resolving to the authorization status.
 */
type MultifactorAuthorization = (params: {
  transactionID: string;
  validateCode?: number;
  chainedPrivateKeyStatus?: MultifactorAuthenticationStatus<string | null>;
}) => Promise<MultifactorAuthenticationStatus<boolean>>;

/**
 * Hook return type for multifactorial authentication transaction authorization.
 * Provides current authorization status, authorize function to initiate authorization,
 * and cancel function to cancel the current authorization flow.
 */
type UseMultifactorAuthorization = {
  status: MultifactorAuthenticationStatus<boolean>;
  authorize: MultifactorAuthorization;
  cancel: () => MultifactorAuthenticationStatus<boolean>;
};

/**
 * Function type for authorizing transactions when multifactorial authentication is not available.
 * Uses provided factors as alternative authentication factors.
 * Returns a status containing the first verified factor.
 */
type AuthorizeUsingFallback<
  T extends MultifactorAuthorizationFallbackScenario,
> = (
  params: MultifactorAuthorizationFallbackScenarioParams<T>,
) => Promise<MultifactorAuthenticationStatus<number | undefined>>;

/**
 * Hook return type for multifactorial authentication fallback authorization.
 * Provides status tracking, authorization function, and request canceling.
 * Status tracks the current verified factor and authorization state.
 */
type UseMultifactorAuthorizationFallback<
  T extends MultifactorAuthorizationFallbackScenario,
> = MultifactorAuthenticationStatusMessage &
  MultifactorAuthenticationStep & {
    authorize: AuthorizeUsingFallback<T>;
    cancel: () => MultifactorAuthenticationStatus<number | undefined>;
  };

/**
 * Base type for the register function that handles multifactorial authentication setup.
 * Takes a validate code and additional params, returns a MultifactorAuthenticationStatus.
 */
type RegisterFunction<T, R> = (
  params: { validateCode?: number } & T,
) => Promise<MultifactorAuthenticationStatus<R>>;

/**
 * Function to register multifactorial authentication on the device.
 * Returns different status types based on whether authorization is chained:
 * - With chained=true: Returns a string status for the next authorization step
 * - With chained=false: Returns a boolean indicating registration success
 * - With chained unspecified: Returns either boolean or string based on flow
 */
type Register = RegisterFunction<{ chainedWithAuthorization: true }, string> &
  RegisterFunction<{ chainedWithAuthorization?: false }, boolean> &
  RegisterFunction<{ chainedWithAuthorization?: boolean }, boolean | string>;

/**
 * Information about the device's multifactorial authentication capabilities and configuration state
 */
type MultifactorAuthenticationInfo = {
  /** Whether the device supports biometric authentication (fingerprint/face) or fallback (PIN/pattern) */
  deviceSupportBiometrics: boolean;

  /** Whether biometrics is already set up with a stored public key */
  isBiometryConfigured: boolean;
};

/**
 * User-facing status messages for the current multifactorial authentication state
 */
type MultifactorAuthenticationStatusMessage = {
  /** Detailed message explaining the current state or required scenario */
  message: string;

  /** Brief status header (e.g. "Authentication Successful") */
  title: string;
};

/**
 * Authentication hook return type combining status information and available scenarios.
 * Returns a tuple with current state and methods to control the multifactorial authentication setup flow.
 */
type UseBiometricsSetup = MultifactorAuthenticationStep &
  MultifactorAuthenticationInfo &
  MultifactorAuthenticationStatusMessage & {
    /** Sets up multifactorial authentication by generating keys and registering with backend */
    register: Register;

    /** Clears multifactorial authentication configuration by removing stored keys */
    revoke: () => Promise<MultifactorAuthenticationStatus<boolean>>;

    /** Completes current request and updates UI state accordingly */
    cancel: () => MultifactorAuthenticationStatus<boolean>;
  };

/**
 * Represents the step of the multifactorial authentication operation.
 */
type MultifactorAuthenticationStep = {
  /** Whether the recent step was successful */
  wasRecentStepSuccessful: boolean | undefined;

  /** The required factor for the next step */
  requiredFactorForNextStep: MultifactorAuthenticationFactor | undefined;

  /** Whether the request has been fulfilled */
  isRequestFulfilled: boolean;
};

type MultifactorAuthenticationPartialStatusConditional<omitStep> =
  omitStep extends false
    ? {
        /** The status of the multifactorial authentication operation */
        step: MultifactorAuthenticationStep;
      }
    : object;

/**
 * Represents the core status information for multifactorial authentication operations.
 * @template T - The type of the value of the multifactorial authentication operation.
 * @template omitStep - Whether to omit the step from the partial status.
 */
type MultifactorAuthenticationPartialStatus<
  T,
  omitStep = false,
> = MultifactorAuthenticationPartialStatusConditional<omitStep> & {
  /**
   * The result value of the multifactorial authentication operation.
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
   * Indicates which authentication method was used (e.g. multifactorial authentication, passcode).
   */
  type?: ValueOf<typeof AUTH_TYPE>;
};

/**
 * Complete status object for multifactorial authentication operations, extending the partial status.
 * Used to track and communicate the full state of multifactorial authentication/authorization,
 * including user-facing messages and authentication details.
 */
type MultifactorAuthenticationStatus<
  T,
  omitStatus = false,
> = MultifactorAuthenticationPartialStatus<T, omitStatus> & {
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

/** Valid multifactorial authentication scenario types as defined in constants */
type MultifactorAuthenticationStatusKeyType = ValueOf<
  typeof CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE
>;

/** Names of supported authentication types */
type AuthTypeName = ValueOf<
  typeof CONST.MULTI_FACTOR_AUTHENTICATION.AUTH_TYPE
>["NAME"];

/**
 * Function to update the multifactorial authentication status.
 * @param partialStatus - New status data or function to transform existing status
 * @returns Updated MultifactorAuthenticationStatus object
 */
type SetMultifactorAuthenticationStatus<T> = (
  partialStatus:
    | MultifactorAuthenticationPartialStatus<T>
    | ((
        prevStatus: MultifactorAuthenticationStatus<T>,
      ) => MultifactorAuthenticationStatus<T>),
) => MultifactorAuthenticationStatus<T>;

/** Valid type for the useMultifactorAuthenticationStatus hook */
type UseMultifactorAuthenticationStatus<T> = [
  MultifactorAuthenticationStatus<T>,
  SetMultifactorAuthenticationStatus<T>,
];

export type {
  MultifactorAuthenticationStatus,
  MultifactorAuthenticationStep,
  SetMultifactorAuthenticationStatus,
  MultifactorAuthenticationStatusKeyType,
  AuthTypeName,
  MultifactorAuthenticationPartialStatus,
  UseMultifactorAuthenticationStatus,
  UseBiometricsSetup,
  Register,
  MultifactorAuthorizationMethod,
  AuthorizeUsingFallback,
  UseMultifactorAuthorizationFallback,
  MultifactorAuthorization,
  UseMultifactorAuthentication,
  UseMultifactorAuthorization,
  MultifactorAuthenticationRecentStatus,
  CreateMultifactorAuthenticationRecentStatus,
  MultifactorAuthenticationMethods,
  MultifactorAuthenticationState,
};
