import { useCallback, useMemo, useRef, useState } from "react";
import useLocalize from "@/src/useLocalize";
import CONST from "./const";
import { AuthReturnValue, Feedback, FeedbackKeyType } from "./types";
import Reason, { isReasonTPath } from "./Reason";
import type { ReasonType } from "./Reason";

type SetFeedback = (
  value: AuthReturnValue<boolean>,
  type: FeedbackKeyType,
  message?: string,
) => AuthReturnValue<boolean>;

const getReasonMessage = <T>(authData: AuthReturnValue<T>): ReasonType[] => {
  if (authData.value) {
    const isAuthMessageIncluded = !!authData.typeName;
    return isAuthMessageIncluded
      ? [
          Reason.TPath("biometrics.feedbackMessage.successUsing"),
          Reason.Message(authData.typeName ?? ""),
        ]
      : [Reason.TPath("biometrics.feedbackMessage.success")];
  }

  const isReasonIncluded = !!authData.reason;
  return isReasonIncluded
    ? [
        Reason.TPath("biometrics.feedbackMessage.failedBecause"),
        authData.reason,
      ]
    : [Reason.TPath("biometrics.feedbackMessage.failed")];
};

const wrapAuthReturnWithAuthTypeMessage = <T>(
  returnValue: AuthReturnValue<T>,
) => {
  const typeName = Object.values(CONST.AUTH_TYPE).find(
    (authType) => authType.CODE === returnValue.type,
  )?.NAME;

  return {
    ...returnValue,
    typeName,
  };
};

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

  const setFeedback: SetFeedback = useCallback(
    (value, type) => {
      const wrappedValue = wrapAuthReturnWithAuthTypeMessage(value);
      const isAuthorization = type === CONST.FEEDBACK_TYPE.CHALLENGE;

      const reasonMessage = getReasonMessage(wrappedValue).map((reason) =>
        isReasonTPath(reason)
          ? translate(reason.value, isAuthorization)
          : reason.value,
      );

      const finalValue = {
        ...wrappedValue,
        message: reasonMessage.join(" "),
      };

      if (type === CONST.FEEDBACK_TYPE.KEY) {
        setKey(finalValue);
      } else {
        setChallenge(finalValue);
      }

      lastAction.current = type;

      return finalValue;
    },
    [translate],
  );

  const getLastAction = useCallback(() => {
    if (lastAction.current === CONST.FEEDBACK_TYPE.KEY) {
      return {
        type: CONST.FEEDBACK_TYPE.KEY,
        value: key,
      };
    }

    if (lastAction.current === CONST.FEEDBACK_TYPE.CHALLENGE) {
      return {
        type: CONST.FEEDBACK_TYPE.CHALLENGE,
        value: challenge,
      };
    }

    return {
      type: CONST.FEEDBACK_TYPE.NONE,
      value: emptyAuth,
    };
  }, [challenge, emptyAuth, key]);

  const feedback = {
    challenge,
    key,
    lastAction: getLastAction(),
  };

  return [feedback, setFeedback];
}
