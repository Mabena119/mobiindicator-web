import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";

import { ThemeProvider, useAppTheme } from "../src/ThemeContext";

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
      <ThemeProvider>
        <ThemedRoot />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function ThemedRoot() {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AppNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
