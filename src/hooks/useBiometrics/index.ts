import { useCallback, useEffect, useState } from "react";
import { generateKeyPair } from "@libs/ED25519";
import {
  PrivateKeyStorage,
  PublicKeyStorage,
} from "@libs/BiometricsKeyStorage";
import type { AuthReturnValue, Biometrics } from "@src/types";
import CONST from "@src/CONST";
import BiometricsChallenge from "@libs/BiometricsChallenge";
import useBiometricsFeedback from "./useBiometricsFeedback";
import { registerBiometrics } from "@libs/actions/Biometrics";

function useBiometrics(): Biometrics {
  const [status, setStatus] = useState<boolean>(false);
  const [feedback, setFeedback] = useBiometricsFeedback();

  const refreshStatus = useCallback(() => {
    PublicKeyStorage.get().then((key) => {
      setStatus(!!key.value);
    });
  }, []);

  useEffect(refreshStatus, [refreshStatus]);

  const request = useCallback(() => {
    const { privateKey, publicKey } = generateKeyPair();

    return PrivateKeyStorage.set(privateKey)
      .then((privateKeyResult) => {
        if (!privateKeyResult.value) throw privateKeyResult;
        return Promise.all([privateKeyResult, PublicKeyStorage.set(publicKey)]);
      })
      .then(([privateKeyResult, publicKeyResult]) => {
        if (!publicKeyResult.value) throw publicKeyResult;
        return Promise.all([privateKeyResult, registerBiometrics(publicKey)]);
      })
      .then(([privateKeyResult, { httpCode, reason }]) => {
        const successMessage = "biometrics.reason.success.keyPairGenerated";

        const isCallSuccessful = httpCode === 200;

        const authReason: AuthReturnValue<boolean> = {
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
    (transactionID: string) => {
      if (!status) {
        return request().then((requestStatus) => {
          if (!requestStatus.value) return requestStatus;
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
