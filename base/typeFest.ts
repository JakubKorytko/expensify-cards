type ValueOf<T> = T[keyof T];
type NestedRecord<T> = { [key: string]: T | NestedRecord<T> };
type ElementType = string | ((...args: any[]) => string);

export type { NestedRecord, ElementType, ValueOf };
