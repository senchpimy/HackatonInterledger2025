import React from "react";
import { Text, View, StyleSheet } from "react-native";

export default function ValidateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de VALIDAR</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
