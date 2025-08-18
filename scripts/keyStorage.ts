import * as SecureStore from "expo-secure-store";
import {
  authReasonCodes,
  AuthReturnValue,
  PRIVATE_KEY,
  PUBLIC_KEY,
} from "@/scripts/authCodes";

function decodeExpoErrorCode(error: unknown) {
  const errorString = String(error);
  return (
    errorString.split("Caused by:").slice(1).join(";") ?? errorString
  ).trim();
}

async function setKey(
  key: string,
  value: string,
): Promise<AuthReturnValue<boolean>> {
  try {
    const authType = await SecureStore.setItemAsync(key, value, {
      requireAuthentication: key === PRIVATE_KEY,
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
    const [retrievedKey, authType] = await SecureStore.getItemAsync(key);

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
    await SecureStore.deleteItemAsync(key);
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
    const currentKey = await getKey(this.key);

    if (currentKey.value) {
      return {
        value: false,
        reason: authReasonCodes.keyExists,
      };
    }

    const result = await setKey(this.key, value);

    if (result.value) {
      console.log("Saved key", this.key, "with value", value, "to SecureStore");
    } else {
      console.log(
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
      console.log("Deleted Key", this.key, "from SecureStore");
    } else {
      console.log("Unable to delete key", this.key, "from SecureStore");
    }

    return result;
  }

  async get(): Promise<AuthReturnValue<string | null>> {
    const key = await getKey(this.key);

    if (key.value) {
      console.log(
        "Retrieved Key",
        this.key,
        "with value",
        key.value,
        "from SecureStore",
      );
    } else {
      console.log("Unable to retrieve key", this.key, "from SecureStore");
    }

    return key;
  }
}

const PrivateKeyStorage = new KeyStorage("private");
const PublicKeyStorage = new KeyStorage("public");

export { PrivateKeyStorage, PublicKeyStorage };
