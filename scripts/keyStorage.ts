import * as SecureStore from "expo-secure-store";

async function setKey(key: string, value: string) {
  await SecureStore.setItemAsync(key, value, {
    requireAuthentication: key === "3DS_SCA_KEY_PRIVATE",
  });
}

async function getKey(key: string) {
  return await SecureStore.getItemAsync(key);
}

async function revokeKey(key: string) {
  await SecureStore.deleteItemAsync(key);
}

class KeyStorage {
  key: "3DS_SCA_KEY_PRIVATE" | "3DS_SCA_KEY_PUBLIC";

  constructor(type: "public" | "private") {
    this.key = type === "public" ? "3DS_SCA_KEY_PUBLIC" : "3DS_SCA_KEY_PRIVATE";
  }

  async set(value: string) {
    const currentKey = await getKey(this.key);
    if (currentKey) {
      return false;
    }
    await setKey(this.key, value);
    return true;
  }

  async delete() {
    await revokeKey(this.key);
  }

  async get() {
    return await getKey(this.key);
  }
}

const PrivateKeyStorage = new KeyStorage("private");
const PublicKeyStorage = new KeyStorage("public");

export { PrivateKeyStorage, PublicKeyStorage };
