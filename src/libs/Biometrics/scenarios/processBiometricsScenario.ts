import {
  BiometricsScenario,
  BiometricsScenarioParams,
  BiometricsScenarioResponseWithSuccess,
  BiometricsFallbackScenarioParams,
  BiometricsFallbackScenario,
  AllBiometricsFactors,
  BiometricsScenarioMap,
} from "@libs/Biometrics/scenarios/types";
import { BiometricsPartialStatus } from "@hooks/useMultiAuthentication/types";
import { BIOMETRICS_SCENARIOS } from "@libs/Biometrics/scenarios";
import CONST from "@src/CONST";

/**
 * Validates that all required authentication factors are present and of the correct type/format.
 * Checks each factor's presence, type, and length requirements.
 * Skips OTP validation if the validation code hasn't been verified yet.
 */
function areBiometricsFactorsSufficient(
  factors: Partial<AllBiometricsFactors>,
  isStoredFactorVerified = true,
  biometrics: boolean = false,
): BiometricsPartialStatus<true | string> {
  const requiredFactors = CONST.BIOMETRICS.FACTOR_COMBINATIONS[
    biometrics ? "BIOMETRICS" : "TWO_FACTOR"
  ].map((id) => CONST.BIOMETRICS.FACTORS_REQUIREMENTS[id]);

  for (const { id, parameter, name, type, length } of requiredFactors) {
    if (
      id !== CONST.BIOMETRICS.FACTORS.VALIDATE_CODE &&
      !isStoredFactorVerified
    ) {
      continue;
    }

    const unsuccessfulStep = {
      requiredFactorForNextStep: id,
      wasRecentStepSuccessful: false,
      isRequestFulfilled: false,
    };

    if (!(parameter in factors)) {
      return {
        value: `Missing required factor: ${name} (${parameter})`,
        step: unsuccessfulStep,
        reason: "biometrics.reason.generic.authFactorsError",
      };
    }

    const value = factors[parameter as keyof Partial<AllBiometricsFactors>];

    if (typeof value !== typeof type) {
      return {
        value: `Invalid type for factor: ${name} (${parameter}). Expected ${typeof type}, got ${typeof value}`,
        step: unsuccessfulStep,
        reason: "biometrics.reason.generic.authFactorsError",
      };
    }

    if (typeof length === "number" && String(value).length !== length) {
      return {
        value: `Invalid length for factor: ${name} (${parameter}). Expected length ${length}, got length ${String(value).length}`,
        step: unsuccessfulStep,
        reason: "biometrics.reason.generic.authFactorsError",
      };
    }
  }

  return {
    value: true,
    step: {
      requiredFactorForNextStep: undefined,
      wasRecentStepSuccessful: undefined,
      isRequestFulfilled: false,
    },
    reason: "biometrics.reason.generic.authFactorsSufficient",
  };
}

/**
 * Handles the post-processing of an authorization attempt when biometrics is not available.
 * Takes the authorization result and request parameters and determines:
 * - If an OTP (one-time password) is required based on the HTTP response code
 * - The appropriate error message to display based on which codes were invalid
 * - Whether to store the validation code for future use
 * - The next required authentication factor (OTP if needed)
 * - Whether the overall request was successful and is now complete
 */
const authorizeBiometricsPostMethodFallback = <
  T extends BiometricsFallbackScenario,
>(
  status: BiometricsPartialStatus<BiometricsScenarioResponseWithSuccess, true>,
  params: BiometricsFallbackScenarioParams<T>,
) => {
  const { successful, httpCode } = status.value;
  const { otp, validateCode } = params;

  const isOTPRequired =
    httpCode === CONST.BIOMETRICS.NEED_SECOND_FACTOR_HTTP_CODE;

  let reason = status.reason;

  if (status.reason !== "biometrics.apiResponse.unableToAuthorize") {
    reason = status.reason;
  } else if (!!otp && !!validateCode) {
    reason = "biometrics.apiResponse.otpCodeInvalid";
  } else if (!otp && !!validateCode) {
    reason = "biometrics.apiResponse.validationCodeInvalid";
  }

  return {
    ...status,
    value:
      validateCode && isOTPRequired && successful ? validateCode : undefined,
    step: {
      requiredFactorForNextStep: isOTPRequired
        ? CONST.BIOMETRICS.FACTORS.OTP
        : undefined,
      wasRecentStepSuccessful: successful,
      isRequestFulfilled: !successful || !isOTPRequired,
    },
    reason,
  };
};

/**
 * Main authorization function that handles different biometric scenarios.
 * First validates that all required factors are present and valid.
 * Then sends the authorization request to the server.
 * Finally, post-processes the result based on the scenario type.
 * Returns a status object containing the authorization result and any additional information needed.
 */
async function processBiometricsScenario<T extends BiometricsScenario>(
  scenario: T,
  params: BiometricsScenarioParams<T>,
  isStoredFactorVerified?: boolean,
  biometrics: boolean = false,
): Promise<BiometricsPartialStatus<number | undefined>> {
  const factorsCheckResult = areBiometricsFactorsSufficient(
    params,
    isStoredFactorVerified,
    biometrics,
  );

  const currentScenario = BIOMETRICS_SCENARIOS[
    scenario
  ] as BiometricsScenarioMap[T];

  if (factorsCheckResult.value !== true) {
    return authorizeBiometricsPostMethodFallback(
      {
        ...factorsCheckResult,
        value: { httpCode: undefined, successful: false },
      },
      params,
    );
  }

  const { httpCode, reason } = await currentScenario.action(params);

  return authorizeBiometricsPostMethodFallback(
    {
      value: {
        successful: String(httpCode).startsWith("2"),
        httpCode,
      },
      reason,
    },
    params,
  );
}

export default processBiometricsScenario;
export { areBiometricsFactorsSufficient };
