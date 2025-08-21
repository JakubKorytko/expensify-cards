const SERVER_URL = "http://192.168.82.62:3000";

const api = async (
  path: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
) => {
  return await fetch(SERVER_URL + path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body
      ? {
          "Content-Type": "application/json",
        }
      : undefined,
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
  };
};

type ReadCommands = {
  ResendValidateCode: {
    route: typeof APIRoutes.Read.ResendValidateCode;
    parameters: {
      email: string;
    };
  };
  RequestBiometricChallenge: {
    route: typeof APIRoutes.Read.RequestBiometricChallenge;
    parameters?: Record<string, unknown>;
  };
};

const API = {
  read: async (
    route: keyof typeof APIRoutes.Read,
    parameters?: ReadCommands[typeof route]["parameters"],
  ) => {
    const routePath = APIRoutes.Read[route];
    const [protocol, path] = routePath.split(":") as ["GET" | "POST", string];
    return await api(path, protocol, parameters);
  },
  write: async (
    route: keyof typeof APIRoutes.Write,
    parameters: WriteCommands[typeof route]["parameters"],
  ) => {
    const routePath = APIRoutes.Write[route];
    const [protocol, path] = routePath.split(":") as ["GET" | "POST", string];
    console.log(path, protocol, parameters);
    return await api(path, protocol, parameters);
  },
};

export default API;
