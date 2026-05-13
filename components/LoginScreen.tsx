import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { styles } from "../styles";

type LoginScreenProps = {
  onLogin: (email: string, password: string) => Promise<string | null>;
  onSwitchToRegister: () => void;
};

export function LoginScreen({
  onLogin,
  onSwitchToRegister,
}: Readonly<LoginScreenProps>) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    const loginError = await onLogin(email.trim(), password);

    if (loginError) {
      setErrorMessage(loginError);
    }

    setIsSubmitting(false);
  };

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginCard}>
        <Text style={styles.loginTitle}>Welcome back</Text>
        <Text style={styles.loginSubtitle}>Sign in to start your next game.</Text>

        <TextInput
          style={styles.loginInput}
          placeholder="Email"
          placeholderTextColor="#A3B4D2"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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

        <Pressable
          style={[styles.loginButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          <Text style={styles.loginButtonText}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </Text>
        </Pressable>

        <Pressable style={styles.authSwitchButton} onPress={onSwitchToRegister}>
          <Text style={styles.authSwitchText}>No account? Create one</Text>
        </Pressable>
      </View>
    </View>
  );
}
