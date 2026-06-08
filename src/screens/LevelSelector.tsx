import { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, Alert, Platform } from "react-native";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { styles } from "../styles";
import { Cell } from "../minesweeper.types";
import { auth, db } from "../firebase";
import { useAppSelector } from "../store/hooks";

type LevelSelectorProps = Readonly<{
  onSelectLevel: (board: Cell[][] | null) => void;
  onBack: () => void;
}>;

type SavedLevel = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  board: Cell[][];
};

type FirestoreLevel = {
  id?: string;
  name?: string;
  rows?: number;
  cols?: number;
  cells?: Cell[];
  board?: Cell[][];
};

function toBoard(rows: number, cols: number, cells: Cell[]): Cell[][] {
  const totalCells = rows * cols;
  const normalizedCells = cells.slice(0, totalCells);

  while (normalizedCells.length < totalCells) {
    const index = normalizedCells.length;
    const row = Math.floor(index / cols);
    const col = index % cols;
    normalizedCells.push({
      row,
      col,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
    });
  }

  return Array.from({ length: rows }, (_, rowIndex) =>
    normalizedCells
      .slice(rowIndex * cols, (rowIndex + 1) * cols)
      .map((cell, colIndex) => ({
        ...cell,
        row: rowIndex,
        col: colIndex,
      })),
  );
}

function normalizeBoard(board: Cell[][], rows: number, cols: number): Cell[][] | null {
  if (board.length !== rows) {
    return null;
  }

  const normalizedBoard: Cell[][] = [];

  for (let rowIndex = 0; rowIndex < board.length; rowIndex += 1) {
    const row = board[rowIndex];
    if (!Array.isArray(row) || row.length !== cols) {
      return null;
    }

    const normalizedRow: Cell[] = [];
    for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
      normalizedRow.push({
        ...row[colIndex],
        row: rowIndex,
        col: colIndex,
      });
    }

    normalizedBoard.push(normalizedRow);
  }

  return normalizedBoard;
}

function parseSavedLevel(levelDoc: {
  id: string;
  data: () => FirestoreLevel;
}): SavedLevel | null {
  const data = levelDoc.data();
  const rows = typeof data.rows === "number" ? data.rows : 0;
  const cols = typeof data.cols === "number" ? data.cols : 0;

  if (!rows || !cols || typeof data.name !== "string") {
    return null;
  }

  let board: Cell[][];
  if (Array.isArray(data.cells)) {
    board = toBoard(rows, cols, data.cells);
  } else if (Array.isArray(data.board)) {
    board = data.board;
  } else {
    board = toBoard(rows, cols, []);
  }

  const normalizedBoard = normalizeBoard(board, rows, cols);
  if (!normalizedBoard) {
    return null;
  }

  return {
    id: levelDoc.id,
    name: data.name,
    rows,
    cols,
    board: normalizedBoard,
  };
}

export function LevelSelector({ onSelectLevel, onBack }: LevelSelectorProps) {
  const [savedLevels, setSavedLevels] = useState<SavedLevel[]>([]);
  const authUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const uid = authUser?.uid ?? auth.currentUser?.uid;
    if (!uid) {
      setSavedLevels([]);
      return;
    }

    const levelsRef = collection(db, "users", uid, "levels");
    const levelsQuery = query(levelsRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      levelsQuery,
      (snapshot) => {
        const levels = snapshot.docs
          .map((levelDoc) => parseSavedLevel(levelDoc))
          .filter((level): level is SavedLevel => level !== null);

        setSavedLevels(levels);
      },
      (error) => {
        console.error("Failed to load levels:", error);
      },
    );

    return unsubscribe;
  }, [authUser?.uid]);

  const deleteLevel = async (id: string) => {
    const uid = authUser?.uid ?? auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Login required", "You must be logged in to delete levels.");
      return;
    }

    try {
      await deleteDoc(doc(db, "users", uid, "levels", id));
    } catch (error) {
      console.error("Failed to delete level:", error);
      Alert.alert("Delete failed", "Could not delete this level. Please try again.");
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
        void deleteLevel(id);
      }
      return;
    }

    Alert.alert("Delete Level", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteLevel(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Level</Text>
      <Pressable
        style={styles.actionButton}
        onPress={() => onSelectLevel(null)}>
        <Text style={styles.resetText}>Random Game</Text>
      </Pressable>
      <Text style={[styles.hint, { marginTop: 20 }]}>Saved Levels:</Text>
      <FlatList
        style={styles.levelList}
        data={savedLevels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.levelItem}>
            <Pressable
              style={styles.levelButton}
              onPress={() => onSelectLevel(item.board)}>
              <Text
                style={styles.resetText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.name} ({item.rows}×{item.cols})
              </Text>
            </Pressable>
            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id, item.name)}>
              <Text style={styles.resetText}>Delete</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.hint}>No saved levels yet.</Text>
        }
      />
      <Pressable
        style={[styles.actionButton, { marginTop: 20 }]}
        onPress={onBack}>
        <Text style={styles.resetText}>Back</Text>
      </Pressable>
    </View>
  );
}
