import * as SecureStore from "expo-secure-store";
import CONST from "@src/CONST";
import type { TranslationPaths } from "@src/languages/types";
import type { ValueOf } from "type-fest";
import decodeMultiFactorAuthenticationExpoMessage from "@libs/MultiFactorAuthentication/decodeMultiFactorAuthenticationExpoMessage";
import { MultiFactorAuthenticationPartialStatus } from "@hooks/useMultiAuthentication/types";

/**
 * Provides secure storage for multifactorial authentication keys with authentication controls.
 * Handles CRUD operations on the SecureStore with error handling and feedback support.
 * Returns standardized response objects containing operation status, reason messages, and auth type.
 *
 * The class is used internally to create two specialized stores:
 * - MultiFactorAuthenticationPrivateKeyStore: Requires biometric/credential auth for access
 * - MultiFactorAuthenticationPublicKeyStore: Allows access without authentication
 */
class MultiFactorAuthenticationKeyStore {
  constructor(
    private readonly key: ValueOf<
      typeof CONST.MULTI_FACTOR_AUTHENTICATION.KEY_ALIASES
    >,
  ) {}

  /**
   * SecureStore options that control authentication requirements.
   * Private keys require multifactorial authentication/credential auth, while public keys don't.
   * Also configures keychain access and credential alternatives.
   */
  private get options(): SecureStore.SecureStoreOptions {
    const isPrivateKey =
      this.key === CONST.MULTI_FACTOR_AUTHENTICATION.KEY_ALIASES.PRIVATE_KEY;
    return {
      failOnDuplicate: isPrivateKey,
      requireAuthentication: isPrivateKey,
      askForAuthOnSave: isPrivateKey,
      keychainService: CONST.MULTI_FACTOR_AUTHENTICATION.KEYCHAIN_SERVICE,
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      enableCredentialsAlternative: true,
    };
  }

  /**
   * Checks device support for different authentication methods.
   * Returns whether biometrics authentication and device credentials can be used.
   */
  public get supportedAuthentication() {
    return {
      biometrics: SecureStore.canUseBiometricAuthentication(),
      credentials: SecureStore.canUseDeviceCredentialsAuthentication(),
    };
  }

  /**
   * Stores a value in SecureStore. For private keys, this will trigger an auth prompt.
   * Returns success/failure status with a reason message and auth type used.
   */
  public async set(
    value: string,
  ): Promise<MultiFactorAuthenticationPartialStatus<boolean, true>> {
    try {
      const type = await SecureStore.setItemAsync(
        this.key,
        value,
        this.options,
      );
      return {
        value: true,
        reason:
          "multiFactorAuthentication.reason.success.keySavedInSecureStore" as TranslationPaths,
        type,
      };
    } catch (error) {
      return {
        value: false,
        reason: decodeMultiFactorAuthenticationExpoMessage(
          error,
          "multiFactorAuthentication.reason.error.unableToSaveKey",
        ),
      };
    }
  }

  /**
   * Removes a value from SecureStore.
   * Returns success/failure status with a reason message.
   */
  public async delete(): Promise<
    MultiFactorAuthenticationPartialStatus<boolean, true>
  > {
    try {
      await SecureStore.deleteItemAsync(this.key, {
        keychainService: CONST.MULTI_FACTOR_AUTHENTICATION.KEYCHAIN_SERVICE,
      });
      return {
        value: true,
        reason:
          "multiFactorAuthentication.reason.success.keyDeletedFromSecureStore" as TranslationPaths,
      };
    } catch (error) {
      return {
        value: false,
        reason: decodeMultiFactorAuthenticationExpoMessage(
          error,
          "multiFactorAuthentication.reason.error.unableToDelete",
        ),
      };
    }
  }

  /**
   * Retrieves a value from SecureStore. For private keys, this will trigger an auth prompt.
   * Returns the stored value (or null) with a reason message and auth type used.
   */
  public async get(): Promise<
    MultiFactorAuthenticationPartialStatus<string | null, true>
  > {
    try {
      const [key, type] = await SecureStore.getItemAsync(
        this.key,
        this.options,
      );
      return {
        value: key,
        reason:
          `multiFactorAuthentication.reason.success.${key ? "keyRetrievedFromSecureStore" : "keyNotInSecureStore"}` as TranslationPaths,
        type,
      };
    } catch (error) {
      return {
        value: null,
        reason: decodeMultiFactorAuthenticationExpoMessage(
          error,
          "multiFactorAuthentication.reason.error.unableToRetrieve",
        ),
      };
    }
  }
}

/**
 * Secure storage for the private key that requires multifactorial authentication/credential authentication.
 * All operations (get/set) will trigger an authentication prompt.
 */
const MultiFactorAuthenticationPrivateKeyStore =
  new MultiFactorAuthenticationKeyStore(
    CONST.MULTI_FACTOR_AUTHENTICATION.KEY_ALIASES.PRIVATE_KEY,
  );

/**
 * Storage for the public key that can be accessed without authentication.
 * Provides the same interface as MultiFactorAuthenticationPrivateKeyStore but without auth requirements.
 */
const MultiFactorAuthenticationPublicKeyStore =
  new MultiFactorAuthenticationKeyStore(
    CONST.MULTI_FACTOR_AUTHENTICATION.KEY_ALIASES.PUBLIC_KEY,
  );

export {
  MultiFactorAuthenticationPrivateKeyStore,
  MultiFactorAuthenticationPublicKeyStore,
};
