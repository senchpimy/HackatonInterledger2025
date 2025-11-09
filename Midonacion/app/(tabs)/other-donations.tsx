import React from "react";
import { Text, View, StyleSheet } from "react-native";

export default function OtherDonationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de OTRAS DONACIONES</Text>
      <Text>Explorar campañas y donaciones activas de otros usuarios.</Text>
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
