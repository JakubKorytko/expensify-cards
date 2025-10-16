/** Model of server response */
type Response = {
  // ...

  /** Challenge */
  challenge?: {
    /** Nonce */
    nonce: string;
    /** Expires */
    expires: number;
  };

  // ...
};

export default Response;
