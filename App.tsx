import { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
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
import { Cell, GameStatus } from "./minesweeper.types";
import {
  createBoardFromDesign,
  createEmptyBoard,
  generateBoard,
  revealCells,
  resetBoardState,
  checkWin,
  DEFAULT_ROWS,
  DEFAULT_COLS,
} from "./minesweeper.utils";

type AppMode = "game" | "editor" | "selector";
type AuthScreen = "login" | "register";

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
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const appOpacity = useRef(new Animated.Value(0)).current;
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const [board, setBoard] = useState<Cell[][]>(() => generateBoard());
  const [status, setStatus] = useState<GameStatus>("playing");
  const [mode, setMode] = useState<AppMode>("game");
  const [editorMode, setEditorMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [levelName, setLevelName] = useState("");
  const [editorTool, setEditorTool] = useState<"mine" | "reveal">("mine");
  const [boardRows, setBoardRows] = useState(DEFAULT_ROWS);
  const [boardCols, setBoardCols] = useState(DEFAULT_COLS);

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
      ]).start(() => setShowSplash(false));
    }, 1200);

    return () => {
      clearTimeout(holdTimer);
      splashOpacity.stopAnimation();
      appOpacity.stopAnimation();
    };
  }, [appOpacity, splashOpacity]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(Boolean(user));
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  const handleNewRandomGame = () => {
    setBoard(generateBoard(boardRows, boardCols));
    setStatus("playing");
    setMode("game");
    setEditorMode(false);
    setIsFocusMode(false);
    setLevelName("");
  };

  const handleClearDesign = () => {
    setBoard(createEmptyBoard(boardRows, boardCols));
    setStatus("playing");
    setMode("editor");
    setEditorMode(true);
    setIsFocusMode(false);
    setEditorTool("mine");
  };
  const handleToggleEditorTool = () => {
    setEditorTool((prev) => (prev === "mine" ? "reveal" : "mine"));
  };

  const handleIncreaseRows = () => {
    if (boardRows < 16) {
      const newRows = boardRows + 1;
      setBoardRows(newRows);
      setBoard(createEmptyBoard(newRows, boardCols));
    }
  };

  const handleDecreaseRows = () => {
    if (boardRows > 4) {
      const newRows = boardRows - 1;
      setBoardRows(newRows);
      setBoard(createEmptyBoard(newRows, boardCols));
    }
  };

  const handleIncreaseCols = () => {
    if (boardCols < 16) {
      const newCols = boardCols + 1;
      setBoardCols(newCols);
      setBoard(createEmptyBoard(boardRows, newCols));
    }
  };

  const handleDecreaseCols = () => {
    if (boardCols > 4) {
      const newCols = boardCols - 1;
      setBoardCols(newCols);
      setBoard(createEmptyBoard(boardRows, newCols));
    }
  };
  const handleToggleEditor = () => {
    const nextMode = !editorMode;
    setEditorMode(nextMode);
    setStatus("playing");
    setBoard((currentBoard) => resetBoardState(currentBoard));
    setMode(nextMode ? "editor" : "game");
    setIsFocusMode(false);
    if (!nextMode) {
      setLevelName("");
    }
    if (nextMode) {
      setEditorTool("mine");
    }
  };

  const handleStartWithDesign = () => {
    setBoard((previousBoard) => createBoardFromDesign(previousBoard));
    setStatus("playing");
    setMode("game");
    setEditorMode(false);
    setIsFocusMode(false);
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
      setLevelName("");
    } catch (error) {
      console.error("Failed to save level:", error);
      alert("Failed to save level.");
    }
  };

  const handleLoadLevels = () => {
    setIsFocusMode(false);
    setMode("selector");
  };

  const handleSelectLevel = (selectedBoard: Cell[][] | null) => {
    if (selectedBoard) {
      setBoard(selectedBoard);
      setBoardRows(selectedBoard.length);
      setBoardCols(selectedBoard[0]?.length || DEFAULT_COLS);
    } else {
      setBoard(generateBoard(boardRows, boardCols));
    }
    setStatus("playing");
    setMode("game");
    setEditorMode(false);
    setIsFocusMode(false);
  };

  const handleBackToGame = () => {
    setIsFocusMode(false);
    setMode("game");
  };

  const handleReveal = (row: number, col: number) => {
    if (editorMode || status !== "playing") return;

    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) return;

    if (cell.isMine) {
      setBoard(
        board.map((rowCells) =>
          rowCells.map((currentCell) => ({
            ...currentCell,
            isRevealed: currentCell.isMine ? true : currentCell.isRevealed,
          })),
        ),
      );
      setStatus("lost");
      return;
    }

    const nextBoard = revealCells(board, row, col);
    setBoard(nextBoard);

    if (checkWin(nextBoard)) {
      setStatus("won");
    }
  };

  const handleFlag = (row: number, col: number) => {
    if (editorMode || status !== "playing") return;

    setBoard((previousBoard) =>
      previousBoard.map((rowCells) =>
        rowCells.map((cell) => {
          if (cell.row === row && cell.col === col && !cell.isRevealed) {
            return { ...cell, isFlagged: !cell.isFlagged };
          }
          return cell;
        }),
      ),
    );
  };

  const handleToggleMine = (row: number, col: number) => {
    if (!editorMode) return;

    setBoard((previousBoard) => {
      const nextBoard = previousBoard.map((rowCells) =>
        rowCells.map((cell) => ({ ...cell })),
      );
      const cell = nextBoard[row][col];

      if (editorTool === "mine") {
        cell.isMine = !cell.isMine;
        cell.isRevealed = false;
        cell.isFlagged = false;
      } else if (editorTool === "reveal") {
        if (cell.isMine) {
          // Don't allow revealing mines in editor
          return previousBoard;
        }
        cell.isRevealed = !cell.isRevealed;
        cell.isFlagged = false;
      }

      return createBoardFromDesign(nextBoard);
    });
  };

  let statusText = "Game over";

  if (editorMode) {
    statusText = "Design mode";
  } else if (status === "playing") {
    statusText = "Keep going";
  } else if (status === "won") {
    statusText = "You win!";
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMode("game");
      return null;
    } catch (error) {
      console.error("Login failed", error);
      return getAuthErrorMessage(error, "login");
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMode("game");
      return null;
    } catch (error) {
      console.error("Registration failed", error);
      return getAuthErrorMessage(error, "register");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthScreen("login");
      setMode("game");
      setEditorMode(false);
      setIsFocusMode(false);
      setStatus("playing");
      setBoardRows(DEFAULT_ROWS);
      setBoardCols(DEFAULT_COLS);
      setBoard(generateBoard(DEFAULT_ROWS, DEFAULT_COLS));
      setLevelName("");
      setEditorTool("mine");
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
            onSwitchToLogin={() => setAuthScreen("login")}
          />
        );
      }

      return (
        <LoginScreen
          onLogin={handleLogin}
          onSwitchToRegister={() => setAuthScreen("register")}
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
              <Text style={styles.focusModeExit} onPress={() => setIsFocusMode(false)}>
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
              onLevelNameChange={setLevelName}
              onNewRandomGame={handleNewRandomGame}
              onToggleEditor={handleToggleEditor}
              onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
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
            onCellPress={(row, col) =>
              editorMode ? handleToggleMine(row, col) : handleReveal(row, col)
            }
            onCellLongPress={(row, col) => handleFlag(row, col)}
          />
          {!isFocusMode ? (
            <Text style={styles.hint}>
              {editorMode
                ? "Design your level, then press Start game with design."
                : "Tap to reveal, long press to flag."}
            </Text>
          ) : null}
        </ScrollView>
      </View>
    );
  })();

  return (
    <View style={styles.appRoot}>
      <Animated.View style={[styles.appFadeLayer, { opacity: appOpacity }]}>
        {appContent}
      </Animated.View>
      {showSplash ? <SplashScreen opacity={splashOpacity} /> : null}
    </View>
  );
}
