import { ScrollView, Text, View } from "react-native";
import { Cell } from "../minesweeper.types";
import type { EditorTool } from "../store/gameSlice";
import { styles } from "../styles";
import { Board } from "./Board";
import { ControlPanel } from "./ControlPanel";
import { PageHeader } from "./PageHeader";

export type GameScreenProps = Readonly<{
  board: Cell[][];
  mineCount: number;
  statusText: string;
  editorMode: boolean;
  isFocusMode: boolean;
  levelName: string;
  editorTool: EditorTool;
  boardRows: number;
  boardCols: number;
  onLevelNameChange: (name: string) => void;
  onNewRandomGame: () => void;
  onToggleEditor: () => void;
  onToggleFocusMode: () => void;
  onExitFocusMode: () => void;
  onToggleEditorTool: () => void;
  onIncreaseRows: () => void;
  onDecreaseRows: () => void;
  onIncreaseCols: () => void;
  onDecreaseCols: () => void;
  onClearDesign: () => void;
  onStartWithDesign: () => void;
  onSaveLevel: () => void;
  onLoadLevels: () => void;
  onLogout: () => void;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  onToggleMine: (row: number, col: number) => void;
}>;

export function GameScreen({
  board,
  mineCount,
  statusText,
  editorMode,
  isFocusMode,
  levelName,
  editorTool,
  boardRows,
  boardCols,
  onLevelNameChange,
  onNewRandomGame,
  onToggleEditor,
  onToggleFocusMode,
  onExitFocusMode,
  onToggleEditorTool,
  onIncreaseRows,
  onDecreaseRows,
  onIncreaseCols,
  onDecreaseCols,
  onClearDesign,
  onStartWithDesign,
  onSaveLevel,
  onLoadLevels,
  onLogout,
  onReveal,
  onFlag,
  onToggleMine,
}: GameScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
        showsVerticalScrollIndicator={true}>
        {isFocusMode && !editorMode ? null : <PageHeader />}
        {isFocusMode && !editorMode ? (
          <View style={styles.panel}>
            <Text style={styles.panelText}>Mines: {mineCount}</Text>
            <Text style={styles.focusModeExit} onPress={onExitFocusMode}>
              Exit focus
            </Text>
          </View>
        ) : (
          <ControlPanel
            mineCount={mineCount}
            statusText={statusText}
            editorMode={editorMode}
            isFocusMode={isFocusMode}
            levelName={levelName}
            editorTool={editorTool}
            boardRows={boardRows}
            boardCols={boardCols}
            onLevelNameChange={onLevelNameChange}
            onNewRandomGame={onNewRandomGame}
            onToggleEditor={onToggleEditor}
            onToggleFocusMode={onToggleFocusMode}
            onToggleEditorTool={onToggleEditorTool}
            onIncreaseRows={onIncreaseRows}
            onDecreaseRows={onDecreaseRows}
            onIncreaseCols={onIncreaseCols}
            onDecreaseCols={onDecreaseCols}
            onClearDesign={onClearDesign}
            onStartWithDesign={onStartWithDesign}
            onSaveLevel={onSaveLevel}
            onLoadLevels={onLoadLevels}
            onLogout={onLogout}
          />
        )}
        <Board
          board={board}
          editorMode={editorMode}
          isFocusMode={isFocusMode && !editorMode}
          containerStyle={isFocusMode && !editorMode ? styles.focusModeBoard : undefined}
          onCellPress={(row, col) =>
            editorMode ? onToggleMine(row, col) : onReveal(row, col)
          }
          onCellLongPress={onFlag}
        />
        {isFocusMode ? null : (
          <Text style={styles.hint}>
            {editorMode
              ? "Design your level, then press Start game with design."
              : "Tap to reveal, long press to flag."}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}