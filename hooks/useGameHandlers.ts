import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import type { AppNavigatorProps } from "../components/AppNavigator";
import type { GameScreenProps } from "../components/GameScreen";
import { auth, db } from "../firebase";
import { Cell } from "../minesweeper.types";
import {
  DEFAULT_COLS,
  DEFAULT_MINES,
  DEFAULT_ROWS,
} from "../minesweeper.utils";
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
} from "../store/gameSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  decreaseCols,
  decreaseRows,
  increaseCols,
  increaseRows,
  resetSettings,
  setBoardSize,
} from "../store/settingsSlice";
import { resetAuthUiState } from "../store/authSlice";
import { setShowSplash } from "../store/uiSlice";

function getStatusText(gameStatus: "playing" | "won" | "lost", editorMode: boolean) {
  if (editorMode) {
    return "Design mode";
  }

  if (gameStatus === "playing") {
    return "Keep going";
  }

  if (gameStatus === "won") {
    return "You win!";
  }

  return "Game over";
}

export function useGameHandlers(): {
  gameScreenProps: GameScreenProps;
  onLoadLevels: AppNavigatorProps["onLoadLevels"];
  onSelectLevel: AppNavigatorProps["onSelectLevel"];
  onBackToGame: AppNavigatorProps["onBackToGame"];
  mode: AppNavigatorProps["mode"];
} {
  const dispatch = useAppDispatch();
  const {
    board,
    gameStatus,
    mode,
    editorMode,
    isFocusMode,
    levelName,
    editorTool,
  } = useAppSelector((state) => state.game);
  const authUser = useAppSelector((state) => state.auth.user);
  const { rows: boardRows, cols: boardCols, mines } = useAppSelector(
    (state) => state.settings,
  );

  const mineCount = board.flat().filter((cell) => cell.isMine).length;
  const statusText = getStatusText(gameStatus, editorMode);

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
    const uid = authUser?.uid ?? auth.currentUser?.uid;
    if (!uid) {
      alert("You need to be logged in to save levels.");
      return;
    }

    const name = levelName.trim() || `Level ${Date.now()}`;
    const levelsCollection = collection(db, "users", uid, "levels");
    const levelRef = doc(levelsCollection);
    const serializedCells = board.flatMap((row, rowIndex) =>
      row.map((cell, colIndex) => ({
        row: Number.isFinite(cell.row) ? cell.row : rowIndex,
        col: Number.isFinite(cell.col) ? cell.col : colIndex,
        isMine: Boolean(cell.isMine),
        isRevealed: Boolean(cell.isRevealed),
        isFlagged: Boolean(cell.isFlagged),
        neighborMines: Number.isFinite(cell.neighborMines) ? cell.neighborMines : 0,
      })),
    );

    const levelData = {
      id: levelRef.id,
      name,
      rows: boardRows,
      cols: boardCols,
      // Firestore disallows nested arrays, so persist board as a flat cell list.
      cells: serializedCells,
      createdAt: serverTimestamp(),
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
      return;
    }

    dispatch(startNewRandomGame({ rows: boardRows, cols: boardCols, mines }));
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

  return {
    mode,
    gameScreenProps: {
      board,
      mineCount,
      statusText,
      editorMode,
      isFocusMode,
      levelName,
      editorTool,
      boardRows,
      boardCols,
      onLevelNameChange: (name: string) => dispatch(setLevelName(name)),
      onNewRandomGame: handleNewRandomGame,
      onToggleEditor: handleToggleEditor,
      onToggleFocusMode: () => dispatch(toggleFocusMode()),
      onExitFocusMode: () => dispatch(setFocusMode(false)),
      onToggleEditorTool: handleToggleEditorTool,
      onIncreaseRows: handleIncreaseRows,
      onDecreaseRows: handleDecreaseRows,
      onIncreaseCols: handleIncreaseCols,
      onDecreaseCols: handleDecreaseCols,
      onClearDesign: handleClearDesign,
      onStartWithDesign: handleStartWithDesign,
      onSaveLevel: handleSaveLevel,
      onLoadLevels: handleLoadLevels,
      onLogout: handleLogout,
      onReveal: handleReveal,
      onFlag: handleFlag,
      onToggleMine: handleToggleMine,
    },
    onLoadLevels: handleLoadLevels,
    onSelectLevel: handleSelectLevel,
    onBackToGame: handleBackToGame,
  };
}