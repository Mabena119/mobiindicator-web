import { Stack } from "expo-router";
import { NavigationBar } from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, useAppTheme } from "../src/ThemeContext";
import { useSystemChrome } from "../src/useSystemChrome";

function AppNavigation() {
  const { colors, isDark } = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700", color: colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, title: "Welcome" }} />
        <Stack.Screen name="home" options={{ headerShown: false, title: "Mentor indicators" }} />
        <Stack.Screen name="charts" options={{ title: "Live charts" }} />
        <Stack.Screen name="chart/[feedKey]" options={{ title: "Chart", headerLargeTitle: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedRoot />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedRoot() {
  const { colors, isDark } = useAppTheme();
  useSystemChrome(colors.bg);
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <NavigationBar style={isDark ? "dark" : "light"} />
      <AppNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
