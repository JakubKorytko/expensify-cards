import { useCallback, useEffect, useState } from "react";
import API, { WRITE_COMMANDS } from "@/src/api";
import { generateKeyPair } from "./ED25519";
import { PrivateKeyStorage, PublicKeyStorage } from "./KeyStorage";
import type { AuthReturnValue, Biometrics } from "./types";
import CONST from "./const";
import Challenge from "./Challenge";
import useFeedback from "./useFeedback";
import Reason from "./Reason";

function useBiometrics(): Biometrics {
  const [status, setStatus] = useState<boolean>(false);
  const [feedback, setFeedback] = useFeedback();

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
          API.write(WRITE_COMMANDS.REGISTER_BIOMETRICS, {
            publicKey,
          }),
        ]);
      })
      .then(([privateKeyResult, { status, message }]) => {
        const reasonMessage = message
          ? Reason.Message(message)
          : Reason.TPath("biometrics.reason.generic.apiError");

        const successMessage = Reason.TPath(
          "biometrics.reason.success.keyPairGenerated",
        );

        const isCallSuccessful = status === 200;

        const authReason: AuthReturnValue<boolean> = {
          value: isCallSuccessful,
          reason: isCallSuccessful ? successMessage : reasonMessage,
          type: privateKeyResult.type,
        };

        refreshStatus();

        return setFeedback(authReason, CONST.FEEDBACK_TYPE.KEY);
      })
      .catch((status) => {
        return setFeedback(status, CONST.FEEDBACK_TYPE.KEY);
      });
  }, [refreshStatus, setFeedback]);

  const challenge = useCallback(
    (transactionID: string) => {
      const challenge = new Challenge(transactionID);

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
          return setFeedback(result, CONST.FEEDBACK_TYPE.CHALLENGE);
        })
        .catch((status) => {
          return setFeedback(status, CONST.FEEDBACK_TYPE.CHALLENGE);
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
