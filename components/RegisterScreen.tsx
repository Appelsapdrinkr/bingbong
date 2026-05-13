import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { styles } from "../styles";

type RegisterScreenProps = {
  onRegister: () => void;
  onSwitchToLogin: () => void;
};

export function RegisterScreen({
  onRegister,
  onSwitchToLogin,
}: Readonly<RegisterScreenProps>) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = () => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setErrorMessage("");
    onRegister();
  };

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginCard}>
        <Text style={styles.loginTitle}>Create account</Text>
        <Text style={styles.loginSubtitle}>Register to start playing Minesweeper.</Text>

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
        <TextInput
          style={styles.loginInput}
          placeholder="Confirm password"
          placeholderTextColor="#A3B4D2"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {errorMessage ? <Text style={styles.loginError}>{errorMessage}</Text> : null}

        <Pressable style={styles.loginButton} onPress={handleSubmit}>
          <Text style={styles.loginButtonText}>Register</Text>
        </Pressable>

        <Pressable style={styles.authSwitchButton} onPress={onSwitchToLogin}>
          <Text style={styles.authSwitchText}>Already have an account? Log in</Text>
        </Pressable>
      </View>
    </View>
  );
}
