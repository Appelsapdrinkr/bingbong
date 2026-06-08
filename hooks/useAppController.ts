import { useRef } from "react";
import { Animated } from "react-native";
import { useAppSelector } from "../store/hooks";
import { useAppBootstrap } from "./useAppBootstrap";
import { useAuthHandlers } from "./useAuthHandlers";
import { useGameHandlers } from "./useGameHandlers";

export type AppController = ReturnType<typeof useAppController>;

export function useAppController() {
  const { showSplash } = useAppSelector((state) => state.ui);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const appOpacity = useRef(new Animated.Value(0)).current;
  const gameHandlers = useGameHandlers();
  const authHandlers = useAuthHandlers();

  useAppBootstrap(splashOpacity, appOpacity);

  return {
    splashOpacity,
    appOpacity,
    showSplash,
    ...authHandlers,
    ...gameHandlers,
  };
}