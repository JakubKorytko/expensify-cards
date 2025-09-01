import * as ed from "@noble/ed25519";
import "react-native-get-random-values";
import { sha512 } from "@noble/hashes/sha2";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
ed.etc.sha512Async = (...m) =>
  Promise.resolve(ed.etc.sha512Sync?.(...m) ?? ([] as unknown as ed.Bytes));

function generateKeyPair() {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = ed.getPublicKey(privateKey);

  return {
    privateKey: ed.etc.bytesToHex(privateKey),
    publicKey: ed.etc.bytesToHex(publicKey),
  };
}

function signToken(token: string, key: string) {
  return ed.etc.bytesToHex(ed.sign(new TextEncoder().encode(token), key));
}

export { generateKeyPair, signToken };
