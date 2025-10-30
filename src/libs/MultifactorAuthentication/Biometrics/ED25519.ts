/**
 * Required polyfills for React Native to support ED25519 cryptographic operations.
 * Provides implementations for getRandomValues and SHA-512 hashing.
 * @see https://github.com/paulmillr/noble-ed25519?tab=readme-ov-file#react-native-polyfill-getrandomvalues-and-sha512
 */
import * as ed from '@noble/ed25519';
import type {Bytes} from '@noble/ed25519';
import {sha256, sha512} from '@noble/hashes/sha2';
import {Buffer} from 'buffer';
import 'react-native-get-random-values';
import type {MFAChallenge} from '@src/types/onyx/Response';
import VALUES from './VALUES';

ed.hashes.sha512 = sha512;
ed.hashes.sha512Async = (m: Uint8Array) => Promise.resolve(sha512(m));

type Hex = string;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Base64URL<T> = string;

type ChallengeFlag = number;

type ChallengeJSON = {
    challenge: Base64URL<string>; // Base64-encoded challenge string
};

type BinaryData = {
    RPID: Bytes[]; // RELYING PARTY ID - i.e., 'expensify.com'
    FLAGS: Bytes[]; // Authenticator flags
    SIGN_COUNT: Bytes[]; // Signature counter
};

type SignedChallenge = {
    rawId: Base64URL<string>; // CREDENTIAL_ID - key identifier
    type: string; // e.g., 'public-key'; 'biometrics' for SecureStore.
    response: {
        authenticatorData: Base64URL<BinaryData>;
        clientDataJSON: Base64URL<ChallengeJSON>;
        signature: Base64URL<Hex>;
    };
};

/** RN polyfill for base64url encoding */
const base64URL = <T>(value: string): Base64URL<T> => {
    return Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * Generates a new random ED25519 key pair.
 * Returns both private and public keys encoded as hexadecimal strings.
 */
function generateKeyPair() {
    const {secretKey, publicKey} = ed.keygen();

    return {
        privateKey: ed.etc.bytesToHex(secretKey),
        publicKey: ed.etc.bytesToHex(publicKey),
    };
}

/* eslint-disable no-bitwise */
const createFlag = (up: boolean, uv: boolean): ChallengeFlag => {
    let flag = 0;
    if (up) {
        flag |= 0x01; // Set bit 0
    }
    if (uv) {
        flag |= 0x04; // Set bit 2
    }
    return flag;
};
/* eslint-enable no-bitwise */

const createBinaryData = (rpId: string): Bytes => {
    const RPID = sha256(rpId);

    const flagsArray = new Uint8Array([createFlag(true, true)]);

    const signCount = 0; // Not used in our implementation

    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, signCount, false); // writing the signCount as a big-endian 32-bit integer
    const signCountArray = new Uint8Array(buffer);

    return ed.etc.concatBytes(RPID, flagsArray, signCountArray);
};

/**
 * Signs a multifactor authentication challenge token using an ED25519 private key.
 * Constructs the necessary authenticator data and client data JSON.
 * Returns a SignedChallenge object containing the signature and related data.
 */
const signToken = (accountID: number, token: MFAChallenge, key: string): SignedChallenge => {
    const rawId: Base64URL<string> = base64URL(`${accountID}_${VALUES.KEY_ALIASES.PUBLIC_KEY}`);
    const type = VALUES.ED25519_TYPE;

    const binaryData = createBinaryData(token.rpId);
    const authenticatorData: Base64URL<BinaryData> = base64URL(ed.etc.bytesToHex(binaryData));

    const message = ed.etc.concatBytes(binaryData, sha256(JSON.stringify(token)));
    const keyInBytes = ed.etc.hexToBytes(key);

    const signatureRaw = ed.sign(message, keyInBytes);
    const signature: Base64URL<string> = base64URL(ed.etc.bytesToHex(signatureRaw));

    return {
        rawId,
        type,
        response: {
            authenticatorData,
            clientDataJSON: base64URL(JSON.stringify(token)),
            signature,
        },
    };
};

export {generateKeyPair, signToken, createBinaryData as __doNotUseCreateBinaryData};
export type {SignedChallenge};
