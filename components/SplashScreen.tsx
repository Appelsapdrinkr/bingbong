import { ActivityIndicator, Animated, Text, View } from "react-native";
import { styles } from "../styles";

type SplashScreenProps = Readonly<{
  opacity: Animated.Value;
}>;

export function SplashScreen({ opacity }: SplashScreenProps) {
  return (
    <Animated.View style={[styles.splashContainer, { opacity }]}>
      <View style={styles.splashCard}>
        <Text style={styles.splashTitle}>Minesweeper</Text>
        <Text style={styles.splashSubtitle}>Booting up your board...</Text>
        <ActivityIndicator size="large" color="#B8D6FF" />
      </View>
    </Animated.View>
  );
}