import { Stack } from "expo-router";
import { BiometricsContextProvider } from "@/scripts/BiometricsContext";

export default function RootLayout() {
  return (
    <BiometricsContextProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </BiometricsContextProvider>
  );
}
