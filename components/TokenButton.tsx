import { Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

const innerStyles: {
  container: ViewStyle;
  text: TextStyle;
} = {
  container: {
    width: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
    height: 50,
    backgroundColor: "#03d47c",
  },
  text: {
    fontWeight: "bold",
    color: "white",
    fontSize: 20,
  },
};

type TokenButtonProps = {
  callback: () => void;
  buttonText: string;
  containerStyle?: ViewStyle;
};

function TokenButton({
  callback,
  buttonText,
  containerStyle = {},
}: TokenButtonProps) {
  return (
    <TouchableOpacity
      onPress={callback}
      style={{
        ...innerStyles.container,
        ...containerStyle,
      }}
    >
      <Text style={innerStyles.text}>{buttonText}</Text>
    </TouchableOpacity>
  );
}

TokenButton.displayName = "TokenButton";

export default TokenButton;
