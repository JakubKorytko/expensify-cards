type ValueOf<T> = T[keyof T];
type NestedRecord<T> = { [key: string]: T | NestedRecord<T> };
type ElementType = string | ((...args: any[]) => string);
type TranslationPaths = `biometrics.${string}`;

export type { TranslationPaths, NestedRecord, ElementType, ValueOf };
