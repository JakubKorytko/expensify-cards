type ValueOf<T> = T[keyof T];
type NestedRecord<T> = {[key: string]: T | NestedRecord<T>};
type ElementType = string | ((...args: unknown[]) => string);
// type EmptyObject = Record<string, never>;
declare const emptyObjectSymbol: unique symbol;
type EmptyObject = {[emptyObjectSymbol]?: never};
type TupleToUnion<ArrayType> = ArrayType extends readonly unknown[] ? ArrayType[number] : never;

export type {TupleToUnion, NestedRecord, ElementType, ValueOf, EmptyObject};
