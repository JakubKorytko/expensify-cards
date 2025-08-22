import CONST from "@/src/const";

type Biometrics = {
  request: () => Promise<AuthReturnValue<boolean>>;
  revoke: () => Promise<AuthReturnValue<boolean>>;
  challenge: () => Promise<AuthReturnValue<boolean>>;
  feedback: Feedback;
  status: boolean;
};

type AuthReturnValue<T> = {
  value: T;
  reason: string;
  authType?: number;
  authTypeMessage?: string;
};

type AuthType = (typeof CONST.AUTH_TYPE)[keyof typeof CONST.AUTH_TYPE];
type KeyType = (typeof CONST.KEY_ALIASES)[keyof typeof CONST.KEY_ALIASES];

type FunctionWithStatus = {
  (): Promise<AuthReturnValue<boolean>>;
  status: AuthReturnValue<boolean>;
};

type Feedback = {
  challenge: AuthReturnValue<boolean>;
  key: AuthReturnValue<boolean>;
};

export type {
  Biometrics,
  AuthReturnValue,
  KeyType,
  AuthType,
  FunctionWithStatus,
  Feedback,
};
