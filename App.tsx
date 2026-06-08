import { AppShell } from "./components/AppShell";
import { useAppController } from "./hooks/useAppController";

export default function App() {
  return <AppShell controller={useAppController()} />;
}
