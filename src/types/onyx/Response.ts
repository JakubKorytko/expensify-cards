import type {MFAChallenge} from '@libs/MultifactorAuthentication/Biometrics/types';

/** Model of server response */
type Response = {
    // ...

    /** Multifactorial authentication challenge object */
    challenge?: MFAChallenge;

    // ...
};

export default Response;
