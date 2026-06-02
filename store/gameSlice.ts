import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Cell, GameStatus } from "../minesweeper.types";

interface GameState {
  board: Cell[];
  gameStatus: GameStatus;
  elapsedTime: number;
  // Add more game state properties as needed
}

const initialState: GameState = {
  board: [],
  gameStatus: "playing",
  elapsedTime: 0,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // Add reducers here
  },
});

export default gameSlice.reducer;
