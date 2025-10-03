import { useCallback, useMemo, useRef, useState } from "react";
import useLocalize from "@hooks/useLocalize";
import CONST from "@src/CONST";
import {
  BiometricsStatus,
  Feedback,
  SetFeedback,
  SetSingleFeedback,
  SingleFeedback,
} from "./types";
import type { ValueOf } from "type-fest";
import { BiometricsAuthFactor } from "@libs/Biometrics/types";

type FeedbackKeyType = ValueOf<typeof CONST.BIOMETRICS.ACTION_TYPE>;
type FeedbackStrictKeyType = ValueOf<
  Omit<typeof CONST.BIOMETRICS.ACTION_TYPE, "NONE">
>;

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

function useSingleBiometricsFeedback<T>(
  initialValue: T,
  type: FeedbackKeyType,
  successSelector?: (prevState: BiometricsStatus<T>) => boolean,
): [SingleFeedback<T>, SetSingleFeedback<T>] {
  const { translate } = useLocalize();

  const notRequestedText = useMemo(
    () => translate("biometrics.reason.generic.notRequested"),
    [translate],
  );

  /** Used when the feedback type is 'none' */
  const emptyAuth: BiometricsStatus<T> = useMemo(
    () => ({
      reason: "biometrics.reason.generic.notRequested",
      message: notRequestedText,
      title: notRequestedText,
      value: initialValue,
    }),
    [initialValue, notRequestedText],
  );

  const [feedbackSource, setFeedbackSource] = useState(emptyAuth);
  const previousFeedbackSource = useRef(emptyAuth);
  const successSource = useRef(successSelector);

  /** Internal helper method to create a feedback based on its type (either challenge or key)  */
  const createFeedback = useCallback(
    (
      authData: BiometricsStatus<T>,
      success: boolean,
      authorize?: boolean,
    ): BiometricsStatus<T> => {
      const { reason, value } = authData;
      const typeName = getAuthTypeName(authData);

      const message = translate(reason);
      const reasonMessage = success ? typeName : message;
      const statusMessage = `biometrics.feedbackMessage.${success ? "successMessage" : "failedMessage"}`;
      const statusTitle = `biometrics.feedbackMessage.${success ? "successTitle" : "failedTitle"}`;

      return {
        ...authData,
        message: translate(statusMessage, authorize, reasonMessage),
        title: translate(statusTitle, authorize),
        value,
        typeName,
      };
    },
    [translate],
  );

  /** Feedback object, for detailed documentation see type in the types file */
  const feedback: SingleFeedback<T> = useMemo(() => {
    const { message, title, value } = feedbackSource;

    return {
      ...feedbackSource,
      message: message ?? notRequestedText,
      title: title ?? notRequestedText,
      value,
    };
  }, [feedbackSource, notRequestedText]);

  /**
   * This method works like setting a value in JavaScript,
   * meaning it will return the value that was set if we want to use it immediately.
   * Otherwise, we can fully depend on the feedback value returned by the hook as it is reactive.
   */
  const setFeedback: SetSingleFeedback<T> = useCallback(
    (authData) => {
      const isChallengeType = type === CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE;
      const shouldUpdateFeedback = typeof authData === "function";
      const state = shouldUpdateFeedback
        ? authData(previousFeedbackSource.current)
        : authData;

      const success =
        typeof successSource.current === "function"
          ? successSource.current(state)
          : !!state.value;

      const createdFeedback = createFeedback(state, success, isChallengeType);

      setFeedbackSource(createdFeedback);
      previousFeedbackSource.current = createdFeedback;

      return createdFeedback;
    },
    [type, createFeedback],
  );

  return [feedback, setFeedback] as const;
}

/**
 * This is a middleware to tidy up all messages from biometrics-related functions into a one readable object.
 * By doing so, useBiometrics focuses only on the biometrics operations.
 * This could be a function but since we are translating the messages,
 * this needs to be a hook (although used only in useBiometrics).
 *
 * It returns latest biometrics feedback for both challenge and key related actions.
 * It also returns the last action value, message and title if we just want to display latest action result
 * and do not need to specify whether it was challenge or key related.
 *
 * For detailed documentation on Feedback object it returns, see types file.
 */
export default function useBiometricsFeedback<T>(
  initialValue: T,
): [Feedback<T>, SetFeedback<T>] {
  const { translate } = useLocalize();

  const notRequestedText = useMemo(
    () => translate("biometrics.reason.generic.notRequested"),
    [translate],
  );

  /** Used when the feedback type is 'none' */
  const emptyAuth: BiometricsStatus<T> = useMemo(
    () => ({
      reason: "biometrics.reason.generic.notRequested",
      message: notRequestedText,
      title: notRequestedText,
      value: initialValue,
    }),
    [initialValue, notRequestedText],
  );

  const [challenge, setChallenge] = useState(emptyAuth);
  const [key, setKey] = useState(emptyAuth);
  const lastAction = useRef<FeedbackKeyType>(CONST.BIOMETRICS.ACTION_TYPE.NONE);

  /** Internal helper method to create a feedback based on its type (either challenge or key)  */
  const createFeedback = useCallback(
    (
      authData: BiometricsStatus<T>,
      authorize?: boolean,
    ): BiometricsStatus<T> => {
      const { reason, value } = authData;
      const typeName = getAuthTypeName(authData);

      const message = translate(reason);
      const reasonMessage = value ? typeName : message;
      const statusMessage = `biometrics.feedbackMessage.${value ? "successMessage" : "failedMessage"}`;
      const statusTitle = `biometrics.feedbackMessage.${value ? "successTitle" : "failedTitle"}`;

      return {
        ...authData,
        message: translate(statusMessage, authorize, reasonMessage),
        title: translate(statusTitle, authorize),
        value,
        typeName,
      };
    },
    [translate],
  );

  /** Feedback object, for detailed documentation see type in the types file */
  const feedback: Feedback<T> = useMemo(() => {
    const lastActionMap = {
      [CONST.BIOMETRICS.ACTION_TYPE.KEY]: key,
      [CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE]: challenge,
      [CONST.BIOMETRICS.ACTION_TYPE.NONE]: emptyAuth,
    };

    const { message, title, value } = lastActionMap[lastAction.current];

    return {
      challenge,
      key,
      message: message ?? notRequestedText,
      title: title ?? notRequestedText,
      value,
    };
  }, [challenge, emptyAuth, key, notRequestedText]);

  /**
   * This method works like setting a value in JavaScript,
   * meaning it will return the value that was set if we want to use it immediately.
   * Otherwise, we can fully depend on the feedback value returned by the hook as it is reactive.
   */
  const setFeedback: SetFeedback<T> = useCallback(
    (authData, type) => {
      const isChallengeType = type === CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE;
      const shouldUpdateFeedback = typeof authData === "function";
      const state = type === CONST.BIOMETRICS.ACTION_TYPE.KEY ? key : challenge;

      const createdFeedback = shouldUpdateFeedback
        ? authData(state)
        : createFeedback(authData, isChallengeType);

      if (isChallengeType) {
        setChallenge(createdFeedback);
      } else {
        setKey(createdFeedback);
      }

      lastAction.current = type;
      return createdFeedback;
    },
    [challenge, createFeedback, key],
  );

  return [feedback, setFeedback] as const;
}

export { useSingleBiometricsFeedback };
