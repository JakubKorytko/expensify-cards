import { signToken, generateKeyPair } from "./ED25519";
import MultifactorAuthenticationChallenge from "./MultifactorAuthenticationChallenge";
import {
  MultifactorAuthenticationPrivateKeyStore,
  MultifactorAuthenticationPublicKeyStore,
} from "./MultifactorAuthenticationKeyStore";
import { MULTI_FACTOR_AUTHENTICATION_SCENARIOS } from "./scenarios";
import MultifactorAuthenticationStore from "./MultifactorAuthenticationStore";
import type { MultifactorAuthenticationScenarioParameters } from "./scenarios";
import processMultifactorAuthenticationScenario, {
  areMultifactorAuthenticationFactorsSufficient,
} from "./processMultifactorAuthenticationScenario";
import MultifactorAuthenticationValues from "./MultifactorAuthenticationValues";

const MultifactorAuthentication = {
  signChallenge: signToken,
  generateKeyPair,
  challenge: MultifactorAuthenticationChallenge,
  privateKeyStore: MultifactorAuthenticationPrivateKeyStore,
  publicKeyStore: MultifactorAuthenticationPublicKeyStore,
  scenarios: MULTI_FACTOR_AUTHENTICATION_SCENARIOS,
  supportedAuthentication:
    MultifactorAuthenticationStore.supportedAuthentication,
  processScenario: processMultifactorAuthenticationScenario,
  areFactorsSufficient: areMultifactorAuthenticationFactorsSufficient,
  values: MultifactorAuthenticationValues,
};

export default MultifactorAuthentication;
export type * from "./types";
export type { MultifactorAuthenticationScenarioParameters };
