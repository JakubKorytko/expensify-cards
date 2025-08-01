import { Text, TouchableOpacity, ViewStyle } from "react-native";

function TokenButton({
  callback,
  buttonText,
  containerStyle = {},
}: {
  callback: () => void;
  buttonText: string;
  containerStyle?: ViewStyle;
}) {
  return (
    <TouchableOpacity
      onPress={callback}
      style={{
        width: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 9999,
        height: 50,
        backgroundColor: "#03d47c",
        ...containerStyle,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          color: "white",
          fontSize: 20,
        }}
      >
        {buttonText}
      </Text>
    </TouchableOpacity>
  );
}

TokenButton.displayName = "TokenButton";

export default TokenButton;
