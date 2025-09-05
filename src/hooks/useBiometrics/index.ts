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
import { Biometrics, BiometricsStatus } from "./types";

/**
 * Hook used to run the biometrics process and receive feedback.
 * For detailed documentation on the methods and properties see types file.
 */
function useBiometrics(): Biometrics {
  const [status, setStatus] = useState<boolean>(false);
  const [feedback, setFeedback] = useBiometricsFeedback();

  const refreshStatus = useCallback(() => {
    BiometricsPublicKeyStore.get().then((key) => {
      setStatus(!!key.value);
    });
  }, []);

  useEffect(refreshStatus, [refreshStatus]);

  const request = useCallback(() => {
    const { privateKey, publicKey } = generateKeyPair();

    return BiometricsPrivateKeyStore.set(privateKey)
      .then((privateKeyResult) => {
        if (!privateKeyResult.value) throw privateKeyResult;
        return Promise.all([
          privateKeyResult,
          BiometricsPublicKeyStore.set(publicKey),
        ]);
      })
      .then(([privateKeyResult, publicKeyResult]) => {
        if (!publicKeyResult.value) throw publicKeyResult;
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

        return setFeedback(authReason, CONST.BIOMETRICS.FEEDBACK_TYPE.KEY);
      })
      .catch((status) => {
        return setFeedback(status, CONST.BIOMETRICS.FEEDBACK_TYPE.KEY);
      });
  }, [refreshStatus, setFeedback]);

  const challenge = useCallback(
    (transactionID: string) => {
      const challenge = new BiometricsChallenge(transactionID);

      return challenge
        .request()
        .then((status) => {
          if (!status.value) throw status;
          return challenge.sign();
        })
        .then((signature) => {
          if (!signature.value) throw signature;
          return challenge.send();
        })
        .then((result) => {
          return setFeedback(result, CONST.BIOMETRICS.FEEDBACK_TYPE.CHALLENGE);
        })
        .catch((status) => {
          return setFeedback(status, CONST.BIOMETRICS.FEEDBACK_TYPE.CHALLENGE);
        })
        .finally(() => {
          refreshStatus();
        });
    },
    [refreshStatus, setFeedback],
  );

  const prompt = useCallback(
    (transactionID: string, disableAutoRun: boolean = false) => {
      if (!status) {
        return request().then((requestStatus) => {
          if (!requestStatus.value || disableAutoRun) return requestStatus;
          return challenge(transactionID);
        });
      }

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
export type { Biometrics };
