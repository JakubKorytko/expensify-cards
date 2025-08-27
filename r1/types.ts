import CONST from "./const";
import { ReasonPlain, ReasonTranslation } from "./Reason";

type TranslationPaths = `biometrics.${string}`;

type AuthReturnValue<T> = {
  value: T;
  reason: ReasonTranslation | ReasonPlain;
  type?: number;
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

export type {
  AuthReturnValue,
  Feedback,
  KeyType,
  Biometrics,
  FeedbackKeyType,
  TranslationPaths,
};
