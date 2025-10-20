import type {EmptyObject} from 'type-fest';
import type * as Parameters from './parameters';

const SIDE_EFFECT_REQUEST_COMMANDS = {
    // ...
    REGISTER_BIOMETRICS: 'RegisterBiometrics',
    REQUEST_BIOMETRIC_CHALLENGE: 'RequestBiometricChallenge',
    AUTHORIZE_TRANSACTION: 'AuthorizeTransaction',
    // ...
} as const;

type SideEffectRequestCommandParameters = {
    // ...
    [SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_BIOMETRICS]: Parameters.RegisterBiometricsParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.AUTHORIZE_TRANSACTION]: Parameters.AuthorizeTransactionParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE]: EmptyObject;
    // ...
};

export {SIDE_EFFECT_REQUEST_COMMANDS};
export type {SideEffectRequestCommandParameters};
