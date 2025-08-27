import type { TranslationPaths } from "./types";

class Reason {
  constructor(public value: string | TranslationPaths) {
    this.value = value;
  }
}

class ReasonTranslation extends Reason {
  constructor(public value: TranslationPaths) {
    super(value);
  }
}

class ReasonPlain extends Reason {
  constructor(public value: string) {
    super(value);
  }
}

export { ReasonPlain, ReasonTranslation };
