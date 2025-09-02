import * as ed from "@noble/ed25519";

/**
 * Polyfill for React Native
 * @see https://github.com/paulmillr/noble-ed25519?tab=readme-ov-file#react-native-polyfill-getrandomvalues-and-sha512
 */

import "react-native-get-random-values";
import { sha512 } from "@noble/hashes/sha2";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
ed.etc.sha512Async = (...m) =>
  Promise.resolve(ed.etc.sha512Sync?.(...m) ?? ([] as unknown as ed.Bytes));

/** --- */

/** Get random private key and associated public key in hex. */
function generateKeyPair() {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = ed.getPublicKey(privateKey);

  return {
    privateKey: ed.etc.bytesToHex(privateKey),
    publicKey: ed.etc.bytesToHex(publicKey),
  };
}

/**
 * Sign token using provided key.
 * The string is encoded using TextEncoder before signing to get 8-bit unsigned integer array.
 * By doing so, we can pass non-standard characters to this function (e.g. JSON stringified objects).
 */
function signToken(token: string, key: string) {
  return ed.etc.bytesToHex(ed.sign(new TextEncoder().encode(token), key));
}

export { generateKeyPair, signToken };
