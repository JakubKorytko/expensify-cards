import type { TranslationPaths } from "@src/types";
import CONST from "@src/CONST";

function decodeExpoMessage(error: unknown): TranslationPaths {
  const errorString = String(error);
  const parts = errorString.split(CONST.BIOMETRICS.EXPO_ERRORS.SEPARATOR);
  const searchString =
    parts.length > 1 ? parts.slice(1).join(";").trim() : errorString;

  if (
    searchString.includes(CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.CANCELED)
  ) {
    return "biometrics.reason.expoErrors.canceled";
  }

  if (
    searchString.includes(
      CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.IN_PROGRESS,
    )
  ) {
    return "biometrics.reason.expoErrors.alreadyInProgress";
  }

  if (
    searchString.includes(
      CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.NOT_IN_FOREGROUND,
    )
  ) {
    return "biometrics.reason.expoErrors.notInForeground";
  }

  return "biometrics.reason.expoErrors.generic";
}

const isErrorGeneric = (path: TranslationPaths) =>
  path === "biometrics.reason.expoErrors.generic";

const decodeBiometricsExpoMessage = (
  message: unknown,
  fallback?: TranslationPaths,
): TranslationPaths => {
  const decodedMessage = decodeExpoMessage(message);

  const isGeneric = isErrorGeneric(decodedMessage);

  if (isGeneric && fallback) {
    return fallback;
  }

  return decodedMessage;
};

export default decodeBiometricsExpoMessage;
