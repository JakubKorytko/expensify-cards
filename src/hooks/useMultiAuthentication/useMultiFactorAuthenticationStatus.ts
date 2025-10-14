import { useCallback, useMemo, useRef, useState } from "react";
import useLocalize from "@hooks/useLocalize";
import CONST from "@src/CONST";
import {
  MultiFactorAuthenticationStatus,
  SetMultiFactorAuthenticationStatus,
  MultiFactorAuthenticationStatusKeyType,
  MultiFactorAuthenticationPartialStatus,
  UseMultiFactorAuthenticationStatus,
} from "./types";
import { getAuthTypeName } from "./helpers";

/**
 * A hook that manages multifactorial authentication status state and messaging.
 *
 * Acts as middleware to format multifactorial authentication-related messages into a consistent, readable format.
 * This allows the main multifactorial authentication hook to focus solely on multifactorial authentication operations.
 *
 * Returns the current multifactorial authentication status and a setter function. The status includes
 * success/failure messages, titles, and authentication details for both challenge
 * and key-related scenarios.
 *
 * Must be implemented as a hook rather than a function to handle message translations.
 */
export default function useMultiFactorAuthenticationStatus<T>(
  initialValue: T,
  type: MultiFactorAuthenticationStatusKeyType,
  successSelector?: (
    prevStatus: MultiFactorAuthenticationPartialStatus<T>,
  ) => boolean,
): UseMultiFactorAuthenticationStatus<T> {
  const { translate } = useLocalize();

  const notRequestedText = useMemo(
    () => translate("multiFactorAuthentication.reason.generic.notRequested"),
    [translate],
  );

  /** Initial empty status used when no multifactorial authentication scenario has been attempted */
  const emptyAuth = useMemo<MultiFactorAuthenticationStatus<T>>(
    () => ({
      reason: "multiFactorAuthentication.reason.generic.notRequested",
      message: notRequestedText,
      title: notRequestedText,
      value: initialValue,
      step: {
        wasRecentStepSuccessful: undefined,
        requiredFactorForNextStep: undefined,
        isRequestFulfilled: true,
      },
    }),
    [initialValue, notRequestedText],
  );

  /**
   * State for the current multifactorial authentication status.
   */
  const [statusSource, setStatusSource] = useState(emptyAuth);

  /**
   * Reference to the previous status source.
   */
  const previousStatus = useRef(emptyAuth);

  /**
   * Reference to the success selector function.
   * Stored in a ref to avoid re-creating it on every render.
   */
  const successSource = useRef(successSelector);

  /** Creates a formatted status object based on authentication data and result */
  const createStatus = useCallback(
    (
      partialStatus: MultiFactorAuthenticationPartialStatus<T>,
      success: boolean,
      authorize?: boolean,
    ): MultiFactorAuthenticationStatus<T> => {
      const { reason } = partialStatus;
      const typeName = getAuthTypeName(partialStatus);
      const message = translate(reason);
      const statusType = success ? "success" : "failed";

      return {
        ...partialStatus,
        typeName,
        message: translate(
          `multiFactorAuthentication.statusMessage.${statusType}Message`,
          authorize,
          success ? typeName : message,
        ),
        title: translate(
          `multiFactorAuthentication.statusMessage.${statusType}Title`,
          authorize,
        ),
      };
    },
    [translate],
  );

  /** Current multifactorial authentication status with fallback to not-requested state if undefined */
  const status = useMemo(
    () => ({
      ...statusSource,
      message: statusSource.message ?? notRequestedText,
      title: statusSource.title ?? notRequestedText,
    }),
    [statusSource, notRequestedText],
  );

  /**
   * Updates the multifactorial authentication status state. Can accept either a new status object directly
   * or a function to transform the existing status. Returns the newly set status
   * for immediate use, though the status value from the hook can be used for reactive updates.
   */
  const setStatus: SetMultiFactorAuthenticationStatus<T> = useCallback(
    (partialStatus) => {
      const isChallengeType =
        type === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION;
      const state =
        typeof partialStatus === "function"
          ? partialStatus(previousStatus.current)
          : partialStatus;

      const success = successSource.current
        ? successSource.current(state)
        : !!state.step.wasRecentStepSuccessful;

      const createdStatus = createStatus(state, success, isChallengeType);

      setStatusSource(createdStatus);
      previousStatus.current = createdStatus;

      return createdStatus;
    },
    [type, createStatus],
  );

  return [status, setStatus];
}
