import { Modal, Pressable, Text } from "react-native";
import { styles } from "../styles";

type TutorialModalProps = Readonly<{
  visible: boolean;
  onClose: () => void;
}>;

export function TutorialModal({ visible, onClose }: TutorialModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={styles.tutorialOverlay} onPress={onClose}>
        <Pressable style={styles.tutorialCard} onPress={() => {}}>
          <Text style={styles.tutorialTitle}>Quick start</Text>
          <Text style={styles.tutorialText}>
            Reveal all safe cells without hitting a mine.
          </Text>
          <Text style={styles.tutorialText}>
            Numbers show how many mines touch that cell.
          </Text>
          <Text style={styles.tutorialText}>
            Tap a cell to reveal it. Long press to place or remove a flag.
          </Text>
          <Text style={styles.tutorialText}>
            Use Focus mode when you want only the board, mine count, and exit button.
          </Text>
          <Pressable style={styles.tutorialButton} onPress={onClose}>
            <Text style={styles.tutorialButtonText}>Start playing</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}