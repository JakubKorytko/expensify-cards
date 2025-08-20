import * as SecureStore from "expo-secure-store";
import {
  authReasonCodes,
  AuthReturnValue,
  PRIVATE_KEY,
  PUBLIC_KEY,
} from "@/scripts/authCodes";
import Logger from "@/scripts/Logger";

function decodeExpoErrorCode(error: unknown) {
  const errorString = String(error);
  if (!errorString.includes("Caused by:")) {
    return errorString;
  }
  return (
    errorString.split("Caused by:").slice(1).join(";") ?? errorString
  ).trim();
}

async function setKey(
  key: string,
  value: string,
): Promise<AuthReturnValue<boolean>> {
  try {
    SecureStore.canUseBiometricAuthentication();

    const authType = await SecureStore.setItemAsync(key, value, {
      requireAuthentication: key === PRIVATE_KEY,
      failOnDuplicate: key === PRIVATE_KEY,
      keychainService: "Expensify",
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    });

    return {
      value: true,
      reason: authReasonCodes.keySavedInSecureStore,
      authType,
    };
  } catch (error) {
    return {
      value: false,
      reason: decodeExpoErrorCode(error),
    };
  }
}

async function getKey(key: string): Promise<AuthReturnValue<string | null>> {
  try {
    const [retrievedKey, authType] = await SecureStore.getItemAsync(key, {
      requireAuthentication: key === PRIVATE_KEY,
      keychainService: "Expensify",
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    });

    return {
      value: retrievedKey,
      reason: !!retrievedKey
        ? authReasonCodes.keyRetrievedFromSecureStore
        : `${authReasonCodes.emptyEntryForTheKey} ${key}`,
      authType,
    };
  } catch (error) {
    return {
      value: null,
      reason: decodeExpoErrorCode(error),
    };
  }
}

async function revokeKey(key: string): Promise<AuthReturnValue<boolean>> {
  try {
    await SecureStore.deleteItemAsync(key, {
      keychainService: "Expensify",
    });
    return {
      value: true,
      reason: authReasonCodes.keyDeletedSuccessfully,
    };
  } catch (error) {
    return {
      value: false,
      reason: decodeExpoErrorCode(error),
    };
  }
}

class KeyStorage {
  key: typeof PRIVATE_KEY | typeof PUBLIC_KEY;

  constructor(type: "public" | "private") {
    this.key = type === "public" ? PUBLIC_KEY : PRIVATE_KEY;
  }

  async set(value: string): Promise<AuthReturnValue<boolean>> {
    const result = await setKey(this.key, value);

    if (result.value) {
      Logger.m("Saved key", this.key, "with value", value, "to SecureStore");
    } else {
      Logger.w(
        "Unable to save key",
        this.key,
        "with value",
        value,
        "to SecureStore",
      );
    }

    return result;
  }

  async delete(): Promise<AuthReturnValue<boolean>> {
    const result = await revokeKey(this.key);
    if (result.value) {
      Logger.m("Deleted Key", this.key, "from SecureStore");
    } else {
      Logger.w("Unable to delete key", this.key, "from SecureStore");
    }

    return result;
  }

  async get(): Promise<AuthReturnValue<string | null>> {
    const key = await getKey(this.key);

    if (key.value) {
      Logger.m(
        "Retrieved Key",
        this.key,
        "with value",
        key.value,
        "from SecureStore",
      );
    } else {
      Logger.w("Unable to retrieve key", this.key, "from SecureStore");
    }

    return key;
  }
}

const PrivateKeyStorage = new KeyStorage("private");
const PublicKeyStorage = new KeyStorage("public");

export { PrivateKeyStorage, PublicKeyStorage };
