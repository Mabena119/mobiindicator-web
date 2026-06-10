import { Pressable, StyleSheet, Text } from "react-native";

import { useAppTheme } from "../ThemeContext";

type Props = {
  compact?: boolean;
};

export function ThemeToggle({ compact }: Props) {
  const { toggleTheme, isDark, colors, shadow } = useAppTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={({ pressed }) => [
        styles.btn,
        compact && styles.compact,
        { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
        shadow.soft,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]}>
        {isDark ? "☀ Light" : "🌙 Dark"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  compact: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
