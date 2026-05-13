import { View, Text, Pressable, TextInput } from "react-native";
import { styles } from "../styles";

type ControlPanelProps = {
  mineCount: number;
  statusText: string;
  editorMode: boolean;
  levelName: string;
  editorTool: "mine" | "reveal";
  boardRows: number;
  boardCols: number;
  onLevelNameChange: (name: string) => void;
  onNewRandomGame: () => void;
  onToggleEditor: () => void;
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
};

export function ControlPanel({
  mineCount,
  statusText,
  editorMode,
  levelName,
  editorTool,
  boardRows,
  boardCols,
  onLevelNameChange,
  onNewRandomGame,
  onToggleEditor,
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
}: ControlPanelProps) {
  return (
    <>
      <View style={styles.panel}>
        <Text style={styles.panelText}>Mines: {mineCount}</Text>
        <Text
          style={[
            styles.panelText,
            !editorMode && statusText !== "Keep going" && styles.statusText,
          ]}>
          Status: {statusText}
        </Text>
      </View>
      <View style={styles.panelRow}>
        <Pressable style={styles.actionButton} onPress={onNewRandomGame}>
          <Text style={styles.resetText}>New random game</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onToggleEditor}>
          <Text style={styles.resetText}>
            {editorMode ? "Close editor" : "Edit level"}
          </Text>
        </Pressable>
        {editorMode && (
          <Pressable style={styles.actionButton} onPress={onClearDesign}>
            <Text style={styles.resetText}>Clear design</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.panelRow}>
        <Pressable style={styles.actionButton} onPress={onLoadLevels}>
          <Text style={styles.resetText}>Load levels</Text>
        </Pressable>
        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.resetText}>Log out</Text>
        </Pressable>
        {editorMode && (
          <Pressable style={styles.actionButton} onPress={onSaveLevel}>
            <Text style={styles.resetText}>Save level</Text>
          </Pressable>
        )}
      </View>
      {editorMode && (
        <View style={[styles.editorInfo, { backgroundColor: "#1a2b4a" }]}>
          <TextInput
            style={styles.levelNameInput}
            placeholder="Enter level name"
            value={levelName}
            onChangeText={onLevelNameChange}
            maxLength={50}
          />
          <View style={[styles.panelRow, { marginTop: 25 }]}>
            <Text style={[styles.hint, { marginRight: 10 }]}>
              Size: {boardRows}×{boardCols}
            </Text>
          </View>
          <View style={[styles.panelRow, { marginTop: 25 }]}>
            <Text style={styles.hint}>Rows:</Text>
            <Pressable
              style={[styles.actionButton, { marginHorizontal: 5 }]}
              onPress={onDecreaseRows}>
              <Text style={styles.resetText}>-</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, { marginHorizontal: 5 }]}
              onPress={onIncreaseRows}>
              <Text style={styles.resetText}>+</Text>
            </Pressable>
          </View>
          <View style={[styles.panelRow, { marginTop: 25 }]}>
            <Text style={styles.hint}>Cols:</Text>
            <Pressable
              style={[styles.actionButton, { marginHorizontal: 5 }]}
              onPress={onDecreaseCols}>
              <Text style={styles.resetText}>-</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, { marginHorizontal: 5 }]}
              onPress={onIncreaseCols}>
              <Text style={styles.resetText}>+</Text>
            </Pressable>
          </View>
          <View style={[styles.panelRow, { marginTop: 25 }]}>
            <Pressable style={styles.actionButton} onPress={onToggleEditorTool}>
              <Text style={styles.resetText}>
                Tool: {editorTool === "mine" ? "💣 Mine" : "👁️ Reveal"}
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.hint, { marginTop: 30, textAlign: "center" }]}>
            Tap cells to{" "}
            {editorTool === "mine" ? "toggle mines" : "toggle revealed state"}.
          </Text>
          <Pressable
            style={[styles.startButton, { marginTop: 30 }]}
            onPress={onStartWithDesign}>
            <Text style={styles.resetText}>Start game with design</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}
