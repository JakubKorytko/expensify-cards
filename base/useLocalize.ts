import { useCallback } from "react";
import translations from "@src/en";

export default function useLocalize() {
  const translate = useCallback((path: string, ...args: any[]): string => {
    const keys = path.split(".");
    const value = keys.reduce((acc, key) => {
      if (typeof acc === "object") {
        return acc[key];
      }
      return acc;
    }, translations);

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
