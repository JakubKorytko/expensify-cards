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

const APIRoutes: {
  Read: Record<keyof ReadCommands, `${"POST" | "GET"}:${string}`>;
  Write: Record<keyof WriteCommands, `${"POST" | "GET"}:${string}`>;
} = {
  Read: {
    ResendValidateCode: "POST:/resend_validate_code",
    RequestBiometricChallenge: "GET:/request_biometric_challenge",
  },
  Write: {
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
    returns: string | true;
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
    returns: string | boolean;
  };
};

type ReadCommands = {
  ResendValidateCode: {
    route: typeof APIRoutes.Read.ResendValidateCode;
    parameters: {
      email: string;
    };
    returns: boolean;
  };
  RequestBiometricChallenge: {
    route: typeof APIRoutes.Read.RequestBiometricChallenge;
    parameters?: Record<string, unknown>;
    returns: Nonce | string;
  };
};

type Nonce = {
  challenge: string;
};

const API = {
  read: async (
    route: keyof typeof APIRoutes.Read,
    parameters?: ReadCommands[typeof route]["parameters"],
  ) => {
    const routePath = APIRoutes.Read[route];
    const [protocol, path] = routePath.split(":") as ["GET" | "POST", string];
    return (await api(path, protocol, parameters)) as Promise<
      ReadCommands[typeof route]["returns"]
    >;
  },
  write: async (
    route: keyof typeof APIRoutes.Write,
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
export type { WriteCommands, ReadCommands, Nonce };
