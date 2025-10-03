import type { TranslationPaths } from "@src/languages/types";
import type { ValueOf } from "type-fest";
import { AUTH_TYPE } from "expo-secure-store";
import CONST from "@src/CONST";
import { BiometricsAuthFactor } from "@libs/Biometrics/types";

type BiometricsAuthenticationParams = {
  validateCode?: number;
  transactionID?: string;
  otp?: number;
};

type BiometricsAuthorizationParams = {
  otp?: number;
  validateCode?: number;
  transactionID: string;
};

type BiometricsStep = {
  wasRecentStepSuccessful: boolean | undefined;
  requiredFactorForNextStep: BiometricsAuthFactor | undefined;
  isRequestFulfilled: boolean;
};

type BiometricsStepWithStatus = BiometricsStep & {
  isBiometryConfigured: boolean;
};

/** Value returned by the useBiometrics hook. */
type Biometrics = [
  BiometricsStepWithStatus & BiometricsStatus<BiometricsStep>,
  (
    params: BiometricsAuthorizationParams,
  ) => Promise<BiometricsStatus<BiometricsStep>>,
  () => void,
  () => void,
];

/**
 * Latest status for both challenge and key related actions.
 * The message, value and title props are useful if we just want to display latest action result
 * and do not need to specify whether it was challenge or key related.
 */
type Feedback<T> = {
  /** Latest challenge-related action status */
  challenge: BiometricsStatus<T>;

  /** Latest key-related action status */
  key: BiometricsStatus<T>;

  /** Latest action status message */
  message: string;

  /** Latest action status title */
  title: string;

  /** Was the latest action successful? */
  value: T;
};

type SingleFeedback<T> = BiometricsStatus<T> & {
  message: string;
  title: string;
};

/**
 * It is important for both the user and us to be able to investigate the status of authentication,
 * errors and general feedback if necessary. This is achieved by ensuring that every nested function and step
 * in the biometrics logic returns an object containing not only the value, but also all the information
 * we can obtain about the current status. This will allow the status to be passed up to the hook return value.
 */
type BiometricsStatus<T> = {
  /** It may be whatever function returns, but most of the time it is string or boolean */
  value: T;

  /** Why the object has this value? Was there any error? If not, what is the current status? */
  reason: TranslationPaths;

  /** Authentication type numeric value returned from the SecureStore */
  type?: ValueOf<typeof AUTH_TYPE>;

  /** Name of the authentication type */
  typeName?: string;

  /** Final message to display, combination of pre-defined text, translated reason and/or auth type name */
  message?: string;

  /** Same as message, but in a form of a simple title i.e. Authorization/authentication successful/failed */
  title?: string;
};

type FeedbackKeyType = ValueOf<typeof CONST.BIOMETRICS.ACTION_TYPE>;

type SetFeedback<T> = (
  authData:
    | BiometricsStatus<T>
    | ((prevFeedback: BiometricsStatus<T>) => BiometricsStatus<T>),
  type: FeedbackKeyType,
) => BiometricsStatus<T>;

type SetSingleFeedback<T> = (
  authData:
    | BiometricsStatus<T>
    | ((prevFeedback: BiometricsStatus<T>) => BiometricsStatus<T>),
) => BiometricsStatus<T>;

export type {
  Feedback,
  SingleFeedback,
  SetFeedback,
  SetSingleFeedback,
  Biometrics,
  BiometricsStatus,
  BiometricsStep,
  BiometricsStepWithStatus,
  BiometricsAuthenticationParams,
  BiometricsAuthorizationParams,
};
