import React from "react";
import { Text, View, StyleSheet } from "react-native";

export default function CreateSupportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de CREAR APOYO</Text>
      <Text>
        Formulario para iniciar una nueva campaña de apoyo o donación.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
