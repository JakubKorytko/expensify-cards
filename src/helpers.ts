import CONST from "@/src/const";

const DISABLE_LOGGER = false;

const wrapReasonWithSourceData = (
  reason: string,
  args: Record<string, unknown>,
) => {
  return `${reason}, source data:\n${JSON.stringify(args, null, 2)}\n`;
};

const Logger = {
  e: (...args: any[]) => !DISABLE_LOGGER && console.error(...args),
  w: (...args: any[]) => !DISABLE_LOGGER && console.warn(...args),
  m: (...args: any[]) => !DISABLE_LOGGER && console.log(...args),
  mw: (reason: string, args: Record<string, unknown>) =>
    !DISABLE_LOGGER && console.log(wrapReasonWithSourceData(reason, args)),
  ww: (reason: string, args: Record<string, unknown>) =>
    !DISABLE_LOGGER && console.warn(wrapReasonWithSourceData(reason, args)),
};

function decodeExpoErrorCode(error: unknown) {
  const errorString = String(error);

  const errorArray = errorString.split(CONST.MISC.EXPO_ERROR_SEPARATOR);

  if (errorArray.length <= 1) {
    return errorString;
  }

  return errorArray.slice(1).join(";").trim();
}

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randomTransactionID = () => rnd(100_000_000, 999_999_999).toString();

export { Logger, decodeExpoErrorCode, randomTransactionID };
