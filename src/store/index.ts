import { configureStore } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import gameReducer from "./gameSlice";
import authReducer from "./authSlice";
import settingsReducer from "./settingsSlice";
import uiReducer from "./uiSlice";

const appReducer = {
  game: gameReducer,
  auth: authReducer,
  settings: settingsReducer,
  ui: uiReducer,
};

type AppReducerState = {
  game: ReturnType<typeof gameReducer>;
  auth: ReturnType<typeof authReducer>;
  settings: ReturnType<typeof settingsReducer>;
  ui: ReturnType<typeof uiReducer>;
};

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["game", "settings", "ui"],
} as const;

const persistedReducer = persistReducer<AppReducerState>(persistConfig, appReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type { AppReducerState as RootState };
export type AppDispatch = typeof store.dispatch;
