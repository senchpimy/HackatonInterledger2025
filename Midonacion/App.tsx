import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 1. Importa tus pantallas
import { LoginScreen } from "./app/LoginScreen";
import { RegisterScreen } from "./app/RegisterScreen";
// Importa las demás vistas aquí

// 2. Crea el Navegador de Pila (Stack)
const Stack = createNativeStackNavigator();

// 3. Define la estructura de tus pantallas
export default function App() {
  // Aquí puedes manejar la lógica de autenticación (si el usuario está logueado o no)

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login" // Pantalla de inicio de la aplicación
        screenOptions={{
          headerStyle: { backgroundColor: "#007AFF" },
          headerTintColor: "#fff",
        }}
      >
        {/* Vistas de Autenticación */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Bienvenido" }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Nuevo Registro" }}
        />

        {/* Vistas Principales (después del Login) */}
        {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
        {/* Agrega aquí el resto de tus 8 vistas */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
