import { ImageStyle, TextStyle, ViewStyle } from "react-native";

type Styles = {
  container: ViewStyle;
  layoutContainer: ViewStyle;
  logoImage: ImageStyle;
  button: ViewStyle;
  floatingButton: ViewStyle;
  whiteText: TextStyle;
  buttonText: TextStyle;
  mtn25: TextStyle;
};

const styles: Styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    width: "80%",
  },
  layoutContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCFBF9",
    gap: 40,
  },
  logoImage: {
    width: 200,
    height: 200,
  },
  button: {
    width: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
    height: 50,
    backgroundColor: "#03d47c",
  },
  floatingButton: {
    position: "absolute",
    top: 0,
    backgroundColor: "#051c09",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginBottom: 20,
  },
  whiteText: {
    color: "white",
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 15,
  },
  mtn25: {
    marginTop: -25,
  },
};

export default styles;
