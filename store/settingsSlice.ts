import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DEFAULT_COLS,
  DEFAULT_MINES,
  DEFAULT_ROWS,
} from "../minesweeper.utils";

const MIN_BOARD_SIZE = 4;
const MAX_BOARD_SIZE = 12;

interface SettingsState {
  rows: number;
  cols: number;
  mines: number;
}

const initialState: SettingsState = {
  rows: DEFAULT_ROWS,
  cols: DEFAULT_COLS,
  mines: DEFAULT_MINES,
};

const clampMines = (mines: number, rows: number, cols: number) =>
  Math.max(1, Math.min(mines, rows * cols - 1));

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setBoardSize: (
      state,
      action: PayloadAction<{ rows: number; cols: number }>,
    ) => {
      state.rows = Math.max(
        MIN_BOARD_SIZE,
        Math.min(action.payload.rows, MAX_BOARD_SIZE),
      );
      state.cols = Math.max(
        MIN_BOARD_SIZE,
        Math.min(action.payload.cols, MAX_BOARD_SIZE),
      );
      state.mines = clampMines(state.mines, state.rows, state.cols);
    },
    increaseRows: (state) => {
      state.rows = Math.min(state.rows + 1, MAX_BOARD_SIZE);
      state.mines = clampMines(state.mines, state.rows, state.cols);
    },
    decreaseRows: (state) => {
      state.rows = Math.max(state.rows - 1, MIN_BOARD_SIZE);
      state.mines = clampMines(state.mines, state.rows, state.cols);
    },
    increaseCols: (state) => {
      state.cols = Math.min(state.cols + 1, MAX_BOARD_SIZE);
      state.mines = clampMines(state.mines, state.rows, state.cols);
    },
    decreaseCols: (state) => {
      state.cols = Math.max(state.cols - 1, MIN_BOARD_SIZE);
      state.mines = clampMines(state.mines, state.rows, state.cols);
    },
    setMines: (state, action: PayloadAction<number>) => {
      state.mines = clampMines(action.payload, state.rows, state.cols);
    },
    resetSettings: (state) => {
      state.rows = DEFAULT_ROWS;
      state.cols = DEFAULT_COLS;
      state.mines = DEFAULT_MINES;
    },
  },
});

export const {
  setBoardSize,
  increaseRows,
  decreaseRows,
  increaseCols,
  decreaseCols,
  setMines,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
