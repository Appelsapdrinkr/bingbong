import { createContext, useContext, type PropsWithChildren } from "react";

type AppContextValue = {
  appName: string;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({ children }: PropsWithChildren) {
  return (
    <AppContext.Provider value={{ appName: "Minesweeper" }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppContextProvider");
  }
  return context;
}
