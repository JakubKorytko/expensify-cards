type ValueOf<T> = T[keyof T];
type NestedRecord<T> = { [key: string]: T | NestedRecord<T> };
type ElementType = string | ((...args: any[]) => string);
// type EmptyObject = Record<string, never>;
declare const emptyObjectSymbol: unique symbol;
type EmptyObject = {[emptyObjectSymbol]?: never};


export type { NestedRecord, ElementType, ValueOf, EmptyObject };
