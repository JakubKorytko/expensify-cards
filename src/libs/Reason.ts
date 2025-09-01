import type { TranslationPaths } from "@src/types";
import CONST from "@src/CONST";

function decodeExpoErrorCode(error: unknown) {
  const errorString = String(error);
  const parts = errorString.split(CONST.BIOMETRICS.MISC.EXPO_ERROR_SEPARATOR);
  return parts.length > 1 ? parts.slice(1).join(";").trim() : errorString;
}

class ReasonBase {
  constructor(public value: string | TranslationPaths) {
    this.value = value;
  }
}

class ReasonTPath extends ReasonBase {
  public params: any[] = [];

  constructor(
    public value: TranslationPaths,
    ...params: any[]
  ) {
    super(value);
    this.params = params;
  }
}

class ReasonMessage extends ReasonBase {
  constructor(public value: string) {
    super(value);
  }
}

const Reason = {
  Message: (value: string) => new ReasonMessage(value),
  TPath: (value: TranslationPaths, ...args: any[]) =>
    new ReasonTPath(value, ...args),
  ExpoError: (value: unknown) => new ReasonMessage(decodeExpoErrorCode(value)),
};

const isReasonTPath = (reason: ReasonBase): reason is ReasonTPath =>
  reason instanceof ReasonTPath;

type ReasonType = ReasonTPath | ReasonMessage;

export default Reason;
export { isReasonTPath };
export type { ReasonType };
