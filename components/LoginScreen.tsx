import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { styles } from "../styles";

type LoginScreenProps = {
  onLogin: () => void;
};

export function LoginScreen({ onLogin }: Readonly<LoginScreenProps>) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setErrorMessage("");
    onLogin();
  };

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginCard}>
        <Text style={styles.loginTitle}>Welcome back</Text>
        <Text style={styles.loginSubtitle}>Sign in to start your next game.</Text>

        <TextInput
          style={styles.loginInput}
          placeholder="Username"
          placeholderTextColor="#A3B4D2"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.loginInput}
          placeholder="Password"
          placeholderTextColor="#A3B4D2"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {errorMessage ? <Text style={styles.loginError}>{errorMessage}</Text> : null}

        <Pressable style={styles.loginButton} onPress={handleSubmit}>
          <Text style={styles.loginButtonText}>Log in</Text>
        </Pressable>
      </View>
    </View>
  );
}
