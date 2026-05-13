import { View, Text, Pressable } from "react-native";
import { Cell } from "../minesweeper.types";
import { styles } from "../styles";

type BoardProps = {
  board: Cell[][];
  editorMode: boolean;
  onCellPress: (row: number, col: number) => void;
  onCellLongPress: (row: number, col: number) => void;
};

export function Board({
  board,
  editorMode,
  onCellPress,
  onCellLongPress,
}: BoardProps) {
  return (
    <View style={styles.board}>
      {board.map((rowCells, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {rowCells.map((cell) => {
            const hidden = !cell.isRevealed;
            const showFlag = cell.isFlagged && hidden;
            const showMine = editorMode
              ? cell.isMine
              : cell.isRevealed && cell.isMine;
            const showNumber =
              cell.isRevealed && !cell.isMine && cell.neighborMines > 0;

            let cellText = "";
            if (showMine) cellText = "💣";
            else if (showFlag) cellText = "🚩";
            else if (showNumber) cellText = String(cell.neighborMines);

            return (
              <Pressable
                key={`${cell.row}-${cell.col}`}
                style={[
                  styles.cell,
                  cell.isRevealed && styles.cellRevealed,
                  editorMode && cell.isMine && styles.cellDesignMine,
                  showFlag && styles.cellFlagged,
                  showMine && !editorMode && styles.cellMine,
                ]}
                onPress={() => onCellPress(cell.row, cell.col)}
                onLongPress={() => onCellLongPress(cell.row, cell.col)}>
                <Text
                  style={[
                    styles.cellText,
                    cell.isRevealed && styles.cellTextRevealed,
                    editorMode && styles.cellTextEditor,
                  ]}>
                  {cellText}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
