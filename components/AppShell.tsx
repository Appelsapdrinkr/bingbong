import { Animated, View } from "react-native";
import type { AppController } from "../hooks/useAppController";
import { styles } from "../styles";
import { AppNavigator } from "./AppNavigator";
import { SplashScreen } from "./SplashScreen";
import { TutorialModal } from "./TutorialModal";

type AppShellProps = Readonly<{
  controller: AppController;
}>;

export function AppShell({ controller }: AppShellProps) {
  return (
    <View style={styles.appRoot}>
      <Animated.View style={[styles.appFadeLayer, { opacity: controller.appOpacity }]}>
        <AppNavigator
          isAuthReady={controller.isAuthReady}
          isAuthenticated={controller.isAuthenticated}
          mode={controller.mode}
          onLogin={controller.onLogin}
          onRegister={controller.onRegister}
          gameScreenProps={controller.gameScreenProps}
          onLoadLevels={controller.onLoadLevels}
          onSelectLevel={controller.onSelectLevel}
          onBackToGame={controller.onBackToGame}
        />
      </Animated.View>
      <TutorialModal
        visible={controller.showTutorialModal}
        onClose={controller.closeTutorialModal}
      />
      {controller.showSplash ? <SplashScreen opacity={controller.splashOpacity} /> : null}
    </View>
  );
}