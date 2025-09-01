import { useCallback, useMemo, useRef, useState } from "react";
import useLocalize from "@/base/useLocalize";
import CONST from "@src/CONST";
import {
  AuthReturnValue,
  Feedback,
  FeedbackKeyType,
  AuthType,
  SetFeedback,
} from "@src/types";

const getAuthTypeName = <T>(
  returnValue: AuthReturnValue<T>,
): AuthType["NAME"] | undefined =>
  Object.values(CONST.BIOMETRICS.AUTH_TYPE).find(
    (authType) => authType.CODE === returnValue.type,
  )?.NAME;

export default function useBiometricsFeedback(): [Feedback, SetFeedback] {
  const { translate } = useLocalize();

  const emptyAuth: AuthReturnValue<boolean> = useMemo(
    () => ({
      reason: "biometrics.reason.generic.notRequested",
      message: translate("biometrics.reason.generic.notRequested"),
      value: false,
    }),
    [translate],
  );

  const [challenge, setChallenge] = useState(emptyAuth);
  const [key, setKey] = useState(emptyAuth);
  const lastAction = useRef<FeedbackKeyType>(
    CONST.BIOMETRICS.FEEDBACK_TYPE.NONE,
  );

  const createFeedback = useCallback(
    (authData: AuthReturnValue<boolean>, authorize?: boolean) => {
      const { reason, value } = authData;
      const typeName = getAuthTypeName(authData);

      const message = translate(reason);
      const reasonMessage = value ? typeName : message;
      const statusMessage = `biometrics.feedbackMessage.${value ? "success" : "failed"}`;

      return {
        ...authData,
        message: translate(statusMessage, authorize, reasonMessage),
        typeName,
      };
    },
    [translate],
  );

  const setFeedback: SetFeedback = useCallback(
    (authData, type) => {
      const isChallengeType = type === CONST.BIOMETRICS.FEEDBACK_TYPE.CHALLENGE;
      const createdFeedback = createFeedback(authData, isChallengeType);

      if (isChallengeType) {
        setChallenge(createdFeedback);
      } else {
        setKey(createdFeedback);
      }

      lastAction.current = type;
      return createdFeedback;
    },
    [createFeedback],
  );

  const feedback = useMemo(() => {
    const lastActionMap = {
      [CONST.BIOMETRICS.FEEDBACK_TYPE.KEY]: key,
      [CONST.BIOMETRICS.FEEDBACK_TYPE.CHALLENGE]: challenge,
      [CONST.BIOMETRICS.FEEDBACK_TYPE.NONE]: emptyAuth,
    };

    const { message } = lastActionMap[lastAction.current];

    return {
      challenge,
      key,
      message: message ?? "biometrics.reason.generic.notRequested",
    };
  }, [challenge, emptyAuth, key]);

  return [feedback, setFeedback];
}
