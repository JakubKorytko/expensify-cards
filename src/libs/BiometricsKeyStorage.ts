import * as SecureStore from "expo-secure-store";
import CONST from "@src/CONST";
import type { BiometricsStatus } from "@src/hooks/useBiometrics/types";
import { TranslationPaths, ValueOf } from "@/base/mockTypes";
import decodeBiometricsExpoMessage from "@libs/decodeBiometricsExpoMessage";

type KeyType = ValueOf<typeof CONST.BIOMETRICS.KEY_ALIASES>;

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

  public set(value: string): Promise<BiometricsStatus<boolean>> {
    return SecureStore.setItemAsync(this.key, value, this.options)
      .then((type) => ({
        value: true,
        reason:
          "biometrics.reason.success.keySavedInSecureStore" as TranslationPaths,
        type,
      }))
      .catch((error) => ({
        value: false,
        reason: decodeBiometricsExpoMessage(
          error,
          "biometrics.reason.error.unableToSaveKey",
        ),
      }));
  }

  public delete(): Promise<BiometricsStatus<boolean>> {
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
        reason: decodeBiometricsExpoMessage(
          error,
          "biometrics.reason.error.unableToDelete",
        ),
      }));
  }

  public get(): Promise<BiometricsStatus<string | null>> {
    return SecureStore.getItemAsync(this.key, this.options)
      .then(([key, type]) => ({
        value: key,
        reason:
          `biometrics.reason.success.${!!key ? "keyRetrievedFromSecureStore" : "keyNotInSecureStore"}` as TranslationPaths,
        type,
      }))
      .catch((error) => ({
        value: null,
        reason: decodeBiometricsExpoMessage(
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
