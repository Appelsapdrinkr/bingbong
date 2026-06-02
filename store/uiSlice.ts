import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  showSplash: boolean;
}

const initialState: UiState = {
  showSplash: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setShowSplash: (state, action: PayloadAction<boolean>) => {
      state.showSplash = action.payload;
    },
  },
});

export const { setShowSplash } = uiSlice.actions;

export default uiSlice.reducer;
