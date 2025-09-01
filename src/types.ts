import { AUTH_TYPE } from "expo-secure-store";
import CONST from "@src/CONST";
import type { ReasonType } from "@libs/Reason";

type TranslationPaths = `biometrics.${string}`;
type AuthType =
  (typeof CONST.BIOMETRICS.AUTH_TYPE)[keyof typeof CONST.BIOMETRICS.AUTH_TYPE];

type AuthReturnValue<T> = {
  value: T;
  reason: ReasonType;
  type?: (typeof AUTH_TYPE)[keyof typeof AUTH_TYPE];
  typeName?: string;
  message?: string;
};

type KeyType =
  (typeof CONST.BIOMETRICS.KEY_ALIASES)[keyof typeof CONST.BIOMETRICS.KEY_ALIASES];
type FeedbackKeyType =
  (typeof CONST.BIOMETRICS.FEEDBACK_TYPE)[keyof typeof CONST.BIOMETRICS.FEEDBACK_TYPE];

type Feedback = {
  challenge: AuthReturnValue<boolean>;
  key: AuthReturnValue<boolean>;
  lastAction: {
    type: (typeof CONST.BIOMETRICS.FEEDBACK_TYPE)[keyof typeof CONST.BIOMETRICS.FEEDBACK_TYPE];
    value: AuthReturnValue<boolean>;
  };
};

type Biometrics = {
  request: () => Promise<AuthReturnValue<boolean>>;
  challenge: (transactionID: string) => Promise<AuthReturnValue<boolean>>;
  feedback: Feedback;
  status: boolean;
};

type SetFeedback = (
  value: AuthReturnValue<boolean>,
  type: FeedbackKeyType,
) => AuthReturnValue<boolean>;

export type {
  AuthReturnValue,
  Feedback,
  KeyType,
  Biometrics,
  FeedbackKeyType,
  TranslationPaths,
  AuthType,
  SetFeedback,
};
