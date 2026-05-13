import { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../styles";
import { Cell } from "../minesweeper.types";

type LevelSelectorProps = {
  onSelectLevel: (board: Cell[][] | null) => void;
  onBack: () => void;
};

type SavedLevel = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  board: Cell[][];
};

export function LevelSelector({ onSelectLevel, onBack }: LevelSelectorProps) {
  const [savedLevels, setSavedLevels] = useState<SavedLevel[]>([]);

  useEffect(() => {
    loadSavedLevels();
  }, []);

  const loadSavedLevels = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const levelKeys = keys.filter((key) => key.startsWith("level_"));
      const levels: SavedLevel[] = [];
      for (const key of levelKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const level = JSON.parse(data);
          levels.push(level);
        }
      }
      // Sort levels by name alphabetically
      levels.sort((a, b) => a.name.localeCompare(b.name));
      setSavedLevels(levels);
    } catch (error) {
      console.error("Failed to load levels:", error);
    }
  };

  const deleteLevel = async (id: string) => {
    try {
      await AsyncStorage.removeItem(`level_${id}`);
      setSavedLevels((prev) => prev.filter((level) => level.id !== id));
    } catch (error) {
      console.error("Failed to delete level:", error);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Level", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteLevel(id) },
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
