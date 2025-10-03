import { BiometricsAuthFactor } from "@libs/Biometrics/types";
import { BiometricsStatus } from "../useBiometricsStatus/types";

type BiometricsAuthorizationParams = {
  otp?: number;
  validateCode?: number;
  transactionID: string;
};

type BiometricsStep = {
  wasRecentStepSuccessful: boolean | undefined;
  requiredFactorForNextStep: BiometricsAuthFactor | undefined;
  isRequestFulfilled: boolean;
};

type BiometricsStepWithStatus = BiometricsStep & {
  isBiometryConfigured: boolean;
};

/** Value returned by the useBiometrics hook. */
type Biometrics = [
  BiometricsStepWithStatus & BiometricsStatus<BiometricsStep>,
  (
    params: BiometricsAuthorizationParams,
  ) => Promise<BiometricsStatus<BiometricsStep>>,
  () => void,
  () => void,
];

export type {
  Biometrics,
  BiometricsStatus,
  BiometricsStep,
  BiometricsStepWithStatus,
  BiometricsAuthorizationParams,
};
