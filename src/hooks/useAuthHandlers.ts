import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import type { AppNavigatorProps } from "../navigation/AppNavigator";
import { auth } from "../firebase";
import {
  resetLoginForm,
  resetRegisterForm,
  setAuthError,
  setAuthLoading,
  setLoginErrorMessage,
  setRegisterErrorMessage,
  setShowTutorialModal,
} from "../store/authSlice";
import { setMode } from "../store/gameSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getAuthErrorMessage,
  getFirebaseAuthErrorCode,
  shouldLogAuthError,
} from "../utils/authErrors";

export function useAuthHandlers(): Pick<
  AppNavigatorProps,
  "isAuthReady" | "isAuthenticated" | "onLogin" | "onRegister"
> & {
  showTutorialModal: boolean;
  closeTutorialModal: () => void;
} {
  const dispatch = useAppDispatch();
  const { isAuthReady, user, showTutorialModal } = useAppSelector(
    (state) => state.auth,
  );

  const handleLogin = async (email: string, password: string) => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));

    try {
      await signInWithEmailAndPassword(auth, email, password);
      dispatch(setMode("game"));
      dispatch(resetLoginForm());
    } catch (error) {
      const errorCode = getFirebaseAuthErrorCode(error);
      if (shouldLogAuthError(errorCode)) {
        console.error("Login failed", error);
      }
      const authErrorMessage = getAuthErrorMessage(error, "login");
      dispatch(setAuthError(authErrorMessage));
      dispatch(setLoginErrorMessage(authErrorMessage));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const handleRegister = async (email: string, password: string) => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      dispatch(setMode("game"));
      dispatch(setShowTutorialModal(true));
      dispatch(resetRegisterForm());
    } catch (error) {
      const errorCode = getFirebaseAuthErrorCode(error);
      if (shouldLogAuthError(errorCode)) {
        console.error("Registration failed", error);
      }
      const authErrorMessage = getAuthErrorMessage(error, "register");
      dispatch(setAuthError(authErrorMessage));
      dispatch(setRegisterErrorMessage(authErrorMessage));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return {
    isAuthReady,
    isAuthenticated: Boolean(user),
    onLogin: handleLogin,
    onRegister: handleRegister,
    showTutorialModal,
    closeTutorialModal: () => dispatch(setShowTutorialModal(false)),
  };
}