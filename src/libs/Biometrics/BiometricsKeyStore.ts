import * as SecureStore from "expo-secure-store";
import CONST from "@src/CONST";
import type { TranslationPaths } from "@src/languages/types";
import type { ValueOf } from "type-fest";
import decodeBiometricsExpoMessage from "@libs/Biometrics/decodeBiometricsExpoMessage";
import { BiometricsPartialStatus } from "@hooks/useBiometricsStatus/types";

/**
 * Proxy-like class with CRUD methods to access the SecureStore
 * Every method handles thrown errors and wraps the return value with translation path reason.
 * It also has pre-defined options passed as an argument when accessing the store.
 *
 * This class is not exported, instead 2 objects are created & exported (BiometricsPrivateKeyStore and BiometricsPublicKeyStore).
 * This way we can skip authentication if we access the public key and require it for the private one.
 */
class BiometricsKeyStore {
  constructor(
    private readonly key: ValueOf<typeof CONST.BIOMETRICS.KEY_ALIASES>,
  ) {
    this.key = key;
  }

  /** Pre-defined options for setter and getter with a check whether it should require authentication */
  private get options(): SecureStore.SecureStoreOptions {
    const isPrivateKey = this.key === CONST.BIOMETRICS.KEY_ALIASES.PRIVATE_KEY;

    return {
      failOnDuplicate: isPrivateKey,
      requireAuthentication: isPrivateKey,
      askForAuthOnSave: isPrivateKey,
      keychainService: CONST.BIOMETRICS.KEYCHAIN_SERVICE,
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      enableCredentialsAlternative: true,
    };
  }

  /** Check what authentication types are supported on the current device */
  public get supportedAuthentication() {
    return {
      biometrics: SecureStore.canUseBiometricAuthentication(),
      credentials: SecureStore.canUseDeviceCredentialsAuthentication(),
    };
  }

  /** IMPORTANT: Using this method on BiometricsPrivateKeyStore object will display authentication prompt */
  public set(value: string): Promise<BiometricsPartialStatus<boolean>> {
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

  public delete(): Promise<BiometricsPartialStatus<boolean>> {
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

  /** IMPORTANT: Using this method on BiometricsPrivateKeyStore object will display authentication prompt */
  public get(): Promise<BiometricsPartialStatus<string | null>> {
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

/**
 * Store for the biometrics private key.
 *
 * IMPORTANT: Setting or getting a value will display authentication prompt
 */
const BiometricsPrivateKeyStore = new BiometricsKeyStore(
  CONST.BIOMETRICS.KEY_ALIASES.PRIVATE_KEY,
);

/**
 * Store for the biometrics public key.
 * Using any of its methods do not require authentication.
 */
const BiometricsPublicKeyStore = new BiometricsKeyStore(
  CONST.BIOMETRICS.KEY_ALIASES.PUBLIC_KEY,
);

export { BiometricsPrivateKeyStore, BiometricsPublicKeyStore };
