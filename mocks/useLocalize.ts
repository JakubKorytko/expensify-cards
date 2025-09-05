import { useCallback } from "react";
import { ElementType, NestedRecord } from "type-fest";
import translations from "@src/languages/en";

export default function useLocalize() {
  const translate = useCallback((path: string, ...args: any[]): string => {
    const keys = path.split(".");
    const value = keys.reduce(
      (acc, key) => {
        if (typeof acc === "object") {
          return acc[key];
        }
        return acc;
      },
      translations as NestedRecord<ElementType> | ElementType,
    );

    if (typeof value === "function") {
      return value(...args);
    }

    if (typeof value === "string") {
      return value;
    }

    return "";
  }, []);

  return {
    translate,
  };
}
