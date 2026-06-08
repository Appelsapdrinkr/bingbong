import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthScreen = "login" | "register";

type AuthUser = {
  uid: string;
  email: string | null;
};

interface LoginFormState {
  email: string;
  password: string;
  isPasswordVisible: boolean;
  isPasswordFocused: boolean;
  isSubmitting: boolean;
  errorMessage: string;
}

interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  isPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  isPasswordFocused: boolean;
  isConfirmPasswordFocused: boolean;
  isSubmitting: boolean;
  errorMessage: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthReady: boolean;
  authScreen: AuthScreen;
  showTutorialModal: boolean;
  isLoading: boolean;
  error: string | null;
  loginForm: LoginFormState;
  registerForm: RegisterFormState;
}

const initialState: AuthState = {
  user: null,
  isAuthReady: false,
  authScreen: "login",
  showTutorialModal: false,
  isLoading: false,
  error: null,
  loginForm: {
    email: "",
    password: "",
    isPasswordVisible: false,
    isPasswordFocused: false,
    isSubmitting: false,
    errorMessage: "",
  },
  registerForm: {
    email: "",
    password: "",
    confirmPassword: "",
    isPasswordVisible: false,
    isConfirmPasswordVisible: false,
    isPasswordFocused: false,
    isConfirmPasswordFocused: false,
    isSubmitting: false,
    errorMessage: "",
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.error = null;
    },
    setAuthReady: (state, action: PayloadAction<boolean>) => {
      state.isAuthReady = action.payload;
    },
    setAuthScreen: (state, action: PayloadAction<AuthScreen>) => {
      state.authScreen = action.payload;
    },
    setShowTutorialModal: (state, action: PayloadAction<boolean>) => {
      state.showTutorialModal = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetAuthUiState: (state) => {
      state.authScreen = "login";
      state.showTutorialModal = false;
      state.isLoading = false;
      state.error = null;
      state.loginForm = initialState.loginForm;
      state.registerForm = initialState.registerForm;
    },
    setLoginEmail: (state, action: PayloadAction<string>) => {
      state.loginForm.email = action.payload;
    },
    setLoginPassword: (state, action: PayloadAction<string>) => {
      state.loginForm.password = action.payload;
    },
    setLoginPasswordVisible: (state, action: PayloadAction<boolean>) => {
      state.loginForm.isPasswordVisible = action.payload;
    },
    setLoginPasswordFocused: (state, action: PayloadAction<boolean>) => {
      state.loginForm.isPasswordFocused = action.payload;
    },
    setLoginSubmitting: (state, action: PayloadAction<boolean>) => {
      state.loginForm.isSubmitting = action.payload;
    },
    setLoginErrorMessage: (state, action: PayloadAction<string>) => {
      state.loginForm.errorMessage = action.payload;
    },
    resetLoginForm: (state) => {
      state.loginForm = initialState.loginForm;
    },
    setRegisterEmail: (state, action: PayloadAction<string>) => {
      state.registerForm.email = action.payload;
    },
    setRegisterPassword: (state, action: PayloadAction<string>) => {
      state.registerForm.password = action.payload;
    },
    setRegisterConfirmPassword: (state, action: PayloadAction<string>) => {
      state.registerForm.confirmPassword = action.payload;
    },
    setRegisterPasswordVisible: (state, action: PayloadAction<boolean>) => {
      state.registerForm.isPasswordVisible = action.payload;
    },
    setRegisterConfirmPasswordVisible: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.registerForm.isConfirmPasswordVisible = action.payload;
    },
    setRegisterPasswordFocused: (state, action: PayloadAction<boolean>) => {
      state.registerForm.isPasswordFocused = action.payload;
    },
    setRegisterConfirmPasswordFocused: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.registerForm.isConfirmPasswordFocused = action.payload;
    },
    setRegisterSubmitting: (state, action: PayloadAction<boolean>) => {
      state.registerForm.isSubmitting = action.payload;
    },
    setRegisterErrorMessage: (state, action: PayloadAction<string>) => {
      state.registerForm.errorMessage = action.payload;
    },
    resetRegisterForm: (state) => {
      state.registerForm = initialState.registerForm;
    },
  },
});

export const {
  setUser,
  setAuthReady,
  setAuthScreen,
  setShowTutorialModal,
  setAuthLoading,
  setAuthError,
  resetAuthUiState,
  setLoginEmail,
  setLoginPassword,
  setLoginPasswordVisible,
  setLoginPasswordFocused,
  setLoginSubmitting,
  setLoginErrorMessage,
  resetLoginForm,
  setRegisterEmail,
  setRegisterPassword,
  setRegisterConfirmPassword,
  setRegisterPasswordVisible,
  setRegisterConfirmPasswordVisible,
  setRegisterPasswordFocused,
  setRegisterConfirmPasswordFocused,
  setRegisterSubmitting,
  setRegisterErrorMessage,
  resetRegisterForm,
} = authSlice.actions;

export default authSlice.reducer;
