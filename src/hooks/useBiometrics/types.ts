import CONST from "@src/CONST";
import { TranslationPaths, ValueOf } from "@/base/mockTypes";
import { AUTH_TYPE } from "expo-secure-store";

type Biometrics = {
  request: () => Promise<BiometricsStatus<boolean>>;
  challenge: (transactionID: string) => Promise<BiometricsStatus<boolean>>;
  prompt: (transactionID: string) => Promise<BiometricsStatus<boolean>>;
  feedback: Feedback;
  status: boolean;
};

type Feedback = {
  challenge: BiometricsStatus<boolean>;
  key: BiometricsStatus<boolean>;
  message: string;
};

type SetFeedback = (
  value: BiometricsStatus<boolean>,
  type: FeedbackKeyType,
) => BiometricsStatus<boolean>;

type FeedbackKeyType = ValueOf<typeof CONST.BIOMETRICS.FEEDBACK_TYPE>;
type AuthType = ValueOf<typeof CONST.BIOMETRICS.AUTH_TYPE>;

type BiometricsStatus<T> = {
  value: T;
  reason: TranslationPaths;
  type?: (typeof AUTH_TYPE)[keyof typeof AUTH_TYPE];
  typeName?: string;
  message?: string;
};

export type {
  Feedback,
  Biometrics,
  SetFeedback,
  FeedbackKeyType,
  AuthType,
  BiometricsStatus,
};
