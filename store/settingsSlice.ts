import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  rows: number;
  cols: number;
  mines: number;
  // Add more settings as needed
}

const initialState: SettingsState = {
  rows: 10,
  cols: 10,
  mines: 10,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // Add reducers here
  },
});

export default settingsSlice.reducer;
