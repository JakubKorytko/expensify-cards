import type { TranslationPaths } from "@src/languages/types";
import type { ValueOf } from "type-fest";

import { AUTH_TYPE } from "expo-secure-store";

/** Value returned by the useBiometrics hook. */
type Biometrics = {
  /**
   * Runs the biometrics process setup.
   *
   * IMPORTANT: Using this method will display authentication prompt
   */
  request: () => Promise<BiometricsStatus<boolean>>;

  /**
   * Method to request, sign and verify biometrics challenge
   *
   * IMPORTANT: Using this method will display authentication prompt
   */
  challenge: (transactionID: string) => Promise<BiometricsStatus<boolean>>;

  /**
   * Method to run the appropriate process.
   * If the biometrics are configured, it runs the challenge.
   * If not, it runs the setup and after that (if successful) it runs the challenge process.
   *
   * If you prefer not to run the challenge process immediately after biometrics setup,
   * you can set the second parameter to true.
   *
   * IMPORTANT: Using this method will display authentication prompt twice if the biometrics is not configured.
   */
  prompt: (
    transactionID: string,
    disableAutoRun?: boolean,
  ) => Promise<BiometricsStatus<boolean>>;

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
