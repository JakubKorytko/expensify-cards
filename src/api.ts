import fetch from "@/API_mock/router";

const api = async (
  path: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
) => {
  return await fetch(path, {
    method,
    body,
  });
};

type APIResponse<T = undefined> = {
  response: T | undefined;
  status: number;
  message: string;
};

const APIRoutes: {
  Read: Record<keyof ReadCommands, `${"POST" | "GET"}:${string}`>;
  Write: Record<keyof WriteCommands, `${"POST" | "GET"}:${string}`>;
} = {
  Read: {
    RequestBiometricChallenge: "GET:/request_biometric_challenge",
  },
  Write: {
    ResendValidateCode: "POST:/resend_validate_code",
    RegisterBiometrics: "POST:/register_biometrics",
    AuthorizeTransaction: "POST:/authorize_transaction",
  },
};

type WriteCommands = {
  RegisterBiometrics: {
    route: typeof APIRoutes.Write.RegisterBiometrics;
    parameters: {
      publicKey: string;
      validateCode?: number;
    };
    returns: APIResponse;
  };
  AuthorizeTransaction: {
    route: typeof APIRoutes.Write.AuthorizeTransaction;
    parameters: {
      transactionID: string;
      // this one:
      signedChallenge?: string; // JWT
      // or these two together:
      validateCode?: number; // magic code
      otp?: number; // 2FA / SMS OTP
    };
    returns: APIResponse;
  };
  ResendValidateCode: {
    route: typeof APIRoutes.Write.ResendValidateCode;
    parameters: {
      email: string;
    };
    returns: APIResponse;
  };
};

type ReadCommands = {
  RequestBiometricChallenge: {
    route: typeof APIRoutes.Read.RequestBiometricChallenge;
    parameters?: Record<string, unknown>;
    returns: APIResponse<ChallengeObject>;
  };
};

type ChallengeObject = {
  challenge: Challenge;
};

type Challenge = {
  nonce: string;
  expires: number;
};

const WRITE_COMMANDS = {
  REGISTER_BIOMETRICS: "RegisterBiometrics",
  AUTHORIZE_TRANSACTION: "AuthorizeTransaction",
  RESEND_VALIDATE_CODE: "ResendValidateCode",
} as const;

const READ_COMMANDS = {
  REQUEST_BIOMETRIC_CHALLENGE: "RequestBiometricChallenge",
} as const;

type WriteCommandType = (typeof WRITE_COMMANDS)[keyof typeof WRITE_COMMANDS];
type ReadCommandType = (typeof READ_COMMANDS)[keyof typeof READ_COMMANDS];

const API = {
  read: async (
    route: ReadCommandType,
    parameters?: ReadCommands[typeof route]["parameters"],
  ) => {
    const routePath = APIRoutes.Read[route];
    const [protocol, path] = routePath.split(":") as ["GET" | "POST", string];
    return (await api(path, protocol, parameters)) as Promise<
      ReadCommands[typeof route]["returns"]
    >;
  },
  write: async (
    route: WriteCommandType,
    parameters: WriteCommands[typeof route]["parameters"],
  ) => {
    const routePath = APIRoutes.Write[route];
    const [protocol, path] = routePath.split(":") as ["GET" | "POST", string];
    return (await api(path, protocol, parameters)) as Promise<
      WriteCommands[typeof route]["returns"]
    >;
  },
};

export default API;
export { WRITE_COMMANDS, READ_COMMANDS };
export type { WriteCommands, ReadCommands, ChallengeObject, Challenge };
