import { useCallback } from "react";
import authorizeBiometricsAction from "@libs/Biometrics/authorizeBiometricsAction";
import CONST from "@src/CONST";
import { verifyRequiredFactors } from "./helpers";
import useBiometricsStatus from "../useBiometricsStatus";
import { requestValidateCodeAction } from "@libs/actions/User";
import { AutorizeUsingFallback, UseBiometricsAuthorizationFallback } from "./types";

/**
 * Hook that provides fallback authorization flow when biometrics is not available.
 * Uses validate code and OTP for transaction authorization instead.
 */
function useBiometricsAuthorizationFallback(): UseBiometricsAuthorizationFallback {
  const [status, setStatus] = useBiometricsStatus<number | undefined>(
    undefined,
    CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE,
  );

  /**
   * Verifies that all required authentication factors are provided.
   * Checks both OTP and validate code against the requirements for non-biometric devices.
   */
  const verifyFactors = useCallback(
    ({ otp, validateCode }: { otp?: number; validateCode?: number }) => (
      verifyRequiredFactors({
        otp,
        validateCode,
        requiredFactors: CONST.BIOMETRICS.DEVICE_STATUS_FACTORS_MAP.NOT_SUPPORTED.map(
          ({ id }) => id
        ),
        isValidateCodeVerified: !!status.value,
      })
    ),
    [status.value],
  );

  /**
   * Authorizes a transaction using OTP and validate code when biometrics is unavailable.
   * Handles the multi-step verification process, requesting additional factors when needed.
   * Updates status to reflect the current state of authorization and any required next steps.
   */
  const authorize: AutorizeUsingFallback = useCallback(
    async ({
      otp,
      validateCode,
      transactionID,
    }) => {
      const providedOrStoredValidateCode = validateCode || status.value;
      const { value: factorsCheckValue, reason: factorsCheckReason } = verifyFactors({
        otp,
        validateCode: providedOrStoredValidateCode,
      });

      if (factorsCheckValue !== true) {
        if (factorsCheckValue === CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE) {
          requestValidateCodeAction();
        }

        return setStatus(prevStatus => ({
          ...prevStatus,
          status: {
            requiredFactorForNextStep: factorsCheckValue,
            wasRecentStepSuccessful: false,
            isRequestFulfilled: false,
          },
          reason: factorsCheckReason,
        }));
      }

      const result = await authorizeBiometricsAction(
        CONST.BIOMETRICS.DEVICE_BIOMETRICS_STATUS.NOT_SUPPORTED,
        transactionID,
        {
          validateCode: providedOrStoredValidateCode!,
          otp,
        },
        !!status.value
      );

      const { successful, isOTPRequired } = result.value;
      
      let reason = result.reason;

      if (result.reason !== "biometrics.apiResponse.unableToAuthorize") {
        reason = result.reason;
      } else if (!!otp && !!providedOrStoredValidateCode) {
        reason = "biometrics.apiResponse.otpCodeInvalid";
      } else if (!otp && !!providedOrStoredValidateCode) {
        reason = "biometrics.apiResponse.validationCodeInvalid";
      }

      return setStatus({
        ...result,
        value: validateCode && isOTPRequired && successful ? validateCode : undefined,
        status: {
          requiredFactorForNextStep: isOTPRequired ? CONST.BIOMETRICS.AUTH_FACTORS.OTP : undefined,
          wasRecentStepSuccessful: successful,
          isRequestFulfilled: !successful || !isOTPRequired,
        },
        reason,
      });
    },
    [status.value, setStatus, verifyFactors],
  );

  /**
   * Marks the current authorization request as fulfilled and resets the validate code.
   * Used when completing or canceling an authorization flow.
   */
  const fulfill = useCallback(() => (
    setStatus(prevStatus => ({
      ...prevStatus,
      value: undefined,
      status: {
        isRequestFulfilled: true,
        requiredFactorForNextStep: undefined,
        wasRecentStepSuccessful:
          !prevStatus.status.requiredFactorForNextStep &&
          prevStatus.status.wasRecentStepSuccessful,
      },
    }))
  ), [setStatus]);

  return { status, authorize, fulfill }
}

export default useBiometricsAuthorizationFallback;
