import React from "react";
import { Text, View, StyleSheet } from "react-native";

export default function UserScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de USUARIO</Text>
      <Text>Aquí se mostrarán los datos del perfil y configuraciones.</Text>
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
