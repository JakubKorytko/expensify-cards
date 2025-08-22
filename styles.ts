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
    width: "100%",
  },
  magicCodeContainer: {
    width: "80%",
    gap: 10,
    marginBottom: 20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
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
  button: {
    backgroundColor: "#E6E1DA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  buttonNegative: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "#F25730",
  },
  buttonTextNegative: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  title: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 5,
  },
  w80: {
    width: 80,
  },
} as const;

export default styles;
