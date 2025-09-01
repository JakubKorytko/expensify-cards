import { Stack } from "expo-router";
import { BiometricsContextProvider } from "@/base/BiometricsContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <BiometricsContextProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#051c09" }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </SafeAreaView>
    </BiometricsContextProvider>
  );
}
