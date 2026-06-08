import { ActivityIndicator, Image, ImageBackground, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Cell } from "../minesweeper.types";
import { styles } from "../styles";
import { LevelSelector } from "../screens/LevelSelector";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { GameScreen, type GameScreenProps } from "../screens/GameScreen";
import type { AppMode } from "../store/gameSlice";

export type RootStackParamList = {
  Loading: undefined;
  Login: undefined;
  Register: undefined;
  AppTabs: undefined;
};

type AppTabParamList = {
  GameTab: undefined;
  LevelsTab: undefined;
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
const Tab = createBottomTabNavigator<AppTabParamList>();

const HeaderBackground = () => (
  <ImageBackground
    source={require("../../assets/splash-icon.png")}
    resizeMode="cover"
    style={styles.navHeaderBackground}>
    <View style={styles.navHeaderBackgroundDim} />
  </ImageBackground>
);

const HeaderTitle = ({ title }: { title: string }) => (
  <View style={styles.navHeaderTitleWrap}>
    <Image source={require("../../assets/icon.png")} style={styles.navHeaderIcon} />
    <Text style={styles.navHeaderTitle}>{title}</Text>
  </View>
);

const SignInHeaderTitle = () => <HeaderTitle title="Sign In" />;
const RegisterHeaderTitle = () => <HeaderTitle title="Register" />;
const GameHeaderTitle = () => <HeaderTitle title="Minesweeper" />;
const LevelsHeaderTitle = () => <HeaderTitle title="Saved Levels" />;
const GameTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>🎮</Text>
);
const LevelsTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>📚</Text>
);

type AuthenticatedTabsProps = Pick<
  AppNavigatorProps,
  "gameScreenProps" | "onLoadLevels" | "onSelectLevel" | "onBackToGame"
>;

function AuthenticatedTabs({
  gameScreenProps,
  onLoadLevels,
  onSelectLevel,
  onBackToGame,
}: AuthenticatedTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        animation: "fade",
        headerTintColor: "#F8F8F8",
        headerBackground: HeaderBackground,
        headerTitleAlign: "center",
        tabBarActiveTintColor: "#3C86F0",
        tabBarInactiveTintColor: "#8BA3C7",
        tabBarStyle: { backgroundColor: "#0A1630" },
      }}>
      <Tab.Screen
        name="GameTab"
        options={{
          headerTitle: GameHeaderTitle,
          tabBarLabel: "Game",
          tabBarIcon: GameTabIcon,
        }}>
        {({ navigation }) => (
          <GameScreen
            {...gameScreenProps}
            onLoadLevels={() => {
              onLoadLevels();
              navigation.navigate("LevelsTab");
            }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="LevelsTab"
        options={{
          headerTitle: LevelsHeaderTitle,
          tabBarLabel: "Levels",
          tabBarIcon: LevelsTabIcon,
        }}>
        {({ navigation }) => (
          <LevelSelector
            onSelectLevel={(board) => {
              onSelectLevel(board);
              navigation.navigate("GameTab");
            }}
            onBack={() => {
              onBackToGame();
              navigation.navigate("GameTab");
            }}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

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
        <Stack.Navigator
          screenOptions={{
            animation: "fade",
            headerTintColor: "#F8F8F8",
            headerBackground: HeaderBackground,
            headerTitleAlign: "center",
          }}>
          <Stack.Screen
            name="Login"
            options={{
              headerLeft: () => null,
              headerTitle: SignInHeaderTitle,
            }}>
            {({ navigation }) => (
              <LoginScreen
                onLogin={onLogin}
                onSwitchToRegister={() => navigation.navigate("Register")}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Register"
            options={{
              presentation: "modal",
              headerTitle: RegisterHeaderTitle,
            }}>
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
          animation: "fade",
        }}>
        <Stack.Screen
          name="AppTabs"
          options={{ headerShown: false }}>
          {() => (
            <AuthenticatedTabs
              gameScreenProps={gameScreenProps}
              onLoadLevels={onLoadLevels}
              onSelectLevel={onSelectLevel}
              onBackToGame={onBackToGame}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}