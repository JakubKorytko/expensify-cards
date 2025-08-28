import CONST from "./const";
import type { ReasonType } from "./Reason";
import { AUTH_TYPE } from "expo-secure-store";

type TranslationPaths = `biometrics.${string}`;
type AuthType = (typeof CONST.AUTH_TYPE)[keyof typeof CONST.AUTH_TYPE];

type AuthReturnValue<T> = {
  value: T;
  reason: ReasonType;
  type?: AUTH_TYPE;
  typeName?: string;
  message?: string;
};

type KeyType = (typeof CONST.KEY_ALIASES)[keyof typeof CONST.KEY_ALIASES];
type FeedbackKeyType =
  (typeof CONST.FEEDBACK_TYPE)[keyof typeof CONST.FEEDBACK_TYPE];

type Feedback = {
  challenge: AuthReturnValue<boolean>;
  key: AuthReturnValue<boolean>;
  lastAction: {
    type: (typeof CONST.FEEDBACK_TYPE)[keyof typeof CONST.FEEDBACK_TYPE];
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
