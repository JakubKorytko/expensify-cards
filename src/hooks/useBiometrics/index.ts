import { useCallback, useEffect, useState } from "react";
import API, { SIDE_EFFECT_REQUEST_COMMANDS } from "@/base/api";
import { generateKeyPair } from "@libs/ED25519";
import {
  PrivateKeyStorage,
  PublicKeyStorage,
} from "@libs/BiometricsKeyStorage";
import type { AuthReturnValue, Biometrics } from "@src/types";
import CONST from "@src/CONST";
import BiometricsChallenge from "@libs/BiometricsChallenge";
import useBiometricsFeedback from "./useBiometricsFeedback";
import Reason from "@libs/Reason";

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
        return Promise.all([
          privateKeyResult,
          API.makeRequestWithSideEffects(
            SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_BIOMETRICS,
            {
              publicKey,
            },
            {},
          ),
        ]);
      })
      .then(([privateKeyResult, { jsonCode, message }]) => {
        const reasonMessage = message
          ? Reason.Message(message)
          : Reason.TPath("biometrics.reason.generic.apiError");

        const successMessage = Reason.TPath(
          "biometrics.reason.success.keyPairGenerated",
        );

        const isCallSuccessful = jsonCode === 200;

        const authReason: AuthReturnValue<boolean> = {
          value: isCallSuccessful,
          reason: isCallSuccessful ? successMessage : reasonMessage,
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

  return {
    request,
    challenge,
    feedback,
    status,
  };
}

export default useBiometrics;
export type { Biometrics };
