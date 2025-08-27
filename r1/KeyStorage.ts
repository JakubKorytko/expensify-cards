import * as SecureStore from "expo-secure-store";
import CONST from "./const";
import type { AuthReturnValue, KeyType } from "./types";
import { ReasonPlain, ReasonTranslation } from "./Reason";

function decodeExpoErrorCode(error: unknown) {
  const errorString = String(error);
  const errorArray = errorString.split(CONST.MISC.EXPO_ERROR_SEPARATOR);

  return new ReasonPlain(
    errorArray.length <= 1 ? errorString : errorArray.slice(1).join(";").trim(),
  );
}

class KeyStorage {
  key: KeyType;

  constructor(type: KeyType) {
    this.key = type;
  }

  get options() {
    return {
      failOnDuplicate: this.key === CONST.KEY_ALIASES.PRIVATE_KEY,
      requireAuthentication: this.key === CONST.KEY_ALIASES.PRIVATE_KEY,
      authOnEveryAction: this.key === CONST.KEY_ALIASES.PRIVATE_KEY,
      keychainService: CONST.KEYCHAIN_SERVICE,
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      enableCredentialsAlternative: true,
    };
  }

  async set(value: string): Promise<AuthReturnValue<boolean>> {
    try {
      return {
        value: true,
        reason: new ReasonTranslation(
          "biometrics.reason.success.keySavedInSecureStore",
        ),
        type: await SecureStore.setItemAsync(this.key, value, this.options),
      };
    } catch (error) {
      return {
        value: false,
        reason:
          decodeExpoErrorCode(error) ||
          "biometrics.reason.error.unableToSaveKey",
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
        reason: new ReasonTranslation(
          "biometrics.reason.success.keyDeletedFromSecureStore",
        ),
      };
    } catch (error) {
      return {
        value: false,
        reason: decodeExpoErrorCode(error),
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
        ? new ReasonTranslation(
            "biometrics.reason.success.keyRetrievedFromSecureStore",
          )
        : new ReasonTranslation(
            "biometrics.reason.success.keyNotInSecureStore",
          );

      return {
        value: retrievedKey,
        reason,
        type: authType,
      };
    } catch (error) {
      return {
        value: null,
        reason:
          decodeExpoErrorCode(error) ||
          new ReasonTranslation("biometrics.reason.error.unableToRetrieve"),
      };
    }
  }
}

const PrivateKeyStorage = new KeyStorage(CONST.KEY_ALIASES.PRIVATE_KEY);
const PublicKeyStorage = new KeyStorage(CONST.KEY_ALIASES.PUBLIC_KEY);

export { PrivateKeyStorage, PublicKeyStorage };
