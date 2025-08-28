import type { TranslationPaths } from "./types";

class ReasonBase {
  constructor(public value: string | TranslationPaths) {
    this.value = value;
  }
}

class ReasonTranslation extends ReasonBase {
  constructor(public value: TranslationPaths) {
    super(value);
  }
}

class ReasonPlain extends ReasonBase {
  constructor(public value: string) {
    super(value);
  }
}

const Reason = {
  Message: (value: string) => new ReasonPlain(value),
  TPath: (value: TranslationPaths) => new ReasonTranslation(value),
};

const isReasonTPath = (reason: ReasonBase): reason is ReasonTranslation =>
  reason instanceof ReasonTranslation;

type ReasonType = ReasonTranslation | ReasonPlain;

export default Reason;
export { isReasonTPath };
export type { ReasonType };
