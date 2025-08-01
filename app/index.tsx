import { View } from "react-native";
import SecretInfo from "@/components/SecretInfo";
import { Image } from "expo-image";
import ExpensifyLogo from "@/assets/images/icon.svg";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#051c09",
        gap: 40,
      }}
    >
      <Image
        source={ExpensifyLogo}
        style={{
          width: 200,
          height: 200,
        }}
      />
      <SecretInfo />
    </View>
  );
}
