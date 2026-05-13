import { useEffect, useState } from "react";
import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
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

export default function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const [board, setBoard] = useState<Cell[][]>(() => generateBoard());
  const [status, setStatus] = useState<GameStatus>("playing");
  const [mode, setMode] = useState<AppMode>("game");
  const [editorMode, setEditorMode] = useState(false);
  const [levelName, setLevelName] = useState("");
  const [editorTool, setEditorTool] = useState<"mine" | "reveal">("mine");
  const [boardRows, setBoardRows] = useState(DEFAULT_ROWS);
  const [boardCols, setBoardCols] = useState(DEFAULT_COLS);

  const mineCount = board.flat().filter((cell) => cell.isMine).length;

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
    setLevelName("");
  };

  const handleClearDesign = () => {
    setBoard(createEmptyBoard(boardRows, boardCols));
    setStatus("playing");
    setMode("editor");
    setEditorMode(true);
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
  };

  const handleBackToGame = () => {
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
      return "Unable to log in with these credentials.";
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMode("game");
      return null;
    } catch (error) {
      console.error("Registration failed", error);
      return "Unable to create account. Try a different email.";
    }
  };

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
        <ControlPanel
          mineCount={mineCount}
          statusText={statusText}
          editorMode={editorMode}
          levelName={levelName}
          editorTool={editorTool}
          boardRows={boardRows}
          boardCols={boardCols}
          onLevelNameChange={setLevelName}
          onNewRandomGame={handleNewRandomGame}
          onToggleEditor={handleToggleEditor}
          onToggleEditorTool={handleToggleEditorTool}
          onIncreaseRows={handleIncreaseRows}
          onDecreaseRows={handleDecreaseRows}
          onIncreaseCols={handleIncreaseCols}
          onDecreaseCols={handleDecreaseCols}
          onClearDesign={handleClearDesign}
          onStartWithDesign={handleStartWithDesign}
          onSaveLevel={handleSaveLevel}
          onLoadLevels={handleLoadLevels}
        />
        <Board
          board={board}
          editorMode={editorMode}
          onCellPress={(row, col) =>
            editorMode ? handleToggleMine(row, col) : handleReveal(row, col)
          }
          onCellLongPress={(row, col) => handleFlag(row, col)}
        />
        <Text style={styles.hint}>
          {editorMode
            ? "Design your level, then press Start game with design."
            : "Tap to reveal, long press to flag."}
        </Text>
      </ScrollView>
    </View>
  );
}
