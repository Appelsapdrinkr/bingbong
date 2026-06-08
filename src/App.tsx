import { AppShell } from "./components";
import { useAppController } from "./hooks/useAppController";
import { Bangers_400Regular, useFonts } from "@expo-google-fonts/bangers";

export default function App() {
  const controller = useAppController();
  const [fontsLoaded] = useFonts({
    Bangers_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return <AppShell controller={controller} />;
}
