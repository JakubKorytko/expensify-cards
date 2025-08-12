import * as ed from "@noble/ed25519";
import "react-native-get-random-values";
import { sha512 } from "@noble/hashes/sha2";
import { Bytes } from "@noble/ed25519";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
ed.etc.sha512Async = (...m) =>
  Promise.resolve(ed.etc.sha512Sync?.(...m) ?? ([] as unknown as Bytes));

function generateKeyPair() {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = ed.getPublicKey(privateKey);
  const privateKey64Byte = ed.etc.concatBytes(privateKey, publicKey);
  const publicKeyExt = ed.utils.getExtendedPublicKey(privateKey);

  return {
    ext: {
      publicKey: publicKeyExt,
      privateKey: privateKey64Byte,
    },
    publicKey,
    privateKey,
  };
}

function generateKeys() {
  const keys = generateKeyPair();

  return {
    privateKey: ed.etc.bytesToHex(keys.privateKey),
    publicKey: ed.etc.bytesToHex(keys.publicKey),
  };
}

function signToken(token: string, key: string) {
  return ed.etc.bytesToHex(ed.sign(token, key));
}

export { generateKeys, signToken };
