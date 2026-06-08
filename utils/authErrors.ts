export const getAuthErrorMessage = (
  error: unknown,
  mode: "login" | "register",
) => {
  const fallback =
    mode === "login"
      ? "Unable to log in with these credentials."
      : "Unable to create account right now.";

  const errorCode =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";
  const errorMessage =
    typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : "";

  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already in use. Try logging in instead.";
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/user-not-found":
      return "No account found for this email.";
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your internet and try again.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled in Firebase Authentication settings.";
    case "auth/api-key-not-valid":
      return "Firebase API key is invalid. Re-check your EXPO_PUBLIC_FIREBASE_API_KEY value.";
    case "auth/invalid-api-key":
      return "Firebase API key is invalid. Re-check your EXPO_PUBLIC_FIREBASE_API_KEY value.";
    case "auth/missing-password":
      return "Please enter a password.";
    case "auth/missing-email":
      return "Please enter an email address.";
    case "auth/configuration-not-found":
      return "Authentication is not configured for this Firebase project. Enable Email/Password in Authentication > Sign-in method.";
    default:
      if (errorCode) {
        return `${fallback} (Firebase: ${errorCode})`;
      }
      if (errorMessage) {
        return `${fallback} (${errorMessage})`;
      }
      return fallback;
  }
};

export const getFirebaseAuthErrorCode = (error: unknown) => {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String(error.code);
  }

  return "";
};

export const shouldLogAuthError = (errorCode: string) => {
  const expectedAuthErrors = new Set([
    "auth/email-already-in-use",
    "auth/invalid-email",
    "auth/weak-password",
    "auth/invalid-credential",
    "auth/user-not-found",
    "auth/wrong-password",
    "auth/too-many-requests",
    "auth/network-request-failed",
    "auth/operation-not-allowed",
    "auth/api-key-not-valid",
    "auth/invalid-api-key",
    "auth/missing-password",
    "auth/missing-email",
    "auth/configuration-not-found",
  ]);

  return !expectedAuthErrors.has(errorCode);
};