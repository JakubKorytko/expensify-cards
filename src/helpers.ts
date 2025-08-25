import CONST from "@/src/const";
import { AuthReturnValue } from "@/src/types";

const DISABLE_LOGGER = false;

const wrapReasonWithSourceData = (
  reason: string,
  args: Record<string, unknown>,
) => {
  return `${reason}, source data:\n${JSON.stringify(args, null, 2)}\n`;
};

const Logger = {
  e: (...args: any[]) => {
    if (!DISABLE_LOGGER) console.error(...args);
    return args.join(" ");
  },
  w: (...args: any[]) => {
    if (!DISABLE_LOGGER) console.warn(...args);
    return args.join(" ");
  },
  m: (...args: any[]) => {
    if (!DISABLE_LOGGER) console.log(...args);
    return args.join(" ");
  },
  mw: (reason: string, args: Record<string, unknown>) => {
    if (!DISABLE_LOGGER) console.log(wrapReasonWithSourceData(reason, args));
    return reason;
  },
  ww: (reason: string, args: Record<string, unknown>) => {
    if (!DISABLE_LOGGER) console.warn(wrapReasonWithSourceData(reason, args));
    return reason;
  },
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

const getReasonMessage = (authData: AuthReturnValue<boolean>) => {
  console.log(authData);
  if (authData.value) {
    const isAuthMessageIncluded = !!authData.authTypeMessage;
    return isAuthMessageIncluded
      ? `${CONST.REASON_MESSAGE.SUCCESS_USING} ${authData.authTypeMessage}`
      : CONST.REASON_MESSAGE.SUCCESS;
  }

  const isReasonIncluded = !!authData.reason;
  return isReasonIncluded
    ? `${CONST.REASON_MESSAGE.FAILED_BECAUSE}: ${authData.reason}`
    : CONST.REASON_MESSAGE.FAILED;
};

export { Logger, decodeExpoErrorCode, randomTransactionID, getReasonMessage };
