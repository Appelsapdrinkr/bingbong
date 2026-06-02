import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice";
import authReducer from "./authSlice";
import settingsReducer from "./settingsSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    auth: authReducer,
    settings: settingsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
