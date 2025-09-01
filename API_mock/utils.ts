import * as ed from "@noble/ed25519";
import "react-native-get-random-values";
import { sha512 } from "@noble/hashes/sha2";
import { Bytes } from "@noble/ed25519";
import { Logger } from "@/base/helpers";
import CONST from "@/base/const";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
ed.etc.sha512Async = (...m) =>
  Promise.resolve(ed.etc.sha512Sync?.(...m) ?? ([] as unknown as Bytes));

type Challenge = {
  nonce: string;
  expires: number;
};

const USER_EMAIL = CONST.USER_EMAIL;

const STORAGE: {
  publicKeys: Record<string, string[]>;
  validateCodes: Record<string, number[]>;
  challenges: Record<string, Challenge>;
} = {
  publicKeys: {},
  validateCodes: {},
  challenges: {},
};

function generateSixDigitNumber() {
  return Math.floor(Math.random() * 900000) + 100000;
}

const getOriginalChallengeJWT = (signature: string, key: string) => {
  const challengeKeys = Object.keys(STORAGE.challenges);

  const challengeJWT = challengeKeys.find((challengeKey) => {
    Logger.m(
      "Verifying signature",
      signature,
      "for nonce",
      challengeKey,
      "with key",
      key,
    );
    let verifyResult;
    try {
      verifyResult = ed.verify(
        signature,
        new TextEncoder().encode(challengeKey),
        key,
      );
    } catch (e) {
      Logger.e(e);
    }
    Logger.m(
      "Verification for signature",
      signature,
      "result:",
      verifyResult ? "success" : "failed",
    );
    return verifyResult;
  });
  if (!challengeJWT) {
    return null;
  }

  return challengeJWT;
};

const isChallengeValid = function (signedJWTString: string, publicKey: string) {
  try {
    const challengeJWT =
      getOriginalChallengeJWT(signedJWTString, publicKey) ?? "";

    if (!challengeJWT) {
      return false;
    }

    const { nonce, expires } = STORAGE.challenges[challengeJWT] ?? {};

    if (!nonce || !expires) {
      return false;
    }

    delete STORAGE.challenges[challengeJWT];
    const challengeExpired = expires < Date.now();

    if (challengeExpired) {
      Logger.m(`Challenge ${challengeJWT} expired, removed from storage`);
    } else {
      Logger.m(`Challenge ${challengeJWT} success, removed from storage`);
    }

    return !challengeExpired;
  } catch (e) {
    return false;
  }
};

export {
  isChallengeValid,
  generateSixDigitNumber,
  STORAGE,
  USER_EMAIL,
  Logger,
  ed,
};

export type { Challenge };
