/** Model of server response */
type Response = {
    // ...

    /** Challenge */
    challenge?: {
        /** Version */
        version: number;
        /** Algorithm */
        algorithm: string;
        /** Nonce */
        nonce: string;
        /** Expires */
        expires: number;
    };

    // ...
};

export default Response;
