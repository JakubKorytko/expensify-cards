import * as SecureStore from "expo-secure-store";
import CONST from "./const";
import type { AuthReturnValue, KeyType } from "./types";
import Reason from "./Reason";

class KeyStorage {
  constructor(private readonly key: KeyType) {
    this.key = key;
  }

  private get options(): SecureStore.SecureStoreOptions {
    const isPrivateKey = this.key === CONST.KEY_ALIASES.PRIVATE_KEY;

    return {
      failOnDuplicate: isPrivateKey,
      requireAuthentication: isPrivateKey,
      authOnEveryAction: isPrivateKey,
      keychainService: CONST.KEYCHAIN_SERVICE,
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      enableCredentialsAlternative: true,
    };
  }

  async set(value: string): Promise<AuthReturnValue<boolean>> {
    try {
      return {
        value: true,
        reason: Reason.TPath("biometrics.reason.success.keySavedInSecureStore"),
        type: await SecureStore.setItemAsync(this.key, value, this.options),
      };
    } catch (error) {
      return {
        value: false,
        reason:
          Reason.ExpoError(error) ||
          Reason.TPath("biometrics.reason.error.unableToSaveKey"),
      };
    }
  }

  async delete(): Promise<AuthReturnValue<boolean>> {
    try {
      await SecureStore.deleteItemAsync(this.key, {
        keychainService: CONST.KEYCHAIN_SERVICE,
      });

      return {
        value: true,
        reason: Reason.TPath(
          "biometrics.reason.success.keyDeletedFromSecureStore",
        ),
      };
    } catch (error) {
      return {
        value: false,
        reason: Reason.ExpoError(error),
      };
    }
  }

  async get(): Promise<AuthReturnValue<string | null>> {
    try {
      const [retrievedKey, authType] = await SecureStore.getItemAsync(
        this.key,
        this.options,
      );

      const reason = !!retrievedKey
        ? Reason.TPath("biometrics.reason.success.keyRetrievedFromSecureStore")
        : Reason.TPath("biometrics.reason.success.keyNotInSecureStore");

      return {
        value: retrievedKey,
        reason,
        type: authType,
      };
    } catch (error) {
      return {
        value: null,
        reason:
          Reason.ExpoError(error) ||
          Reason.TPath("biometrics.reason.error.unableToRetrieve"),
      };
    }
  }
}

const PrivateKeyStorage = new KeyStorage(CONST.KEY_ALIASES.PRIVATE_KEY);
const PublicKeyStorage = new KeyStorage(CONST.KEY_ALIASES.PUBLIC_KEY);

export { PrivateKeyStorage, PublicKeyStorage };
