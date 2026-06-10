import { ActivityIndicator, Modal, Platform, Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "../ThemeContext";
import { radii, spacing } from "../theme";

type Props = {
  visible: boolean;
  url: string;
  onClose: () => void;
  onPaid: () => void;
};

export function PaymentWebSheet({ visible, url, onClose, onPaid }: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700" }}>Subscribe</Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: radii.sm,
              backgroundColor: pressed ? colors.surfaceAlt : "transparent",
            })}
          >
            <Text style={{ color: colors.muted, fontWeight: "600", fontSize: 15 }}>Close</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          {Platform.OS === "web" ? (
            // eslint-disable-next-line react/no-unknown-property
            <iframe
              src={url}
              title="Subscribe"
              style={{ border: "none", width: "100%", height: "100%", flex: 1, background: colors.bg }}
            />
          ) : (
            <WebView
              source={{ uri: url }}
              style={{ flex: 1, backgroundColor: colors.bg }}
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <ActivityIndicator color={colors.accent} />
                </View>
              )}
              setSupportMultipleWindows={false}
            />
          )}
        </View>

        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
            gap: spacing.sm,
          }}
        >
          <Pressable
            onPress={onPaid}
            style={({ pressed }) => ({
              backgroundColor: colors.accent,
              borderRadius: radii.sm,
              paddingVertical: 14,
              alignItems: "center",
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>I&apos;ve paid — check again</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
