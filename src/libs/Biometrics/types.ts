import { ValueOf } from "type-fest";
import CONST from "@src/CONST";
import { TranslationPaths } from "@src/languages/types";
import biometricsActions, {
  BiometricsActionParameters,
} from "@libs/Biometrics/biometricsActions";
import { BiometricsPartialStatus } from "@hooks/useBiometricsStatus/types";

/**
 * The type of biometric action being performed, like authorizing a transaction or setting up biometrics.
 * Derived from the BIOMETRICS.ACTION constant.
 */
type BiometricsAction = ValueOf<typeof CONST.BIOMETRICS.ACTION>;
type BiometricsFallbackAction = keyof BiometricsFallbackActions;

/**
 * A single authentication factor used in biometric flows, like a signature or validation code.
 * Derived from the BIOMETRICS.FACTORS constant.
 */
type BiometricsFactor = ValueOf<typeof CONST.BIOMETRICS.FACTORS>;
type BiometricsFallbackFactor =
  BiometricsFallbackActions[BiometricsFallbackAction][number]["id"];

/**
 * Maps authentication factors required for a specific biometric action.
 * Creates an object type where each key is a required parameter (like signedChallenge or validateCode)
 * and the value is the corresponding type for that parameter.
 * Optional parameters will be marked with a question mark.
 * 
 * Example for AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE:
 * {
 *   signedChallenge: string;
 *   validateCode: number;
 * }
 */
type BiometricsFactors<T extends BiometricsAction> = CompleteMap<
  (typeof CONST.BIOMETRICS.ACTION_FACTORS_MAP)[T]
>;

/**
 * Represents an array of parameters and their types.
 * Each item contains a parameter name and its expected type.
 */
type ParameterAndTypeArray = readonly {
  parameter: string;
  type: unknown;
}[];

/**
 * Creates a type containing only the required parameters from a parameter array.
 * Excludes any parameters marked as optional.
 */
type RequiredMap<F extends ParameterAndTypeArray> = {
  [K in F[number] as K extends { optional: true }
    ? never
    : K["parameter"]]: K["type"];
};

/**
 * Creates a type containing only the optional parameters from a parameter array.
 * All properties will be marked with a question mark.
 */
type OptionalMap<F extends ParameterAndTypeArray> = {
  [K in F[number] as K extends { optional: true }
    ? K["parameter"]
    : never]?: K["type"];
};

/**
 * Helper type that flattens complex types into a simpler object type.
 */
type Simplify<T> = { [K in keyof T]: T[K] };

/**
 * Combines required and optional parameters into a single type.
 * The result is a flattened object type with proper optional properties.
 */
type CompleteMap<T extends ParameterAndTypeArray> = Simplify<
  RequiredMap<T> & OptionalMap<T>
>;

/**
 * Maps the required factors for a fallback authentication flow.
 */
type BiometricsFallbackFactors<T extends BiometricsFallbackAction> =
  CompleteMap<BiometricsFallbackActions[T]>;

/**
 * The response format from biometric authentication attempts.
 * Contains an HTTP status code and a translation key for the response message.
 */
type BiometricsActionResponse = { httpCode: number; reason: TranslationPaths };

/**
 * Parameters required for a biometric action.
 * Combines the action-specific factors with any additional parameters.
 * Can optionally include a flag indicating if stored factors were verified.
 */
type BiometricsActionParams<
  T extends BiometricsAction,
  withStoredFactor extends boolean = false,
> = Simplify<
  BiometricsFactors<T> &
    BiometricsActionParameters[T] &
    (withStoredFactor extends true
      ? { isStoredFactorVerified?: boolean }
      : object)
>;

/**
 * Parameters required for a fallback authentication flow.
 */
type BiometricsFallbackActionParams<T extends BiometricsFallbackAction> =
  BiometricsFallbackFactors<T> & BiometricsActionParameters[T];

/**
 * Helper type that extracts fallback authentication factors from an action's requirements.
 */
type BiometricsTupleUnion<T extends BiometricsAction> =
  (typeof CONST.BIOMETRICS.ACTION_FACTORS_MAP)[T][number]["origin"] extends typeof CONST.BIOMETRICS.FACTORS_ORIGIN.FALLBACK
    ? (typeof CONST.BIOMETRICS.ACTION_FACTORS_MAP)[T]
    : never;

/**
 * Maps biometric actions to their fallback authentication requirements.
 * Only includes actions that have fallback flows defined.
 */
type BiometricsFallbackActions = {
  [K in BiometricsAction as BiometricsTupleUnion<K> extends never
    ? never
    : K]: BiometricsTupleUnion<K>;
};

/**
 * Function signature for methods that handle biometric actions.
 * Takes action-specific parameters and returns a promise with the authentication response.
 */
type BiometricsActionMethod<key extends BiometricsAction> = (
  params: BiometricsActionParams<key>,
) => Promise<BiometricsActionResponse>;

/**
 * Requirements for a specific biometric factor, like length or type constraints.
 */
type BiometricsFactorsRequirements<T extends BiometricsFactor> =
  (typeof CONST.BIOMETRICS.FACTORS_REQUIREMENTS)[T];

/**
 * Helper type that extracts the parameter name from a factor's requirements.
 */
type xd<T extends BiometricsFactor> =
  BiometricsFactorsRequirements<T>["parameter"];

/**
 * Maps a biometric factor to its corresponding parameter type for a given action.
 */
type BiometricsFactorToParameter<
  T extends BiometricsFactor,
  R extends BiometricsAction,
> =
  xd<T> extends keyof BiometricsFactors<R>
    ? BiometricsFactors<R>[xd<T>]
    : never;

/**
 * The type of value that can be stored for a biometric action.
 * Only defined for actions that specify a factor to store.
 */
type StoredValueType<T extends BiometricsAction> =
  (typeof biometricsActions)[T] extends {
    factorToStore: infer U extends BiometricsFactor;
  }
    ? BiometricsFactorToParameter<U, T> | undefined
    : undefined;

/**
 * Function signature for methods that handle post-action processing.
 * Takes the action result and original parameters and returns an updated status.
 */
type BiometricsPostActionMethod<key extends BiometricsAction> = (
  params: BiometricsPartialStatus<
    { httpCode: number | undefined; successful: boolean },
    true
  >,
  requestParams: BiometricsActionParams<key>,
) => BiometricsPartialStatus<StoredValueType<key>>;

/**
 * Configuration for each biometric action.
 * Specifies the main action method, optional post-processing, and any factors to store.
 */
type BiometricsActionMap = {
  [key in BiometricsAction]: {
    actionMethod: BiometricsActionMethod<key>;
    postActionMethod?: BiometricsPostActionMethod<key>;
    factorToStore?: BiometricsFactor;
  };
};

/**
 * Helper type to extract the post-action method for a specific biometric action.
 */
type BiometricsPostAction<T extends BiometricsAction> =
  BiometricsActionMap[T]["postActionMethod"];

export type {
  BiometricsAction,
  BiometricsActionResponse,
  BiometricsFactors,
  BiometricsFactor,
  BiometricsActionParams,
  BiometricsFallbackAction,
  BiometricsFallbackActionParams,
  BiometricsFallbackFactors,
  BiometricsPostAction,
  StoredValueType,
  BiometricsActionMap,
  BiometricsFallbackFactor,
  BiometricsFallbackActions,
  BiometricsPostActionMethod,
};
