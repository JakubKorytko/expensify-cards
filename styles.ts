import { ImageStyle, TextStyle, ViewStyle } from "react-native";

type Styles = {
  text: TextStyle;
  container: ViewStyle;
  textBlackBG: TextStyle;
  layoutContainer: ViewStyle;
  logoImage: ImageStyle;
};

const styles: Styles = {
  text: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    width: "80%",
  },
  textBlackBG: {
    backgroundColor: "black",
    borderRadius: 40,
    padding: 20,
  },
  layoutContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#051c09",
    gap: 40,
  },
  logoImage: {
    width: 200,
    height: 200,
  },
};

export default styles;
