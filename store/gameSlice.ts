import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Cell, GameStatus } from "../minesweeper.types";
import {
  checkWin,
  createBoardFromDesign,
  createEmptyBoard,
  generateBoard,
  revealCells,
  resetBoardState,
} from "../minesweeper.utils";

export type AppMode = "game" | "editor" | "selector";
export type EditorTool = "mine" | "reveal";

interface GameState {
  board: Cell[][];
  gameStatus: GameStatus;
  mode: AppMode;
  editorMode: boolean;
  isFocusMode: boolean;
  levelName: string;
  editorTool: EditorTool;
}

const initialState: GameState = {
  board: generateBoard(),
  gameStatus: "playing",
  mode: "game",
  editorMode: false,
  isFocusMode: false,
  levelName: "",
  editorTool: "mine",
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    startNewRandomGame: (
      state,
      action: PayloadAction<{ rows: number; cols: number; mines: number }>,
    ) => {
      const { rows, cols, mines } = action.payload;
      state.board = generateBoard(rows, cols, mines);
      state.gameStatus = "playing";
      state.mode = "game";
      state.editorMode = false;
      state.isFocusMode = false;
      state.levelName = "";
      state.editorTool = "mine";
    },
    clearDesign: (state, action: PayloadAction<{ rows: number; cols: number }>) => {
      const { rows, cols } = action.payload;
      state.board = createEmptyBoard(rows, cols);
      state.gameStatus = "playing";
      state.mode = "editor";
      state.editorMode = true;
      state.isFocusMode = false;
      state.levelName = "";
      state.editorTool = "mine";
    },
    setBoardFromSavedLevel: (state, action: PayloadAction<Cell[][]>) => {
      state.board = action.payload;
      state.gameStatus = "playing";
      state.mode = "game";
      state.editorMode = false;
      state.isFocusMode = false;
    },
    setBoardForSize: (state, action: PayloadAction<{ rows: number; cols: number }>) => {
      const { rows, cols } = action.payload;
      state.board = createEmptyBoard(rows, cols);
      state.gameStatus = "playing";
    },
    toggleEditorMode: (state) => {
      const nextEditorMode = !state.editorMode;
      state.editorMode = nextEditorMode;
      state.gameStatus = "playing";
      state.board = resetBoardState(state.board);
      state.mode = nextEditorMode ? "editor" : "game";
      state.isFocusMode = false;

      if (!nextEditorMode) {
        state.levelName = "";
      }

      if (nextEditorMode) {
        state.editorTool = "mine";
      }
    },
    startWithDesign: (state) => {
      state.board = createBoardFromDesign(state.board);
      state.gameStatus = "playing";
      state.mode = "game";
      state.editorMode = false;
      state.isFocusMode = false;
    },
    setMode: (state, action: PayloadAction<AppMode>) => {
      state.mode = action.payload;
    },
    setFocusMode: (state, action: PayloadAction<boolean>) => {
      state.isFocusMode = action.payload;
    },
    toggleFocusMode: (state) => {
      state.isFocusMode = !state.isFocusMode;
    },
    setLevelName: (state, action: PayloadAction<string>) => {
      state.levelName = action.payload;
    },
    clearLevelName: (state) => {
      state.levelName = "";
    },
    toggleEditorTool: (state) => {
      state.editorTool = state.editorTool === "mine" ? "reveal" : "mine";
    },
    revealCell: (state, action: PayloadAction<{ row: number; col: number }>) => {
      if (state.editorMode || state.gameStatus !== "playing") {
        return;
      }

      const { row, col } = action.payload;
      const cell = state.board[row]?.[col];

      if (!cell || cell.isRevealed || cell.isFlagged) {
        return;
      }

      if (cell.isMine) {
        state.board = state.board.map((rowCells) =>
          rowCells.map((currentCell) => ({
            ...currentCell,
            isRevealed: currentCell.isMine ? true : currentCell.isRevealed,
          })),
        );
        state.gameStatus = "lost";
        return;
      }

      const nextBoard = revealCells(state.board, row, col);
      state.board = nextBoard;

      if (checkWin(nextBoard)) {
        state.gameStatus = "won";
      }
    },
    toggleFlag: (state, action: PayloadAction<{ row: number; col: number }>) => {
      if (state.editorMode || state.gameStatus !== "playing") {
        return;
      }

      const { row, col } = action.payload;
      const cell = state.board[row]?.[col];

      if (!cell || cell.isRevealed) {
        return;
      }

      state.board[row][col].isFlagged = !state.board[row][col].isFlagged;
    },
    toggleMineInEditor: (
      state,
      action: PayloadAction<{ row: number; col: number }>,
    ) => {
      if (!state.editorMode) {
        return;
      }

      const { row, col } = action.payload;
      const currentBoard = state.board.map((rowCells) =>
        rowCells.map((cell) => ({ ...cell })),
      );
      const cell = currentBoard[row]?.[col];

      if (!cell) {
        return;
      }

      if (state.editorTool === "mine") {
        cell.isMine = !cell.isMine;
        cell.isRevealed = false;
        cell.isFlagged = false;
      } else {
        if (cell.isMine) {
          return;
        }
        cell.isRevealed = !cell.isRevealed;
        cell.isFlagged = false;
      }

      state.board = createBoardFromDesign(currentBoard);
    },
    resetGameState: (
      state,
      action: PayloadAction<{ rows: number; cols: number; mines: number }>,
    ) => {
      const { rows, cols, mines } = action.payload;
      state.board = generateBoard(rows, cols, mines);
      state.gameStatus = "playing";
      state.mode = "game";
      state.editorMode = false;
      state.isFocusMode = false;
      state.levelName = "";
      state.editorTool = "mine";
    },
  },
});

export const {
  startNewRandomGame,
  clearDesign,
  setBoardFromSavedLevel,
  setBoardForSize,
  toggleEditorMode,
  startWithDesign,
  setMode,
  setFocusMode,
  toggleFocusMode,
  setLevelName,
  clearLevelName,
  toggleEditorTool,
  revealCell,
  toggleFlag,
  toggleMineInEditor,
  resetGameState,
} = gameSlice.actions;

export default gameSlice.reducer;
