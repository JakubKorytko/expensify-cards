import { useCallback, useMemo, useRef, useState } from "react";
import useLocalize from "@/src/useLocalize";
import CONST from "./const";
import {
  AuthReturnValue,
  Feedback,
  FeedbackKeyType,
  AuthType,
  SetFeedback,
} from "./types";
import Reason, { isReasonTPath } from "./Reason";

const getAuthTypeName = <T>(
  returnValue: AuthReturnValue<T>,
): AuthType["NAME"] | undefined =>
  Object.values(CONST.AUTH_TYPE).find(
    (authType) => authType.CODE === returnValue.type,
  )?.NAME;

export default function useFeedback(): [Feedback, SetFeedback] {
  const { translate } = useLocalize();

  const emptyAuth: AuthReturnValue<boolean> = useMemo(
    () => ({
      reason: Reason.TPath("biometrics.reason.generic.notRequested"),
      message: translate("biometrics.reason.generic.notRequested"),
      value: false,
    }),
    [translate],
  );

  const [challenge, setChallenge] = useState(emptyAuth);
  const [key, setKey] = useState(emptyAuth);
  const lastAction = useRef<FeedbackKeyType>(CONST.FEEDBACK_TYPE.NONE);

  const createFeedback = useCallback(
    (authData: AuthReturnValue<boolean>, authorize?: boolean) => {
      const { reason, value } = authData;
      const typeName = getAuthTypeName(authData);

      const shouldTranslate = isReasonTPath(reason);
      const message = shouldTranslate ? translate(reason.value) : reason.value;
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
      const isChallengeType = type === CONST.FEEDBACK_TYPE.CHALLENGE;
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
      [CONST.FEEDBACK_TYPE.KEY]: key,
      [CONST.FEEDBACK_TYPE.CHALLENGE]: challenge,
      [CONST.FEEDBACK_TYPE.NONE]: emptyAuth,
    };

    return {
      challenge,
      key,
      lastAction: {
        type: lastAction.current,
        value: lastActionMap[lastAction.current],
      },
    };
  }, [challenge, emptyAuth, key]);

  return [feedback, setFeedback];
}
