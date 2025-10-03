import { useCallback } from "react";
import type {
  BiometricsStatus,
  BiometricsStep,
} from "@hooks/useBiometrics/types";
import authorizeBiometricsAction, {
  verifyRequiredFactors,
} from "@libs/Biometrics/authorizeBiometricsAction";
import CONST from "@src/CONST";
import { useSingleBiometricsFeedback } from "@hooks/useBiometrics/useBiometricsFeedback";
import { requestValidateCodeAction } from "@libs/actions/User";

function useBiometricsAuthorizationFallback() {
  const [feedback, setFeedback] = useSingleBiometricsFeedback<
    BiometricsStep & {
      storedValidateCode: number | undefined;
    }
  >(
    {
      wasRecentStepSuccessful: undefined,
      requiredFactorForNextStep: undefined,
      isRequestFulfilled: true,
      storedValidateCode: undefined,
    },
    CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE,
    (feedbackValue) => !!feedbackValue.value.wasRecentStepSuccessful,
  );

  const verifyFactors = useCallback(
    ({ otp, validateCode }: { otp?: number; validateCode?: number }) => {
      const isValidateCodeVerified = !!feedback.value.storedValidateCode;

      return verifyRequiredFactors({
        otp,
        validateCode,
        requiredFactors:
          CONST.BIOMETRICS.DEVICE_STATUS_FACTORS_MAP.NOT_SUPPORTED.map(
            ({ id }) => id,
          ),
        isValidateCodeVerified,
      });
    },
    [feedback.value.storedValidateCode],
  );

  /**
   * Internal method to authorize transaction using otp and validate code.
   * This is used when biometrics is not available on the device.
   */
  const authorize = useCallback(
    ({
      otp,
      validateCode,
      transactionID,
    }: {
      transactionID: string;
      validateCode?: number;
      otp?: number;
    }): Promise<BiometricsStatus<BiometricsStep>> => {
      const providedOrStoredValidateCode =
        validateCode || feedback.value.storedValidateCode;

      const factorsCheckResult = verifyFactors({
        otp,
        validateCode: providedOrStoredValidateCode,
      });

      const { value: factorsCheckValue } = factorsCheckResult;

      if (factorsCheckValue !== true) {
        if (factorsCheckValue === CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE) {
          requestValidateCodeAction();
        }

        return Promise.resolve(
          setFeedback((prevFeedback) => ({
            ...prevFeedback,
            value: {
              ...prevFeedback.value,
              requiredFactorForNextStep: factorsCheckValue,
              wasRecentStepSuccessful: false,
              isRequestFulfilled: false,
            },
            reason: factorsCheckResult.reason,
          })),
        );
      }

      const isValidateCodeVerified = !!feedback.value.storedValidateCode;

      return authorizeBiometricsAction(
        CONST.BIOMETRICS.DEVICE_BIOMETRICS_STATUS.NOT_SUPPORTED,
        transactionID,
        {
          validateCode: providedOrStoredValidateCode!,
          otp,
        },
        isValidateCodeVerified,
      )
        .then((result) => {
          const { successful, isOTPRequired } = result.value;

          const shouldStoreValidateCode =
            validateCode && isOTPRequired && successful;

          let reason = result.reason;

          if (result.reason === "biometrics.apiResponse.unableToAuthorize") {
            if (!!otp && !!providedOrStoredValidateCode) {
              reason = "biometrics.apiResponse.otpCodeInvalid";
            } else if (!otp && !!providedOrStoredValidateCode) {
              reason = "biometrics.apiResponse.validationCodeInvalid";
            }
          }

          // // const areParametersBad =
          // //
          // // const isOTPCodeReason =
          //
          // const isValidateCodeReason =
          //    && areParametersBad;

          console.log(result);

          return setFeedback({
            ...result,
            value: {
              requiredFactorForNextStep: isOTPRequired
                ? CONST.BIOMETRICS.AUTH_FACTORS.OTP
                : undefined,
              wasRecentStepSuccessful: successful,
              isRequestFulfilled: !successful || !isOTPRequired,
              storedValidateCode: shouldStoreValidateCode
                ? validateCode
                : undefined,
            },
            reason,
            // value: isOTPRequired
            //   ? CONST.BIOMETRICS.AUTH_FACTORS.OTP
            //   : !wasValidateCodeInvalid,
          });
        })
        .then((result) => {
          return setFeedback(result);
        });
    },
    [feedback.value.storedValidateCode, setFeedback, verifyFactors],
  );

  const fulfill = useCallback(() => {
    return setFeedback((prevFeedback) => ({
      ...prevFeedback,
      value: {
        isRequestFulfilled: true,
        requiredFactorForNextStep: undefined,
        wasRecentStepSuccessful:
          !prevFeedback.value.requiredFactorForNextStep &&
          prevFeedback.value.wasRecentStepSuccessful,
        storedValidateCode: undefined,
      },
    }));
  }, [setFeedback]);

  return { feedback, authorize, fulfill } as const;
}

export default useBiometricsAuthorizationFallback;
