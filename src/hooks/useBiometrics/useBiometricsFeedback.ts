import { useCallback, useMemo, useRef, useState } from "react";
import useLocalize from "@/base/useLocalize";
import CONST from "@src/CONST";
import { BiometricsStatus, Feedback } from "./types";
import { ValueOf } from "@/base/mockTypes";

type FeedbackKeyType = ValueOf<typeof CONST.BIOMETRICS.FEEDBACK_TYPE>;
type AuthTypeName = ValueOf<typeof CONST.BIOMETRICS.AUTH_TYPE>["NAME"];

/**
 * This method retrieves used authentication type numeric value returned by the SecureStore
 * and converts it to a readable string value.
 */
const getAuthTypeName = <T>(
  returnValue: BiometricsStatus<T>,
): AuthTypeName | undefined =>
  Object.values(CONST.BIOMETRICS.AUTH_TYPE).find(
    (authType) => authType.CODE === returnValue.type,
  )?.NAME;

/**
 * This is a middleware to tidy up all messages from biometrics-related functions into a one readable object.
 * By doing so, useBiometrics focuses only on the biometrics operations.
 * This could be a function but since we are translating the messages,
 * this needs to be a hook (although used only in useBiometrics).
 *
 * It returns latest biometrics feedback for both challenge and key related actions.
 * It also returns the last action message if we just want to display latest action result
 * and do not need to specify whether it was challenge or key related.
 *
 * For detailed documentation on Feedback object it returns, see types file.
 */
export default function useBiometricsFeedback() {
  const { translate } = useLocalize();

  const emptyAuth: BiometricsStatus<boolean> = useMemo(
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
    (authData: BiometricsStatus<boolean>, authorize?: boolean) => {
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

  /**
   * This method works like setting a value in JavaScript,
   * meaning it will return the value that was set if we want to use it immediately.
   * Otherwise, we can fully depend on the feedback value returned by the hook as it is reactive.
   */
  const setFeedback = useCallback(
    (
      authData: BiometricsStatus<boolean>,
      type: FeedbackKeyType,
    ): BiometricsStatus<boolean> => {
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

  const feedback: Feedback = useMemo(() => {
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

  return [feedback, setFeedback] as const;
}
