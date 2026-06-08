import { ActivityIndicator, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Cell } from "../minesweeper.types";
import { styles } from "../styles";
import { LevelSelector } from "./LevelSelector";
import { LoginScreen } from "./LoginScreen";
import { RegisterScreen } from "./RegisterScreen";
import { GameScreen, type GameScreenProps } from "./GameScreen";
import type { AppMode } from "../store/gameSlice";

export type RootStackParamList = {
  Loading: undefined;
  Login: undefined;
  Register: undefined;
  Game: undefined;
  LevelSelector: undefined;
};

type AppNavigatorProps = Readonly<{
  isAuthReady: boolean;
  isAuthenticated: boolean;
  mode: AppMode;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  gameScreenProps: GameScreenProps;
  onLoadLevels: () => void;
  onSelectLevel: (board: Cell[][] | null) => void;
  onBackToGame: () => void;
}>;

export type { AppNavigatorProps };

const Stack = createNativeStackNavigator<RootStackParamList>();

const LoadingScreen = () => (
  <View style={styles.loginContainer}>
    <ActivityIndicator size="large" color="#B8D6FF" />
    <Text style={styles.loginSubtitle}>Loading your session...</Text>
  </View>
);

export function AppNavigator({
  isAuthReady,
  isAuthenticated,
  mode,
  onLogin,
  onRegister,
  gameScreenProps,
  onLoadLevels,
  onSelectLevel,
  onBackToGame,
}: AppNavigatorProps) {
  if (!isAuthReady) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
          <Stack.Screen name="Loading" component={LoadingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
          <Stack.Screen name="Login">
            {({ navigation }) => (
              <LoginScreen
                onLogin={onLogin}
                onSwitchToRegister={() => navigation.navigate("Register")}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {({ navigation }) => (
              <RegisterScreen
                onRegister={onRegister}
                onSwitchToLogin={() => navigation.navigate("Login")}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}>
        {mode === "selector" ? (
          <Stack.Screen name="LevelSelector">
            {() => (
              <LevelSelector onSelectLevel={onSelectLevel} onBack={onBackToGame} />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Game">
            {() => <GameScreen {...gameScreenProps} onLoadLevels={onLoadLevels} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}