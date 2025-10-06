import {
  BiometricsAction,
  BiometricsActionResponse,
  BiometricsFactors,
} from "@libs/Biometrics/types";
import CONST from "@src/CONST";
import {
  authorizeTransaction,
  registerBiometrics,
} from "@libs/actions/Biometrics";

type BiometricsActionsAdditionalParameters = {
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION]: {
    transactionID: string;
  };
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE]: {
    transactionID: string;
  };
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION_FALLBACK]: {
    transactionID: string;
    isValidateCodeVerified?: boolean;
  };
  [CONST.BIOMETRICS.ACTION.SETUP_BIOMETRICS]: {
    publicKey: string;
  };
};

type BiometricsActionMap = {
  [key in BiometricsAction]: (
    params: BiometricsFactors<key> & BiometricsActionsAdditionalParameters[key],
  ) => Promise<BiometricsActionResponse>;
};

const biometricsActions: BiometricsActionMap = {
  [CONST.BIOMETRICS.ACTION.SETUP_BIOMETRICS]: registerBiometrics,
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION]: authorizeTransaction,
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE]:
    authorizeTransaction,
  [CONST.BIOMETRICS.ACTION.AUTHORIZE_TRANSACTION_FALLBACK]:
    authorizeTransaction,
} as const;

export default biometricsActions;
export type { BiometricsActionsAdditionalParameters };
