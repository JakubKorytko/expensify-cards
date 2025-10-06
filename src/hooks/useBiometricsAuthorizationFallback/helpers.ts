import CONST from "@src/CONST";
import { BiometricsAuthFactor } from "@libs/Biometrics/types";
import { BiometricsPartialStatus } from "@hooks/useBiometricsStatus/types";

/**
 * Checks if all required authentication factors are present.
 * Handles validation code and OTP requirements based on the current flow state.
 * Returns success if all required factors are present, otherwise returns which factor is missing.
 */
function verifyRequiredFactors({
    otp,
    validateCode,
    requiredFactors,
    isValidateCodeVerified,
  }: {
    otp?: number;
    validateCode?: number;
    requiredFactors: BiometricsAuthFactor[];
    isValidateCodeVerified: boolean;
  }): BiometricsPartialStatus<BiometricsAuthFactor | true, true> {
    const isValidateCodeRequired = requiredFactors.includes(
      CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE,
    );
    const isOtpRequired =
      requiredFactors.includes(CONST.BIOMETRICS.AUTH_FACTORS.OTP) &&
      (!isValidateCodeRequired || isValidateCodeVerified);
  
    /** Check that we have everything we need to proceed */
    if (isValidateCodeRequired && !validateCode) {
      return {
        value: CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE,
        reason: "biometrics.reason.error.validateCodeMissing",
      };
    }
  
    if (isOtpRequired && !otp) {
      return {
        value: CONST.BIOMETRICS.AUTH_FACTORS.OTP,
        reason: "biometrics.reason.error.otpMissing",
      };
    }
  
    return {
      value: true,
      reason: "biometrics.reason.generic.authFactorsSufficient",
    };
  }
  
export { verifyRequiredFactors }