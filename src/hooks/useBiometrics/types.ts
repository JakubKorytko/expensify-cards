import type { TranslationPaths } from "@src/languages/types";
import type { ValueOf } from "type-fest";

import { AUTH_TYPE } from "expo-secure-store";
import CONST from "@src/CONST";

/** Value returned by the useBiometrics hook. */
type Biometrics = {
  /**
   * Runs the biometrics process setup.
   *
   * If the biometrics are configured for the first time or get re-configured, a validateCode should be provided.
   *
   * The second parameter indicates whether the registration is chained with the authorization process.
   * Setting it to true will return private key saving status with the key value instead of the registration status.
   *
   * IMPORTANT: Using this method will display authentication prompt
   */
  register: (
    validateCode?: number,
    chainedWithAuthorization?: boolean,
  ) => Promise<BiometricsStatus<boolean | string>>;

  /**
   * Required authorization factors based on the current device biometrics status.
   * These needs to be provided when calling the authorize method.
   * If the factors include validateCode, it also applies to the register method.
   */
  requiredFactors: ValueOf<typeof CONST.BIOMETRICS.AUTH_FACTORS>[];

  /**
   * Main method to authorize a transaction using biometrics if available and configured,
   * or falling back to otp and magic code if not.
   * If biometrics is not configured, it will attempt to register it first.
   * If the registration is successful, it will attempt to authorize the transaction using biometrics right away.
   * You can check which factors are required by checking the requiredFactors property before calling this method.
   *
   * Note: If the device does not support biometrics, both validateCode and otp must be provided.
   * If the device supports biometrics, but it is not configured, validateCode must be provided.
   * If the device supports and is configured for biometrics, neither validateCode nor otp are needed.
   *
   * IMPORTANT: Using this method will display authentication prompt.
   */
  authorize: (config: {
    transactionID: string;
    validateCode?: number;
    otp?: number;
  }) => Promise<BiometricsStatus<boolean>>;

  /** Feedback on the performed actions. */
  feedback: Feedback;

  /** Whether the biometrics was set up correctly and the user is authenticated. */
  status: boolean;
};

/**
 * Latest status for both challenge and key related actions.
 * The message, value and title props are useful if we just want to display latest action result
 * and do not need to specify whether it was challenge or key related.
 */
type Feedback = {
  /** Latest challenge-related action status */
  challenge: BiometricsStatus<boolean>;

  /** Latest key-related action status */
  key: BiometricsStatus<boolean>;

  /** Latest action status message */
  message: string;

  /** Latest action status title */
  title: string;

  /** Was the latest action successful? */
  value: boolean;
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

export type { Feedback, Biometrics, BiometricsStatus };
