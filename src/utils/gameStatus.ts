export const getStatusText = (
  gameStatus: "playing" | "won" | "lost",
  editorMode: boolean,
) => {
  if (editorMode) {
    return "Design mode";
  }

  if (gameStatus === "playing") {
    return "Keep going";
  }

  if (gameStatus === "won") {
    return "You win!";
  }

  return "Game over";
};