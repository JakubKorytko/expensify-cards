import type { TranslationPaths } from "@src/languages/types";
import CONST from "@src/CONST";

/** Convert error returned by SecureStore to translation path */
function decodeExpoMessage(error: unknown): TranslationPaths {
  const errorString = String(error);
  const parts = errorString.split(CONST.BIOMETRICS.EXPO_ERRORS.SEPARATOR);
  const searchString =
    parts.length > 1 ? parts.slice(1).join(";").trim() : errorString;

  const wasAuthCanceled = searchString.includes(
    CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.CANCELED,
  );
  const isAuthAlreadyInProgress = searchString.includes(
    CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.IN_PROGRESS,
  );
  const isAppNotInTheForeground = searchString.includes(
    CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.NOT_IN_FOREGROUND,
  );

  if (wasAuthCanceled) {
    return "biometrics.reason.expoErrors.canceled";
  }

  if (isAuthAlreadyInProgress) {
    return "biometrics.reason.expoErrors.alreadyInProgress";
  }

  if (isAppNotInTheForeground) {
    return "biometrics.reason.expoErrors.notInForeground";
  }

  return "biometrics.reason.expoErrors.generic";
}

/**
 * Convert message returned by Expo to translation path.
 * If fallback is provided and the message is generic, fallback is used instead.
 */
const decodeBiometricsExpoMessage = (
  message: unknown,
  fallback?: TranslationPaths,
): TranslationPaths => {
  const decodedMessage = decodeExpoMessage(message);

  const isGeneric = decodedMessage === "biometrics.reason.expoErrors.generic";

  if (isGeneric && fallback) {
    return fallback;
  }

  return decodedMessage;
};

export default decodeBiometricsExpoMessage;
