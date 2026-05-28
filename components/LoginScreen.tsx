import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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

  const renderPasswordIcon = (isVisible: boolean) => {
    if (isVisible) {
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M1.5 12C1.5 12 5.25 4.5 12 4.5C18.75 4.5 22.5 12 22.5 12C22.5 12 18.75 19.5 12 19.5C5.25 19.5 1.5 12 1.5 12Z"
            stroke="#F8F8F8"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={12} cy={12} r={3} stroke="#F8F8F8" strokeWidth={1.8} />
        </Svg>
      );
    }

    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 3L21 21"
          stroke="#F8F8F8"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10.584 5.058C11.043 4.909 11.519 4.833 12 4.833C18.036 4.833 21.5 12 21.5 12C20.985 13.03 20.358 13.964 19.637 14.783M14.827 14.827C14.452 15.203 14.007 15.5 13.517 15.7C13.027 15.901 12.503 16 11.974 15.992C11.446 15.983 10.926 15.866 10.443 15.65C9.961 15.435 9.526 15.126 9.163 14.742C8.8 14.357 8.516 13.904 8.327 13.409C8.139 12.915 8.049 12.388 8.062 11.859C8.075 11.33 8.19 10.808 8.399 10.324C8.608 9.839 8.907 9.4 9.279 9.033M6.457 6.457C3.926 8.177 2.5 12 2.5 12C3.319 13.639 4.432 15.114 5.782 16.352C7.132 17.59 8.789 18.45 10.58 18.843"
          stroke="#F8F8F8"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
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
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.loginInput, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor="#A3B4D2"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => {
              setIsPasswordFocused(false);
              setIsPasswordVisible(false);
            }}
            secureTextEntry={!isPasswordVisible}
          />
          {isPasswordFocused ? (
            <Pressable
              style={styles.passwordToggleButton}
              accessibilityRole="button"
              accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
              onPress={() => setIsPasswordVisible((visible) => !visible)}>
              {renderPasswordIcon(isPasswordVisible)}
            </Pressable>
          ) : null}
        </View>

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
