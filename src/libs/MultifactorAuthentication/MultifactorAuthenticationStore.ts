import * as SecureStore from "expo-secure-store";
import MultifactorAuthenticationValues from "./MultifactorAuthenticationValues";

const options = (key: string): SecureStore.SecureStoreOptions => {
  const isPrivateKey =
    key === MultifactorAuthenticationValues.KEY_ALIASES.PRIVATE_KEY;
  return {
    failOnDuplicate: isPrivateKey,
    requireAuthentication: isPrivateKey,
    askForAuthOnSave: isPrivateKey,
    keychainService: MultifactorAuthenticationValues.KEYCHAIN_SERVICE,
    keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    enableCredentialsAlternative: true,
  };
};

const MultifactorAuthenticationStore = {
  get: (key: string) => SecureStore.getItemAsync(key, options(key)),
  set: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value, options(key)),
  delete: (key: string) =>
    SecureStore.deleteItemAsync(key, {
      keychainService: MultifactorAuthenticationValues.KEYCHAIN_SERVICE,
    }),
  get supportedAuthentication() {
    return { biometrics: true, credentials: true };
  },
  authTypes: SecureStore.AUTH_TYPE,
};

export default MultifactorAuthenticationStore;
