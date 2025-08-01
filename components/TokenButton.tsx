import { Text, TouchableOpacity } from "react-native";

function TokenButton({
  callback,
  buttonText,
}: {
  callback: () => void;
  buttonText: string;
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
