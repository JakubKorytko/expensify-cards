import { useCallback, useEffect, useState } from "react";
import { generateKeyPair } from "@libs/ED25519";
import {
  BiometricsPrivateKeyStore,
  BiometricsPublicKeyStore,
} from "@libs/BiometricsKeyStore";
import CONST from "@src/CONST";
import BiometricsChallenge from "@libs/BiometricsChallenge";
import useBiometricsFeedback from "./useBiometricsFeedback";
import { registerBiometrics } from "@libs/actions/Biometrics";
import type { Biometrics, BiometricsStatus } from "./types";

/**
 * Hook used to run the biometrics process and receive feedback.
 * For detailed documentation on the methods and properties see types file.
 */
function useBiometrics(): Biometrics {
  const [status, setStatus] = useState<boolean>(false);
  const [feedback, setFeedback] = useBiometricsFeedback();

  /**
   * We check whether the biometrics are configured by checking whether the public key is in the store.
   * This way user do not need to go through the authentication to check that as the public key does not require it.
   */
  const refreshStatus = useCallback(() => {
    BiometricsPublicKeyStore.get().then((key) => {
      setStatus(!!key.value);
    });
  }, []);

  useEffect(refreshStatus, [refreshStatus]);

  const request = useCallback(() => {
    const { privateKey, publicKey } = generateKeyPair();

    /** Save generated key to the store */
    return BiometricsPrivateKeyStore.set(privateKey)
      .then((privateKeyResult) => {
        const privateKeyExists =
          privateKeyResult.reason === "biometrics.reason.expoErrors.keyExists";

        if (!privateKeyResult.value) {
          if (privateKeyExists && !status) {
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
        return Promise.all([privateKeyResult, registerBiometrics(publicKey)]);
      })
      .then(([privateKeyResult, { httpCode, reason }]) => {
        const successMessage = "biometrics.reason.success.keyPairGenerated";

        const isCallSuccessful = httpCode === 200;

        const authReason: BiometricsStatus<boolean> = {
          value: isCallSuccessful,
          reason: isCallSuccessful ? successMessage : reason,
          type: privateKeyResult.type,
        };

        refreshStatus();

        /** Everything cool, let's save and return the feedback */
        return setFeedback(authReason, CONST.BIOMETRICS.FEEDBACK_TYPE.KEY);
      })
      .catch((status) => {
        /** Oops, there was a problem, let the user know why */
        return setFeedback(status, CONST.BIOMETRICS.FEEDBACK_TYPE.KEY);
      });
  }, [refreshStatus, setFeedback, status]);

  const challenge = useCallback(
    (transactionID: string) => {
      const challenge = new BiometricsChallenge(transactionID);

      return (
        challenge
          /** Ask for the challenge */
          .request()
          .then((status) => {
            if (!status.value) throw status;
            /** If it is ok, sign it */
            return challenge.sign();
          })
          .then((signature) => {
            if (!signature.value) throw signature;
            /** Signed correctly? Send it to verify */
            return challenge.send();
          })
          .then((result) => {
            refreshStatus();
            /** Everything ok, let's return the feedback */
            return setFeedback(
              result,
              CONST.BIOMETRICS.FEEDBACK_TYPE.CHALLENGE,
            );
          })
          .catch((status) => {
            refreshStatus();
            /** Oops, something went wrong, let's return the feedback */
            return setFeedback(
              status,
              CONST.BIOMETRICS.FEEDBACK_TYPE.CHALLENGE,
            );
          })
      );
    },
    [refreshStatus, setFeedback],
  );

  const prompt = useCallback(
    (transactionID: string, disableAutoRun: boolean = false) => {
      /** Biometrics is not configured, let's do that first */
      if (!status) {
        /** Run the setup method */
        return request().then((requestStatus) => {
          if (!requestStatus.value || disableAutoRun) return requestStatus;
          /** Setup was successful and auto run was not disabled, let's run the challenge right away */
          return challenge(transactionID);
        });
      }

      /** Biometrics is configured already, let's do the challenge logic */
      return challenge(transactionID);
    },
    [challenge, request, status],
  );

  return {
    request,
    challenge,
    feedback,
    status,
    prompt,
  };
}

export default useBiometrics;
