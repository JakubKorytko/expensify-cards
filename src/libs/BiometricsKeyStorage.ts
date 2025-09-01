import * as SecureStore from "expo-secure-store";
import CONST from "@src/CONST";
import type { AuthReturnValue, KeyType, TranslationPaths } from "@src/types";
import decodeBiometricsMessage from "./decodeBiometricsMessage";

class BiometricsKeyStorage {
  constructor(private readonly key: KeyType) {
    this.key = key;
  }

  private get options(): SecureStore.SecureStoreOptions {
    const isPrivateKey = this.key === CONST.BIOMETRICS.KEY_ALIASES.PRIVATE_KEY;

    return {
      failOnDuplicate: isPrivateKey,
      requireAuthentication: isPrivateKey,
      authOnEveryAction: isPrivateKey,
      keychainService: CONST.BIOMETRICS.KEYCHAIN_SERVICE,
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      enableCredentialsAlternative: true,
    };
  }

  public set(value: string): Promise<AuthReturnValue<boolean>> {
    return SecureStore.setItemAsync(this.key, value, this.options)
      .then((type) => ({
        value: true,
        reason:
          "biometrics.reason.success.keySavedInSecureStore" as TranslationPaths,
        type,
      }))
      .catch((error) => ({
        value: false,
        reason: decodeBiometricsMessage(
          CONST.BIOMETRICS.MESSAGE_SOURCE.SECURE_STORE,
          error,
          "biometrics.reason.error.unableToSaveKey",
        ),
      }));
  }

  public delete(): Promise<AuthReturnValue<boolean>> {
    return SecureStore.deleteItemAsync(this.key, {
      keychainService: CONST.BIOMETRICS.KEYCHAIN_SERVICE,
    })
      .then(() => ({
        value: true,
        reason:
          "biometrics.reason.success.keyDeletedFromSecureStore" as TranslationPaths,
      }))
      .catch((error) => ({
        value: false,
        reason: decodeBiometricsMessage(
          CONST.BIOMETRICS.MESSAGE_SOURCE.SECURE_STORE,
          error,
          "biometrics.reason.error.unableToDelete",
        ),
      }));
  }

  public get(): Promise<AuthReturnValue<string | null>> {
    return SecureStore.getItemAsync(this.key, this.options)
      .then(([key, type]) => ({
        value: key,
        reason:
          `biometrics.reason.success.${!!key ? "keyRetrievedFromSecureStore" : "keyNotInSecureStore"}` as TranslationPaths,
        type,
      }))
      .catch((error) => ({
        value: null,
        reason: decodeBiometricsMessage(
          CONST.BIOMETRICS.MESSAGE_SOURCE.SECURE_STORE,
          error,
          "biometrics.reason.error.unableToRetrieve",
        ),
      }));
  }
}

const PrivateKeyStorage = new BiometricsKeyStorage(
  CONST.BIOMETRICS.KEY_ALIASES.PRIVATE_KEY,
);
const PublicKeyStorage = new BiometricsKeyStorage(
  CONST.BIOMETRICS.KEY_ALIASES.PUBLIC_KEY,
);

export { PrivateKeyStorage, PublicKeyStorage };
