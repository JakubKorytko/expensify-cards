/** Challenge */
type MFAChallenge = {
    /** Nonce */
    challenge: string;

    /** RP ID */
    rpId: string;

    /** Allow Credentials */
    allowCredentials: Array<{
        /** Type */
        type: string;

        /** ID */
        id: string;
    }>;

    /** User Verification */
    userVerification: string;

    /** Timeout */
    timeout: number;
};

/** Model of server response */
type Response = {
    // ...

    /** Challenge */
    challenge?: MFAChallenge;

    // ...
};

export default Response;
export type {MFAChallenge};
