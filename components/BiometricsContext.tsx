import React, { useContext } from "react";
import useBiometrics, { Biometrics } from "@/src/useBiometrics";

const Context = React.createContext<Biometrics | null>(null);

function BiometricsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const contextValue = useBiometrics();
  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function useBiometricsContext() {
  const biometricsContext = useContext(Context);
  if (!biometricsContext) {
    throw new Error(
      "useBiometricsContext must be used within a BiometricsContextProvider",
    );
  }
  return biometricsContext;
}

BiometricsContextProvider.displayName = "BiometricsContextProvider";

export {
  Context as BiometricsContext,
  BiometricsContextProvider,
  useBiometricsContext,
};
