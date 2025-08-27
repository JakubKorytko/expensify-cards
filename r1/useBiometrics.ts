import { useCallback, useEffect, useState } from "react";
import API, { WRITE_COMMANDS } from "@/src/api";
import { generateKeyPair } from "./ED25519";
import { PrivateKeyStorage, PublicKeyStorage } from "./KeyStorage";
import type { AuthReturnValue, Biometrics } from "./types";
import CONST from "./const";
import Challenge from "./Challenge";
import useFeedback from "./useFeedback";
import { ReasonPlain, ReasonTranslation } from "./Reason";

function useBiometrics(): Biometrics {
  const [status, setStatus] = useState<boolean>(false);
  const [feedback, setFeedback] = useFeedback();

  const refreshStatus = useCallback(() => {
    PublicKeyStorage.get().then((key) => {
      setStatus(!!key.value);
    });
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const request = useCallback(async () => {
    const { privateKey, publicKey } = generateKeyPair();

    const setResult = await PrivateKeyStorage.set(privateKey);

    if (!setResult.value) {
      return setFeedback(setResult, CONST.FEEDBACK_TYPE.KEY);
    }

    const publicKeyResult = await PublicKeyStorage.set(publicKey);

    if (!publicKeyResult.value) {
      return setFeedback(publicKeyResult, CONST.FEEDBACK_TYPE.KEY);
    }

    const result = await API.write(WRITE_COMMANDS.REGISTER_BIOMETRICS, {
      publicKey,
    });

    const isCallSuccessful = result === true;

    const authReason: AuthReturnValue<boolean> = {
      value: isCallSuccessful,
      reason: isCallSuccessful
        ? new ReasonTranslation("biometrics.reason.success.keyPairGenerated")
        : result
          ? new ReasonPlain(result)
          : new ReasonTranslation("biometrics.reason.generic.apiError"),
      type: setResult.type,
    };

    refreshStatus();
    return setFeedback(authReason, CONST.FEEDBACK_TYPE.KEY);
  }, [refreshStatus, setFeedback]);

  const challenge = useCallback(
    async (transactionID: string) => {
      const challenge = new Challenge();

      const status = await challenge.request();

      if (!status.value) {
        refreshStatus();
        return setFeedback(status, CONST.FEEDBACK_TYPE.CHALLENGE);
      }

      const signature = await challenge.sign();
      if (!signature.value) {
        refreshStatus();
        return setFeedback(signature, CONST.FEEDBACK_TYPE.CHALLENGE);
      }

      const result = await challenge.send(transactionID);

      return setFeedback(result, CONST.FEEDBACK_TYPE.CHALLENGE);
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
