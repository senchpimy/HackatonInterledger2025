import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
// ➡️ Importar el hook de navegación de Expo Router
import { useRouter } from "expo-router";

// Este componente debe ser el export default si está en la carpeta 'app/'
export default function LoginRegisterScreen() {
  const router = useRouter(); // ⬅️ Inicializar el router

  // Estado para alternar entre Login y Registro
  const [isLogin, setIsLogin] = useState(true);

  // Estados para capturar los inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Solo para Registro

  const handleSubmit = () => {
    if (isLogin) {
      console.log("Intentando Login con:", email, password);

      // ⬇️ Simulación: Navegar a la página de inicio (ruta '/')
      // **router.replace('/')** previene que el usuario regrese a la pantalla de login con el botón 'atrás'
      router.replace("/");

      // Aquí harías la llamada a tu API de Go para LOGIN
    } else {
      console.log("Intentando Registro con:", username, email, password);
      // Aquí harías la llamada a tu API de Go para REGISTRO
    }
  };

  const formTitle = isLogin ? "Iniciar Sesión" : "Crear Cuenta";
  const buttonText = isLogin ? "Entrar" : "Registrarse";
  const switchText = isLogin
    ? "¿No tienes cuenta? Regístrate"
    : "¿Ya tienes cuenta? Inicia Sesión";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{formTitle}</Text>

      {/* Campo de Nombre de Usuario (Solo en el registro) */}
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Nombre de Usuario"
          value={username}
          onChangeText={setUsername}
        />
      )}

      {/* Campo de Email */}
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Campo de Contraseña */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry={true} // Oculta los caracteres
        value={password}
        onChangeText={setPassword}
      />

      {/* Botón Principal (Login o Registro) */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>

      {/* Enlace para cambiar entre Login y Registro */}
      <TouchableOpacity
        onPress={() => setIsLogin(!isLogin)}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>{switchText}</Text>
      </TouchableOpacity>
    </View>
  );
}

// 3. Estilos de React Native (el "CSS" de React Native)

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa todo el espacio de la pantalla
    justifyContent: "center", // Centra el contenido verticalmente
    padding: 30,
    backgroundColor: "#f5f5f5", // Fondo suave
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF", // Azul primario de iOS/Expo
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchButton: {
    marginTop: 20,
    alignSelf: "center",
  },
  switchText: {
    color: "#007AFF",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
