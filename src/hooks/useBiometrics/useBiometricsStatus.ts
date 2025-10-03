import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BiometricsPrivateKeyStore,
  BiometricsPublicKeyStore,
} from "@libs/Biometrics/BiometricsKeyStore";
import { generateKeyPair } from "@libs/ED25519";
import { requestValidateCodeAction } from "@libs/actions/User";
import CONST from "@src/CONST";
import { registerBiometrics } from "@libs/actions/Biometrics";
import {
  BiometricsStatus,
  BiometricsStepWithStatus,
} from "@hooks/useBiometrics/types";
import { useSingleBiometricsFeedback } from "@hooks/useBiometrics/useBiometricsFeedback";

const emptyBiometricsFeedback = {
  requiredFactorForNextStep: undefined,
  wasRecentStepSuccessful: undefined,
  isBiometryConfigured: false,
  isRequestFulfilled: true,
};

function useBiometricsStatus() {
  /** Whether the biometrics was set up correctly and the device is able to authenticate using it. */
  const [feedback, setFeedback] =
    useSingleBiometricsFeedback<BiometricsStepWithStatus>(
      emptyBiometricsFeedback,
      CONST.BIOMETRICS.ACTION_TYPE.KEY,
      (prevState) => !!prevState.value.wasRecentStepSuccessful,
    );

  const doesDeviceSupportBiometrics = useMemo(() => {
    const { biometrics, credentials } =
      BiometricsPublicKeyStore.supportedAuthentication;

    return biometrics || credentials;
  }, []);

  /**
   * We check whether the biometrics are configured by checking whether the public key is in the store.
   * This way user do not need to go through the authentication to check that as the public key does not require it.
   */
  const refreshStatus = useCallback(() => {
    BiometricsPublicKeyStore.get().then((key) => {
      setFeedback((prevFeedback) => ({
        ...prevFeedback,
        value: {
          ...prevFeedback.value,
          isBiometryConfigured: !!key.value,
        },
      }));
    });
  }, [setFeedback]);

  /**
   * Helper method to remove both keys from SecureStore
   * Called when the keys are stored on the device but not on the backend.
   */
  const resetSetup = useCallback(() => {
    return BiometricsPrivateKeyStore.delete()
      .then(BiometricsPublicKeyStore.delete)
      .then(refreshStatus);
  }, [refreshStatus]);

  /**
   * Runs the biometrics process setup.
   *
   * If the biometrics are configured for the first time or get re-configured, a validateCode should be provided.
   *
   * The second parameter indicates whether the registration is chained with the authorization process.
   * Setting it to true will return private key saving status with the key value instead of the registration status.
   *
   * IMPORTANT: Using this method will display authentication prompt
   */
  const register = useCallback(
    ({
      validateCode,
      chainedWithAuthorization = false,
    }: {
      validateCode?: number;
      chainedWithAuthorization?: boolean;
    }) => {
      if (!doesDeviceSupportBiometrics) {
        return Promise.resolve(
          setFeedback((prevFeedback) => ({
            ...prevFeedback,
            reason: "biometrics.reason.error.biometricsNotSupported",
            value: {
              requiredFactorForNextStep: undefined,
              isRequestFulfilled: true,
              isBiometryConfigured: false,
              wasRecentStepSuccessful: false,
            },
          })),
        );
      }

      if (!validateCode) {
        requestValidateCodeAction();
        return Promise.resolve(
          setFeedback((prevFeedback) => ({
            ...prevFeedback,
            value: {
              ...prevFeedback.value,
              wasRecentStepSuccessful: false,
              isRequestFulfilled: false,
              requiredFactorForNextStep:
                CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE,
            },
            reason: "biometrics.reason.error.validateCodeMissing",
          })),
        );
      }

      const { privateKey, publicKey } = generateKeyPair();

      /** Save generated key to the store */
      return BiometricsPrivateKeyStore.set(privateKey)
        .then((privateKeyResult) => {
          const privateKeyExists =
            privateKeyResult.reason ===
            "biometrics.reason.expoErrors.keyExists";

          if (!privateKeyResult.value) {
            if (privateKeyExists && !feedback.value.isBiometryConfigured) {
              /**
               * If the private key exists, but the public one does not, we end up having the interaction blocked.
               * We remove the private key and stop the execution to unblock the auth process.
               *
               * This may be handled by getting the public key from BE,
               * but it is not worth doing as this should never actually happen in the real app.
               */
              BiometricsPrivateKeyStore.delete().then(() => {
                throw privateKeyResult;
              });
            }
            throw privateKeyResult;
          }
          /** If it was saved successfully, save public one as well */
          return Promise.all([
            privateKeyResult,
            BiometricsPublicKeyStore.set(publicKey),
          ]);
        })
        .then(([privateKeyResult, publicKeyResult]) => {
          if (!publicKeyResult.value) throw publicKeyResult;
          /** If both keys were saved call the API to register biometrics */
          return Promise.all([
            privateKeyResult,
            registerBiometrics(publicKey, validateCode),
          ]);
        })
        .then(([privateKeyResult, { httpCode, reason }]) => {
          const successMessage = "biometrics.reason.success.keyPairGenerated";

          const isCallSuccessful = String(httpCode).startsWith("2");

          // A co jesli istnieje po prostu? Wtedy nie powinnismy usuwac raczej
          if (!isCallSuccessful) {
            BiometricsPrivateKeyStore.delete();
            BiometricsPublicKeyStore.delete();
          }

          const authReason: BiometricsStatus<boolean> = {
            value: isCallSuccessful,
            reason: isCallSuccessful ? successMessage : reason,
            type: privateKeyResult.type,
          };

          /** Everything cool, let's save and return the feedback */
          const feedback = setFeedback((prevFeedback) => ({
            ...authReason,
            value: {
              ...prevFeedback.value,
              wasRecentStepSuccessful: authReason.value,
            },
          }));

          /**
           * If the registration is chained with the authorization process,
           * return the private key instead of the registration status
           */
          if (chainedWithAuthorization && isCallSuccessful) {
            return {
              ...privateKeyResult,
              value: privateKey,
            } as BiometricsStatus<string>;
          }

          return feedback;
        })
        .catch((status) => {
          /** Oops, there was a problem, let the user know why */
          return setFeedback((prevFeedback) => ({
            ...prevFeedback,
            ...status,
            value: {
              ...prevFeedback.value,
              wasRecentStepSuccessful: false,
              isRequestFulfilled: true,
              requiredFactorForNextStep: undefined,
            },
          }));
        })
        .finally(() => {
          refreshStatus();
          if (!chainedWithAuthorization) {
            return setFeedback((prevFeedback) => ({
              ...prevFeedback,
              value: {
                ...prevFeedback.value,
                requiredFactorForNextStep: undefined,
                isRequestFulfilled: true,
              },
            }));
          }
        });
    },
    [
      doesDeviceSupportBiometrics,
      feedback.value.isBiometryConfigured,
      refreshStatus,
      setFeedback,
    ],
  );

  const fulfill = useCallback(() => {
    return setFeedback((prevFeedback) => ({
      ...prevFeedback,
      value: {
        ...prevFeedback.value,
        isRequestFulfilled: true,
        requiredFactorForNextStep: undefined,
        wasRecentStepSuccessful:
          !prevFeedback.value.requiredFactorForNextStep &&
          prevFeedback.value.wasRecentStepSuccessful,
      },
    }));
  }, [setFeedback]);

  useEffect(refreshStatus, [refreshStatus]);

  return {
    ...feedback.value,
    feedback,
    doesDeviceSupportBiometrics,
    register,
    resetSetup,
    fulfill,
  };
}

export default useBiometricsStatus;
