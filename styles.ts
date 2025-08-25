const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    gap: 5,
    backgroundColor: "#F8F4F0",
    borderRadius: 5,
  },
  textInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E1DA",
    width: 150,
    borderRadius: 10,
    textAlign: "center",
    letterSpacing: 5,
    fontSize: 20,
  },
  container200H: {
    height: 200,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  gap15: {
    gap: 15,
  },
  magicCodeContainer: {
    width: "100%",
    height: 250,
    gap: 10,
    position: "absolute",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 30,
    alignItems: "center",
    backgroundColor: "#FCFBF9",
  },
  layoutContainerMagicCode: {
    backgroundColor: "#EBE6DF",
    filter: "blur(3px)",
  },
  layoutContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCFBF9",
    gap: 40,
  },
  content: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  magicCodeText: {
    fontSize: 17,
  },
  button: {
    backgroundColor: "#E6E1DA",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 11,
  },
  greenButtonText: {
    color: "white",
    fontSize: 15,
  },
  greenButton: {
    backgroundColor: "#03D47C",
  },
  buttonNegative: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#F25730",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextNegative: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
  },
  title: {
    fontSize: 15,
  },
  hugeText: {
    fontSize: 17,
    fontWeight: "bold",
  },
  titleWithInput: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 5,
  },
  w100Bottom: {
    width: "100%",
    paddingVertical: 10,
  },
} as const;

export default styles;
