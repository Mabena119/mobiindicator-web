import { Image, Modal, Pressable, Text, View } from "react-native";

import { LOGO_ICON } from "../brand";
import { useAppTheme } from "../ThemeContext";
import { radii, spacing } from "../theme";

type Action = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
};

type Props = {
  visible: boolean;
  title: string;
  message: string;
  icon?: "logo" | "lock" | "warning" | "success";
  actions: Action[];
  onRequestClose?: () => void;
};

const ICONS = {
  logo: null,
  lock: "🔒",
  warning: "⚠️",
  success: "✅",
} as const;

export function AppModal({
  visible,
  title,
  message,
  icon = "logo",
  actions,
  onRequestClose,
}: Props) {
  const { colors, shadow } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "center",
          padding: spacing.lg,
        }}
        onPress={onRequestClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.lg,
            gap: spacing.md,
            ...shadow.card,
          }}
        >
          <View style={{ alignItems: "center", gap: spacing.sm }}>
            {icon === "logo" ? (
              <Image
                source={LOGO_ICON}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: radii.sm,
                  backgroundColor: "#fff",
                  ...shadow.soft,
                }}
              />
            ) : (
              <Text style={{ fontSize: 36 }}>{ICONS[icon]}</Text>
            )}
            <Text
              style={{
                color: colors.text,
                fontSize: 20,
                fontWeight: "800",
                textAlign: "center",
                letterSpacing: -0.3,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontSize: 15,
                lineHeight: 22,
                textAlign: "center",
              }}
            >
              {message}
            </Text>
          </View>

          <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
            {actions.map((action) => {
              const isPrimary = action.variant === "primary" || (!action.variant && actions[0] === action);
              const isGhost = action.variant === "ghost";
              return (
                <Pressable
                  key={action.label}
                  onPress={action.onPress}
                  style={({ pressed }) => ({
                    paddingVertical: 14,
                    borderRadius: radii.sm,
                    alignItems: "center",
                    backgroundColor: isPrimary
                      ? colors.accent
                      : isGhost
                        ? "transparent"
                        : colors.surface,
                    borderWidth: isPrimary || isGhost ? 0 : 1,
                    borderColor: colors.border,
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: isPrimary ? "#fff" : isGhost ? colors.muted : colors.text,
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
