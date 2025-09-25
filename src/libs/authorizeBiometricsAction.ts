import { BiometricsStatus } from "@hooks/useBiometrics/types";
import CONST from "@src/CONST";
import { authorizeTransaction } from "./actions/Biometrics";

const Factors = {
  SIGNED_CHALLENGE: {
    name: "Signed Challenge",
    parameter: "signedChallenge",
    type: String(),
    length: undefined,
  },
  SMS_OR_2FA_OTP: {
    name: "Two-Factor Authentication or SMS One-Time Password",
    parameter: "otp",
    type: Number(),
    length: 6,
  },
  Email_OTP: {
    name: "Email One-Time Password",
    parameter: "validateCode",
    type: Number(),
    length: 6,
  },
} as const;

const Options = {
  [CONST.BIOMETRICS.AUTH_OPTIONS.NO_BIOMETRICS]: [
    Factors.Email_OTP,
    Factors.SMS_OR_2FA_OTP,
  ],
  [CONST.BIOMETRICS.AUTH_OPTIONS.BIOMETRICS_CONFIGURATION]: [
    Factors.SIGNED_CHALLENGE,
    Factors.Email_OTP,
  ],
  [CONST.BIOMETRICS.AUTH_OPTIONS.BIOMETRICS_ONLY]: [Factors.SIGNED_CHALLENGE],
} as const;

type Option = keyof typeof Options;

type OptionParameters<T extends Option> = {
  [K in (typeof Options)[T][number] as K["parameter"]]: K["type"];
};

function isAuthorizationSufficient<T extends Option>(
  option: T,
  factors: OptionParameters<T>,
): BiometricsStatus<boolean> {
  const requiredFactors = Options[option];

  for (const factor of requiredFactors) {
    const param = factor.parameter;
    if (!(param in factors)) {
      return {
        value: false,
        reason: "biometrics.reason.generic.authParametersError",
        message: `Missing required factor: ${factor.name} (${factor.parameter})`,
      };
    }

    const value = factors[param as keyof typeof factors];
    if (typeof value !== typeof factor.type) {
      return {
        value: false,
        reason: "biometrics.reason.generic.authParametersError",
        message: `Invalid type for factor: ${factor.name} (${factor.parameter}). Expected ${typeof factor.type}, got ${typeof value}`,
      };
    }

    if (
      typeof factor.length === "number" &&
      String(value).length !== factor.length
    ) {
      return {
        value: false,
        reason: "biometrics.reason.generic.authParametersError",
        message: `Invalid length for factor: ${factor.name} (${factor.parameter}). Expected length ${factor.length}, got length ${String(value).length}`,
      };
    }
  }

  return {
    value: true,
    reason: "biometrics.reason.generic.authParametersSufficient",
  };
}

function authorizeBiometricsAction<T extends keyof typeof Options>(
  option: T,
  transactionID: string,
  factors: OptionParameters<T>,
) {
  const parametersTestResult = isAuthorizationSufficient(option, factors);

  if (!parametersTestResult.value) {
    return Promise.resolve(parametersTestResult);
  }

  return authorizeTransaction({
    ...factors,
    transactionID,
  }).then(({ httpCode, reason }) => ({
    value: httpCode === 200,
    reason,
  }));
}

export default authorizeBiometricsAction;
