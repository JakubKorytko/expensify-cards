import {
  MultiFactorAuthenticationScenario,
  MultiFactorAuthenticationScenarioParams,
  MultiFactorAuthenticationScenarioResponseWithSuccess,
  MultiFactorAuthorizationFallbackScenarioParams,
  MultiFactorAuthorizationFallbackScenario,
  AllMultiFactorAuthenticationFactors,
  MultiFactorAuthenticationScenarioMap,
} from "@libs/MultiFactorAuthentication/scenarios/types";
import { MultiFactorAuthenticationPartialStatus } from "@hooks/useMultiAuthentication/types";
import { MULTI_FACTOR_AUTHENTICATION_SCENARIOS } from "@libs/MultiFactorAuthentication/scenarios";
import CONST from "@src/CONST";

/**
 * Validates that all required authentication factors are present and of the correct type/format.
 * Checks each factor's presence, type, and length requirements.
 * Skips OTP validation if the validation code hasn't been verified yet.
 */
function areMultiFactorAuthenticationFactorsSufficient(
  factors: Partial<AllMultiFactorAuthenticationFactors>,
  isStoredFactorVerified = true,
  multiFactorAuthentication: boolean = false,
): MultiFactorAuthenticationPartialStatus<true | string> {
  const requiredFactors = CONST.MULTI_FACTOR_AUTHENTICATION.FACTOR_COMBINATIONS[
    multiFactorAuthentication ? "MULTI_FACTOR_AUTHENTICATION" : "TWO_FACTOR"
  ].map((id) => CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS[id]);

  for (const { id, parameter, name, type, length } of requiredFactors) {
    if (
      id !== CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE &&
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
        reason: "multiFactorAuthentication.reason.generic.authFactorsError",
      };
    }

    const value =
      factors[parameter as keyof Partial<AllMultiFactorAuthenticationFactors>];

    if (typeof value !== typeof type) {
      return {
        value: `Invalid type for factor: ${name} (${parameter}). Expected ${typeof type}, got ${typeof value}`,
        step: unsuccessfulStep,
        reason: "multiFactorAuthentication.reason.generic.authFactorsError",
      };
    }

    if (typeof length === "number" && String(value).length !== length) {
      return {
        value: `Invalid length for factor: ${name} (${parameter}). Expected length ${length}, got length ${String(value).length}`,
        step: unsuccessfulStep,
        reason: "multiFactorAuthentication.reason.generic.authFactorsError",
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
    reason: "multiFactorAuthentication.reason.generic.authFactorsSufficient",
  };
}

/**
 * Handles the post-processing of an authorization attempt when multifactorial authentication is not available.
 * Takes the authorization result and request parameters and determines:
 * - If an OTP (one-time password) is required based on the HTTP response code
 * - The appropriate error message to display based on which codes were invalid
 * - Whether to store the validation code for future use
 * - The next required authentication factor (OTP if needed)
 * - Whether the overall request was successful and is now complete
 */
const authorizeMultiFactorAuthenticationPostMethodFallback = <
  T extends MultiFactorAuthorizationFallbackScenario,
>(
  status: MultiFactorAuthenticationPartialStatus<
    MultiFactorAuthenticationScenarioResponseWithSuccess,
    true
  >,
  params: MultiFactorAuthorizationFallbackScenarioParams<T>,
) => {
  const { successful, httpCode } = status.value;
  const { otp, validateCode } = params;

  const isOTPRequired =
    httpCode === CONST.MULTI_FACTOR_AUTHENTICATION.NEED_SECOND_FACTOR_HTTP_CODE;

  let reason = status.reason;

  if (
    status.reason !== "multiFactorAuthentication.apiResponse.unableToAuthorize"
  ) {
    reason = status.reason;
  } else if (!!otp && !!validateCode) {
    reason = "multiFactorAuthentication.apiResponse.otpCodeInvalid";
  } else if (!otp && !!validateCode) {
    reason = "multiFactorAuthentication.apiResponse.validationCodeInvalid";
  }

  return {
    ...status,
    value:
      validateCode && isOTPRequired && successful ? validateCode : undefined,
    step: {
      requiredFactorForNextStep: isOTPRequired
        ? CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.OTP
        : undefined,
      wasRecentStepSuccessful: successful,
      isRequestFulfilled: !successful || !isOTPRequired,
    },
    reason,
  };
};

/**
 * Main authorization function that handles different multifactorial authentication scenarios.
 * First validates that all required factors are present and valid.
 * Then sends the authorization request to the server.
 * Finally, post-processes the result based on the scenario type.
 * Returns a status object containing the authorization result and any additional information needed.
 */
async function processMultiFactorAuthenticationScenario<
  T extends MultiFactorAuthenticationScenario,
>(
  scenario: T,
  params: MultiFactorAuthenticationScenarioParams<T>,
  isStoredFactorVerified?: boolean,
  multiFactorAuthentication: boolean = false,
): Promise<MultiFactorAuthenticationPartialStatus<number | undefined>> {
  const factorsCheckResult = areMultiFactorAuthenticationFactorsSufficient(
    params,
    isStoredFactorVerified,
    multiFactorAuthentication,
  );

  const currentScenario = MULTI_FACTOR_AUTHENTICATION_SCENARIOS[
    scenario
  ] as MultiFactorAuthenticationScenarioMap[T];

  if (factorsCheckResult.value !== true) {
    return authorizeMultiFactorAuthenticationPostMethodFallback(
      {
        ...factorsCheckResult,
        value: { httpCode: undefined, successful: false },
      },
      params,
    );
  }

  const { httpCode, reason } = await currentScenario.action(params);

  return authorizeMultiFactorAuthenticationPostMethodFallback(
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

export default processMultiFactorAuthenticationScenario;
export { areMultiFactorAuthenticationFactorsSufficient };
