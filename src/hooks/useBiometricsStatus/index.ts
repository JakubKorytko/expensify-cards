import { useCallback, useMemo, useRef, useState } from "react";
import useLocalize from "@hooks/useLocalize";
import CONST from "@src/CONST";
import {
  AuthTypeName,
  BiometricsStatus,
  SetBiometricsStatus,
  BiometricsStatusKeyType,
  BiometricsPartialStatus,
} from "./types";

/**
 * This method retrieves used authentication type numeric value returned by the SecureStore
 * and converts it to a readable string value.
 */
const getAuthTypeName = <T>(
  returnValue: BiometricsPartialStatus<T>,
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
 * It returns latest biometrics status for both challenge and key related actions.
 * It also returns the last action value, message and title if we just want to display latest action result
 * and do not need to specify whether it was challenge or key related.
 *
 * For detailed documentation on BiometricsStatus object it returns, see types file.
 */
export default function useBiometricsStatus<T>(
  initialValue: T,
  type: BiometricsStatusKeyType,
  successSelector?: (prevState: BiometricsPartialStatus<T>) => boolean,
): [BiometricsStatus<T>, SetBiometricsStatus<T>] {
  const { translate } = useLocalize();

  const notRequestedText = useMemo(
    () => translate("biometrics.reason.generic.notRequested"),
    [translate],
  );

  /** Used when the status type is 'none' */
  const emptyAuth: BiometricsStatus<T> = useMemo(
    () => ({
      reason: "biometrics.reason.generic.notRequested",
      message: notRequestedText,
      title: notRequestedText,
      value: initialValue,
    }),
    [initialValue, notRequestedText],
  );

  const [statusSource, setStatusSource] = useState(emptyAuth);
  const previousStatusSource = useRef(emptyAuth);
  const successSource = useRef(successSelector);

  /** Internal helper method to create a status based on its type (either challenge or key)  */
  const createStatus = useCallback(
    (
      authData: BiometricsPartialStatus<T>,
      success: boolean,
      authorize?: boolean,
    ): BiometricsStatus<T> => {
      const { reason, value } = authData;
      const typeName = getAuthTypeName(authData);

      const message = translate(reason);
      const reasonMessage = success ? typeName : message;
      const statusMessage = `biometrics.statusMessage.${success ? "successMessage" : "failedMessage"}`;
      const statusTitle = `biometrics.statusMessage.${success ? "successTitle" : "failedTitle"}`;

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

  /** BiometricsStatus object, for detailed documentation see type in the types file */
  const status: BiometricsStatus<T> = useMemo(() => {
    const { message, title, value } = statusSource;

    return {
      ...statusSource,
      message: message ?? notRequestedText,
      title: title ?? notRequestedText,
      value,
    };
  }, [statusSource, notRequestedText]);

  /**
   * This method works like setting a value in JavaScript,
   * meaning it will return the value that was set if we want to use it immediately.
   * Otherwise, we can fully depend on the status value returned by the hook as it is reactive.
   */
  const setStatus: SetBiometricsStatus<T> = useCallback(
    (authData) => {
      const isChallengeType = type === CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE;
      const shouldUpdateStatus = typeof authData === "function";
      const state = shouldUpdateStatus
        ? authData(previousStatusSource.current)
        : authData;

      const success =
        typeof successSource.current === "function"
          ? successSource.current(state)
          : !!state.value;

      const createdStatus = createStatus(state, success, isChallengeType);

      console.log(createdStatus, "LMAO!");

      setStatusSource(createdStatus);
      previousStatusSource.current = createdStatus;

      return createdStatus;
    },
    [type, createStatus],
  );

  return [status, setStatus] as const;
}
