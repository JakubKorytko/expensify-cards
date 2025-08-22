import * as SecureStore from "expo-secure-store";
import CONST from "@/src/const";
import type { AuthReturnValue, KeyType } from "@/src/types";

import { Logger, decodeExpoErrorCode } from "@/src/helpers";

async function setKey(
  key: KeyType,
  value: string,
): Promise<AuthReturnValue<boolean>> {
  try {
    const authType = await SecureStore.setItemAsync(key, value, {
      requireAuthentication: key === CONST.KEY_ALIASES.PRIVATE_KEY,
      failOnDuplicate: key === CONST.KEY_ALIASES.PRIVATE_KEY,
      keychainService: CONST.KEYCHAIN_SERVICE,
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    });

    return {
      value: true,
      reason: CONST.REASON_CODES.SUCCESS.KEY_SAVED,
      authType,
    };
  } catch (error) {
    return {
      value: false,
      reason: decodeExpoErrorCode(error),
    };
  }
}

async function getKey(key: KeyType): Promise<AuthReturnValue<string | null>> {
  try {
    const [retrievedKey, authType] = await SecureStore.getItemAsync(key, {
      requireAuthentication: key === CONST.KEY_ALIASES.PRIVATE_KEY,
      keychainService: CONST.KEYCHAIN_SERVICE,
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    });

    return {
      value: retrievedKey,
      reason: !!retrievedKey
        ? CONST.REASON_CODES.SUCCESS.KEY_RETRIEVED
        : CONST.REASON_CODES.SUCCESS.KEY_NOT_IN_SECURE_STORE,
      authType,
    };
  } catch (error) {
    return {
      value: null,
      reason: decodeExpoErrorCode(error),
    };
  }
}

async function revokeKey(key: KeyType): Promise<AuthReturnValue<boolean>> {
  try {
    await SecureStore.deleteItemAsync(key, {
      keychainService: CONST.KEYCHAIN_SERVICE,
    });
    return {
      value: true,
      reason: CONST.REASON_CODES.SUCCESS.KEY_DELETED,
    };
  } catch (error) {
    return {
      value: false,
      reason: decodeExpoErrorCode(error),
    };
  }
}

class KeyStorage {
  key: KeyType;

  constructor(type: KeyType) {
    this.key = type;
  }

  async set(value: string): Promise<AuthReturnValue<boolean>> {
    const result = await setKey(this.key, value);

    const reasonCode = result.value
      ? CONST.REASON_CODES.SUCCESS.KEY_SAVED
      : CONST.REASON_CODES.ERROR.UNABLE_TO_SAVE_KEY;

    Logger[result.value ? "mw" : "ww"](reasonCode, {
      key: this.key,
      value,
    });

    return result;
  }

  async delete(): Promise<AuthReturnValue<boolean>> {
    const result = await revokeKey(this.key);
    const reasonCode = result.value
      ? CONST.REASON_CODES.SUCCESS.KEY_DELETED
      : CONST.REASON_CODES.ERROR.UNABLE_TO_DELETE_KEY;

    Logger[result.value ? "mw" : "ww"](reasonCode, {
      key: this.key,
    });

    return result;
  }

  async get(): Promise<AuthReturnValue<string | null>> {
    const key = await getKey(this.key);
    const reasonCode = key.value
      ? CONST.REASON_CODES.SUCCESS.KEY_RETRIEVED
      : CONST.REASON_CODES.ERROR.UNABLE_TO_RETRIEVE_KEY;

    Logger[reasonCode ? "mw" : "ww"](reasonCode, {
      key: this.key,
    });

    return key;
  }
}

const PrivateKeyStorage = new KeyStorage(CONST.KEY_ALIASES.PRIVATE_KEY);
const PublicKeyStorage = new KeyStorage(CONST.KEY_ALIASES.PUBLIC_KEY);

export { PrivateKeyStorage, PublicKeyStorage };
