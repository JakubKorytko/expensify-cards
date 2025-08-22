import CONST from "@/src/const";

type Biometrics = {
  request: (code?: number) => Promise<AuthReturnValue<boolean>>;
  revoke: () => Promise<AuthReturnValue<boolean>>;
  challenge: () => Promise<AuthReturnValue<boolean>>;
  feedback: Feedback;
  status: boolean;
  validateCodeRequired: boolean;
};

type AuthReturnValue<T> = {
  value: T;
  reason: string;
  authType?: number;
  authTypeMessage?: string;
};

type AuthType = (typeof CONST.AUTH_TYPE)[keyof typeof CONST.AUTH_TYPE];
type KeyType = (typeof CONST.KEY_ALIASES)[keyof typeof CONST.KEY_ALIASES];

type Feedback = {
  challenge: AuthReturnValue<boolean>;
  key: AuthReturnValue<boolean>;
  lastAction:
    | (typeof CONST.FEEDBACK_TYPE)[keyof typeof CONST.FEEDBACK_TYPE]
    | undefined;
};

type CallbackProps = {
  show?: boolean;
  hide?: () => void;
  authData: AuthReturnValue<boolean>;
};

type MagicCodeProps = {
  callback: () => void;
};

export type {
  Biometrics,
  AuthReturnValue,
  KeyType,
  AuthType,
  Feedback,
  MagicCodeProps,
  CallbackProps,
};
