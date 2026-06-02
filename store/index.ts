import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice";
import authReducer from "./authSlice";
import settingsReducer from "./settingsSlice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    auth: authReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
