import { useEffect, useRef } from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Board } from "./components/Board";
import { ControlPanel } from "./components/ControlPanel";
import { LevelSelector } from "./components/LevelSelector";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { auth, db } from "./firebase";
import { styles } from "./styles";
import { Cell } from "./minesweeper.types";
import {
  DEFAULT_ROWS,
  DEFAULT_COLS,
  DEFAULT_MINES,
} from "./minesweeper.utils";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  clearDesign,
  clearLevelName,
  resetGameState,
  revealCell,
  setBoardForSize,
  setBoardFromSavedLevel,
  setFocusMode,
  setLevelName,
  setMode,
  startNewRandomGame,
  startWithDesign,
  toggleEditorMode,
  toggleEditorTool,
  toggleFlag,
  toggleFocusMode,
  toggleMineInEditor,
} from "./store/gameSlice";
import {
  decreaseCols,
  decreaseRows,
  increaseCols,
  increaseRows,
  resetSettings,
  setBoardSize,
} from "./store/settingsSlice";
import {
  resetLoginForm,
  resetRegisterForm,
  resetAuthUiState,
  setAuthError,
  setAuthLoading,
  setAuthReady,
  setAuthScreen,
  setLoginErrorMessage,
  setRegisterErrorMessage,
  setShowTutorialModal,
  setUser,
} from "./store/authSlice";
import { setShowSplash } from "./store/uiSlice";

const getAuthErrorMessage = (error: unknown, mode: "login" | "register") => {
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

const getFirebaseAuthErrorCode = (error: unknown) => {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String(error.code);
  }

  return "";
};

const shouldLogAuthError = (errorCode: string) => {
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

const SplashScreen = ({ opacity }: { opacity: Animated.Value }) => (
  <Animated.View style={[styles.splashContainer, { opacity }]}>
    <View style={styles.splashCard}>
      <Text style={styles.splashTitle}>Minesweeper</Text>
      <Text style={styles.splashSubtitle}>Booting up your board...</Text>
      <ActivityIndicator size="large" color="#B8D6FF" />
    </View>
  </Animated.View>
);

export default function App() {
  const dispatch = useAppDispatch();
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const appOpacity = useRef(new Animated.Value(0)).current;
  const {
    board,
    gameStatus,
    mode,
    editorMode,
    isFocusMode,
    levelName,
    editorTool,
  } = useAppSelector((state) => state.game);
  const { rows: boardRows, cols: boardCols, mines } = useAppSelector(
    (state) => state.settings,
  );
  const { isAuthReady, user, authScreen, showTutorialModal } = useAppSelector(
    (state) => state.auth,
  );
  const { showSplash } = useAppSelector((state) => state.ui);

  const isAuthenticated = Boolean(user);

  const mineCount = board.flat().filter((cell) => cell.isMine).length;

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(appOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => dispatch(setShowSplash(false)));
    }, 1200);

    return () => {
      clearTimeout(holdTimer);
      splashOpacity.stopAnimation();
      appOpacity.stopAnimation();
    };
  }, [appOpacity, dispatch, splashOpacity]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(
        setUser(
          user
            ? {
                uid: user.uid,
                email: user.email,
              }
            : null,
        ),
      );
      dispatch(setAuthReady(true));
    });

    return unsubscribe;
  }, [dispatch]);

  const handleNewRandomGame = () => {
    dispatch(startNewRandomGame({ rows: boardRows, cols: boardCols, mines }));
  };

  const handleClearDesign = () => {
    dispatch(clearDesign({ rows: boardRows, cols: boardCols }));
  };

  const handleToggleEditorTool = () => {
    dispatch(toggleEditorTool());
  };

  const handleIncreaseRows = () => {
    if (boardRows < 12) {
      dispatch(increaseRows());
      dispatch(setBoardForSize({ rows: boardRows + 1, cols: boardCols }));
    }
  };

  const handleDecreaseRows = () => {
    if (boardRows > 4) {
      dispatch(decreaseRows());
      dispatch(setBoardForSize({ rows: boardRows - 1, cols: boardCols }));
    }
  };

  const handleIncreaseCols = () => {
    if (boardCols < 12) {
      dispatch(increaseCols());
      dispatch(setBoardForSize({ rows: boardRows, cols: boardCols + 1 }));
    }
  };

  const handleDecreaseCols = () => {
    if (boardCols > 4) {
      dispatch(decreaseCols());
      dispatch(setBoardForSize({ rows: boardRows, cols: boardCols - 1 }));
    }
  };

  const handleToggleEditor = () => {
    dispatch(toggleEditorMode());
  };

  const handleStartWithDesign = () => {
    dispatch(startWithDesign());
  };

  const handleSaveLevel = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("You need to be logged in to save levels.");
      return;
    }

    const name = levelName.trim() || `Level ${Date.now()}`;
    const levelsCollection = collection(db, "users", user.uid, "levels");
    const levelRef = doc(levelsCollection);
    const levelData = {
      id: levelRef.id,
      name: name,
      rows: boardRows,
      cols: boardCols,
      board: board.map((row) => row.map((cell) => ({ ...cell }))),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(levelRef, levelData);
      alert("Level saved!");
      dispatch(clearLevelName());
    } catch (error) {
      console.error("Failed to save level:", error);
      alert("Failed to save level.");
    }
  };

  const handleLoadLevels = () => {
    dispatch(setFocusMode(false));
    dispatch(setMode("selector"));
  };

  const handleSelectLevel = (selectedBoard: Cell[][] | null) => {
    if (selectedBoard) {
      dispatch(setBoardFromSavedLevel(selectedBoard));
      dispatch(
        setBoardSize({
          rows: selectedBoard.length,
          cols: selectedBoard[0]?.length || DEFAULT_COLS,
        }),
      );
    } else {
      dispatch(startNewRandomGame({ rows: boardRows, cols: boardCols, mines }));
    }
  };

  const handleBackToGame = () => {
    dispatch(setFocusMode(false));
    dispatch(setMode("game"));
  };

  const handleReveal = (row: number, col: number) => {
    dispatch(revealCell({ row, col }));
  };

  const handleFlag = (row: number, col: number) => {
    dispatch(toggleFlag({ row, col }));
  };

  const handleToggleMine = (row: number, col: number) => {
    dispatch(toggleMineInEditor({ row, col }));
  };

  let statusText = "Game over";

  if (editorMode) {
    statusText = "Design mode";
  } else if (gameStatus === "playing") {
    statusText = "Keep going";
  } else if (gameStatus === "won") {
    statusText = "You win!";
  }

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
      dispatch(setAuthScreen("login"));
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
      dispatch(setAuthScreen("register"));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(resetAuthUiState());
      dispatch(resetSettings());
      dispatch(setShowSplash(false));
      dispatch(
        resetGameState({
          rows: DEFAULT_ROWS,
          cols: DEFAULT_COLS,
          mines: DEFAULT_MINES,
        }),
      );
    } catch (error) {
      console.error("Logout failed", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const appContent = (() => {
    if (!isAuthReady) {
      return (
        <View style={styles.loginContainer}>
          <ActivityIndicator size="large" color="#B8D6FF" />
          <Text style={styles.loginSubtitle}>Loading your session...</Text>
        </View>
      );
    }

    if (!isAuthenticated) {
      if (authScreen === "register") {
        return (
          <RegisterScreen
            onRegister={handleRegister}
            onSwitchToLogin={() => dispatch(setAuthScreen("login"))}
          />
        );
      }

      return (
        <LoginScreen
          onLogin={handleLogin}
          onSwitchToRegister={() => dispatch(setAuthScreen("register"))}
        />
      );
    }

    if (mode === "selector") {
      return (
        <LevelSelector
          onSelectLevel={handleSelectLevel}
          onBack={handleBackToGame}
        />
      );
    }

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
          showsVerticalScrollIndicator={true}>
          <Text style={styles.title}>Minesweeper</Text>
          {isFocusMode && !editorMode ? (
            <View style={styles.panel}>
              <Text style={styles.panelText}>Mines: {mineCount}</Text>
              <Text
                style={styles.focusModeExit}
                onPress={() => dispatch(setFocusMode(false))}>
                Exit focus
              </Text>
            </View>
          ) : (
            <ControlPanel
              mineCount={mineCount}
              statusText={statusText}
              editorMode={editorMode}
              isFocusMode={isFocusMode}
              levelName={levelName}
              editorTool={editorTool}
              boardRows={boardRows}
              boardCols={boardCols}
              onLevelNameChange={(name) => dispatch(setLevelName(name))}
              onNewRandomGame={handleNewRandomGame}
              onToggleEditor={handleToggleEditor}
              onToggleFocusMode={() => dispatch(toggleFocusMode())}
              onToggleEditorTool={handleToggleEditorTool}
              onIncreaseRows={handleIncreaseRows}
              onDecreaseRows={handleDecreaseRows}
              onIncreaseCols={handleIncreaseCols}
              onDecreaseCols={handleDecreaseCols}
              onClearDesign={handleClearDesign}
              onStartWithDesign={handleStartWithDesign}
              onSaveLevel={handleSaveLevel}
              onLoadLevels={handleLoadLevels}
              onLogout={handleLogout}
            />
          )}
          <Board
            board={board}
            editorMode={editorMode}
            isFocusMode={isFocusMode && !editorMode}
            containerStyle={isFocusMode && !editorMode ? styles.focusModeBoard : undefined}
            onCellPress={(row, col) =>
              editorMode ? handleToggleMine(row, col) : handleReveal(row, col)
            }
            onCellLongPress={(row, col) => handleFlag(row, col)}
          />
          {isFocusMode ? null : (
            <Text style={styles.hint}>
              {editorMode
                ? "Design your level, then press Start game with design."
                : "Tap to reveal, long press to flag."}
            </Text>
          )}
        </ScrollView>
      </View>
    );
  })();

  return (
    <View style={styles.appRoot}>
      <Animated.View style={[styles.appFadeLayer, { opacity: appOpacity }]}>
        {appContent}
      </Animated.View>
      <Modal
        animationType="fade"
        transparent
        visible={showTutorialModal}
        onRequestClose={() => dispatch(setShowTutorialModal(false))}>
        <View style={styles.tutorialOverlay}>
          <View style={styles.tutorialCard}>
            <Text style={styles.tutorialTitle}>Quick start</Text>
            <Text style={styles.tutorialText}>
              Reveal all safe cells without hitting a mine.
            </Text>
            <Text style={styles.tutorialText}>
              Numbers show how many mines touch that cell.
            </Text>
            <Text style={styles.tutorialText}>
              Tap a cell to reveal it. Long press to place or remove a flag.
            </Text>
            <Text style={styles.tutorialText}>
              Use Focus mode when you want only the board, mine count, and exit button.
            </Text>
            <Pressable
              style={styles.tutorialButton}
              onPress={() => dispatch(setShowTutorialModal(false))}>
              <Text style={styles.tutorialButtonText}>Start playing</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {showSplash ? <SplashScreen opacity={splashOpacity} /> : null}
    </View>
  );
}
