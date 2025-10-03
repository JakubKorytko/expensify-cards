import type { ValueOf } from "type-fest";
import { TranslationPaths } from "@src/languages/types";
import { AUTH_TYPE } from "expo-secure-store";
import CONST from "@src/CONST";

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
  message: string;

  /** Same as message, but in a form of a simple title i.e. Authorization/authentication successful/failed */
  title: string;
};

type BiometricsPartialStatus<T> = {
  /** It may be whatever function returns, but most of the time it is string or boolean */
  value: T;

  /** Why the object has this value? Was there any error? If not, what is the current status? */
  reason: TranslationPaths;

  /** Authentication type numeric value returned from the SecureStore */
  type?: ValueOf<typeof AUTH_TYPE>;
};

type BiometricsStatusKeyType = ValueOf<typeof CONST.BIOMETRICS.ACTION_TYPE>;

type AuthTypeName = ValueOf<typeof CONST.BIOMETRICS.AUTH_TYPE>["NAME"];

type SetBiometricsStatus<T> = (
  authData:
    | BiometricsPartialStatus<T>
    | ((prevStatus: BiometricsStatus<T>) => BiometricsStatus<T>),
) => BiometricsStatus<T>;

export type {
  BiometricsStatus,
  SetBiometricsStatus,
  BiometricsStatusKeyType,
  AuthTypeName,
  BiometricsPartialStatus,
};
