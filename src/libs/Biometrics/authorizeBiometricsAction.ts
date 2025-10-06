import CONST from "@src/CONST";
import {
  BiometricsFactors,
  BiometricsAction,
  BiometricsActionMapKey,
} from "@libs/Biometrics/types";
import { BiometricsPartialStatus } from "@hooks/useBiometricsStatus/types";
import biometricsActions, {
  BiometricsActionsAdditionalParameters,
} from "@libs/Biometrics/biometricsActions";

/**
 * Validates that all required authentication factors are present and of the correct type/format.
 * Checks each factor's presence, type, and length requirements.
 * Skips OTP validation if the validation code hasn't been verified yet.
 */
function areBiometricsFactorsSufficient<T extends BiometricsAction>(
  action: T,
  factors: BiometricsFactors<T>,
  isValidateCodeVerified: boolean = true,
): BiometricsPartialStatus<true | string, true> {
  const requiredFactors = CONST.BIOMETRICS.ACTION_FACTORS_MAP[action];

  for (const { id, parameter, name, type, length } of requiredFactors) {
    if (id === CONST.BIOMETRICS.FACTORS.OTP && !isValidateCodeVerified) {
      continue;
    }

    if (!(parameter in factors)) {
      return {
        value: `Missing required factor: ${name} (${parameter})`,
        reason: "biometrics.reason.generic.authFactorsError",
      };
    }

    const value = factors[parameter as keyof BiometricsFactors<T>];

    if (typeof value !== typeof type) {
      return {
        value: `Invalid type for factor: ${name} (${parameter}). Expected ${typeof type}, got ${typeof value}`,
        reason: "biometrics.reason.generic.authFactorsError",
      };
    }

    if (typeof length === "number" && String(value).length !== length) {
      return {
        value: `Invalid length for factor: ${name} (${parameter}). Expected length ${length}, got length ${String(value).length}`,
        reason: "biometrics.reason.generic.authFactorsError",
      };
    }
  }

  return {
    value: true,
    reason: "biometrics.reason.generic.authFactorsSufficient",
  };
}

/**
 * Main authorization function that handles the complete transaction flow.
 * First validates that all required factors are present and valid.
 * Then sends the authorization request to the server.
 * Returns whether the authorization was successful and if additional OTP verification is needed.
 */
async function authorizeBiometricsAction<T extends BiometricsActionMapKey>(
  action: T,
  params: BiometricsFactors<T> & BiometricsActionsAdditionalParameters[T],
): Promise<
  BiometricsPartialStatus<
    { httpCode: number | undefined; successful: boolean },
    true
  >
> {
  const isValidateCodeVerified =
    "isValidateCodeVerified" in params ? params.isValidateCodeVerified : true;

  const factorsCheckResult = areBiometricsFactorsSufficient(
    action,
    params,
    isValidateCodeVerified,
  );

  if (factorsCheckResult.value !== true) {
    return {
      ...factorsCheckResult,
      value: { successful: false, httpCode: undefined },
    };
  }

  const { httpCode, reason } = await biometricsActions[action]({
    ...params,
  });

  return {
    value: {
      successful: String(httpCode).startsWith("2"),
      httpCode,
    },
    reason,
  };
}

export default authorizeBiometricsAction;
