import { Image, Text, View } from "react-native";
import { styles } from "../styles";

export const PageHeader = () => {
  return (
    <View style={styles.pageHeaderWrapper}>
      <View style={styles.pageHeaderImageArea}>
        <Image
          source={require("../assets/icon.png")}
          style={styles.pageHeaderImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.pageHeaderOverlay}>
        <Text style={styles.pageHeaderTitle}>Minesweeper</Text>
        <Text style={styles.pageHeaderSubtitle}>Clear the board. Avoid the mines.</Text>
      </View>
    </View>
  );
};