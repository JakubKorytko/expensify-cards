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

const SIDE_EFFECT_REQUEST_COMMANDS = {
  REGISTER_BIOMETRICS: WRITE_COMMANDS.REGISTER_BIOMETRICS,
  AUTHORIZE_TRANSACTION: WRITE_COMMANDS.AUTHORIZE_TRANSACTION,
  RESEND_VALIDATE_CODE: WRITE_COMMANDS.RESEND_VALIDATE_CODE,
  REQUEST_BIOMETRIC_CHALLENGE: READ_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE,
};

type WriteCommandType = (typeof WRITE_COMMANDS)[keyof typeof WRITE_COMMANDS];
type ReadCommandType = (typeof READ_COMMANDS)[keyof typeof READ_COMMANDS];

type ReadAPI = (
  route: ReadCommandType,
  parameters?: ReadCommands[typeof route]["parameters"],
) => Promise<ReadCommands[typeof route]["returns"]>;

type WriteAPI = (
  route: WriteCommandType,
  parameters: WriteCommands[typeof route]["parameters"],
) => Promise<WriteCommands[typeof route]["returns"]>;

type SideEffectsResponse = {
  challenge?: Challenge;
  jsonCode?: number | string;
  message?: string;
};

type APIType = {
  read: ReadAPI;
  write: WriteAPI;
  makeRequestWithSideEffects: {
    (
      route: ReadCommandType,
      parameters: ReadCommands[typeof route]["parameters"],
      onyxData: object,
    ): Promise<SideEffectsResponse>;
    (
      route: WriteCommandType,
      parameters: WriteCommands[typeof route]["parameters"],
      onyxData: object,
    ): Promise<SideEffectsResponse>;
  };
};

const isReadCommandType = (
  route: ReadCommandType | WriteCommandType,
): route is ReadCommandType =>
  route === READ_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE;

const API: APIType = {
  read: async (route, parameters) => {
    const routePath = APIRoutes.Read[route];
    const [protocol, path] = routePath.split(":") as ["GET" | "POST", string];
    return (await api(path, protocol, parameters)) as Promise<
      ReadCommands[typeof route]["returns"]
    >;
  },
  write: async (route, parameters) => {
    const routePath = APIRoutes.Write[route];
    const [protocol, path] = routePath.split(":") as ["GET" | "POST", string];
    return (await api(path, protocol, parameters)) as Promise<
      WriteCommands[typeof route]["returns"]
    >;
  },
  makeRequestWithSideEffects: async (route, parameters) => {
    if (isReadCommandType(route)) {
      const res = await API.read(route, parameters);
      return {
        message: res.message,
        jsonCode: res.status,
        challenge: res.response?.challenge,
      };
    }
    const res = await API.write(
      route,
      parameters as WriteCommands[typeof route]["parameters"],
    );
    return {
      message: res.message,
      jsonCode: res.status,
    };
  },
};

export default API;
export { WRITE_COMMANDS, READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS };
export type { WriteCommands, ReadCommands, ChallengeObject, Challenge };
