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

  public set(value: string): Promise<AuthReturnValue<boolean>> {
    return SecureStore.setItemAsync(this.key, value, this.options)
      .then((type) => ({
        value: true,
        reason: Reason.TPath("biometrics.reason.success.keySavedInSecureStore"),
        type,
      }))
      .catch((error) => ({
        value: false,
        reason:
          Reason.ExpoError(error) ||
          Reason.TPath("biometrics.reason.error.unableToSaveKey"),
      }));
  }

  public delete(): Promise<AuthReturnValue<boolean>> {
    return SecureStore.deleteItemAsync(this.key, {
      keychainService: CONST.KEYCHAIN_SERVICE,
    })
      .then(() => ({
        value: true,
        reason: Reason.TPath(
          "biometrics.reason.success.keyDeletedFromSecureStore",
        ),
      }))
      .catch((error) => ({
        value: false,
        reason: Reason.ExpoError(error),
      }));
  }

  public get(): Promise<AuthReturnValue<string | null>> {
    return SecureStore.getItemAsync(this.key, this.options)
      .then(([key, type]) => ({
        value: key,
        reason: Reason.TPath(
          `biometrics.reason.success.${!!key ? "keyRetrievedFromSecureStore" : "keyNotInSecureStore"}`,
        ),
        type,
      }))
      .catch((error) => ({
        value: null,
        reason:
          Reason.ExpoError(error) ||
          Reason.TPath("biometrics.reason.error.unableToRetrieve"),
      }));
  }
}

const PrivateKeyStorage = new KeyStorage(CONST.KEY_ALIASES.PRIVATE_KEY);
const PublicKeyStorage = new KeyStorage(CONST.KEY_ALIASES.PUBLIC_KEY);

export { PrivateKeyStorage, PublicKeyStorage };
