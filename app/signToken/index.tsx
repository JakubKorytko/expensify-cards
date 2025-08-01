import { View } from "react-native";
import { Image } from "expo-image";
import ExpensifyLogo from "@/assets/images/icon.svg";
import SignToken from "@/components/SignToken";
import styles from "@/styles";

export default function Index() {
  return (
    <View style={styles.layoutContainer}>
      <Image source={ExpensifyLogo} style={styles.logoImage} />
      <SignToken />
    </View>
  );
}
