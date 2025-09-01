import { AUTH_TYPE } from "expo-secure-store";
import CONST from "@src/CONST";

type ValueOf<T> = T[keyof T];

type TranslationPaths = `biometrics.${string}`;
type AuthType = ValueOf<typeof CONST.BIOMETRICS.AUTH_TYPE>;
type MessageSource = ValueOf<typeof CONST.BIOMETRICS.MESSAGE_SOURCE>;
type KeyType = ValueOf<typeof CONST.BIOMETRICS.KEY_ALIASES>;
type FeedbackKeyType = ValueOf<typeof CONST.BIOMETRICS.FEEDBACK_TYPE>;

type AuthReturnValue<T> = {
  value: T;
  reason: TranslationPaths;
  type?: (typeof AUTH_TYPE)[keyof typeof AUTH_TYPE];
  typeName?: string;
  message?: string;
};

type Feedback = {
  challenge: AuthReturnValue<boolean>;
  key: AuthReturnValue<boolean>;
  message: string;
};

type Biometrics = {
  request: () => Promise<AuthReturnValue<boolean>>;
  challenge: (transactionID: string) => Promise<AuthReturnValue<boolean>>;
  prompt: (transactionID: string) => Promise<AuthReturnValue<boolean>>;
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
  MessageSource,
};
