import * as ed from "@noble/ed25519";
import "react-native-get-random-values";
import { sha512 } from "@noble/hashes/sha2";
import { Bytes } from "@noble/ed25519";
import keyStorage from "@/scripts/keyStorage";

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

function generateKey(updateCallback: (token: string | undefined) => void) {
  if (keyStorage.key) {
    throw new Error("Key is already stored!");
  }

  const keys = generateKeyPair();
  keyStorage.key = keys.privateKey;
  keyStorage.updateCallback = updateCallback;

  return ed.etc.bytesToHex(keys.publicKey);
}

export default generateKey;
