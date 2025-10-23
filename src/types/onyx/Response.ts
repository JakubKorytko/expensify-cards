/** Challenge */
type MFAChallenge = {
    /** Nonce */
    challenge: string;
    /** Version */
    timeout: number;
    /** Expires */
    expires: number;
    /** Algorithm */
    allowCredentials: Array<Record<'type', string>>;
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
