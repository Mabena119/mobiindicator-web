import { LOGO_ICON } from "../brand";
import { isDefaultMentorLogo, mentorPhotoUrl } from "../media";
import { useAppTheme } from "../ThemeContext";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  displayName?: string;
  imagePath?: string;
  phone?: string;
  size?: number;
  cacheKey?: string;
  layout?: "inline" | "card" | "banner";
};

export function MentorBadge({
  displayName,
  imagePath,
  phone,
  size = 36,
  cacheKey,
  layout = "inline",
}: Props) {
  const { colors, shadow } = useAppTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const name = (displayName ?? "").trim();
  const phoneText = (phone ?? "").trim();
  const path = (imagePath ?? "").trim();
  const uri =
    !imageFailed && !isDefaultMentorLogo(path)
      ? mentorPhotoUrl(path, cacheKey ?? path)
      : "";
  const avatarSize = layout === "inline" ? size : Math.max(size, 72);
  const radius = avatarSize / 4;

  useEffect(() => {
    setImageFailed(false);
  }, [path, cacheKey]);

  if (!name && !uri && !phoneText) return null;

  const avatar = uri ? (
    <Image
      key={uri}
      source={{ uri }}
      style={[
        styles.avatar,
        { width: avatarSize, height: avatarSize, borderRadius: radius, backgroundColor: colors.surfaceAlt },
      ]}
      resizeMode="cover"
      onError={() => setImageFailed(true)}
      onLoad={(event) => {
        const source = event.nativeEvent.source;
        if (!source) return;
        const { width, height } = source;
        if (!width || !height || width < 32 || height < 32) {
          setImageFailed(true);
        }
      }}
    />
  ) : (
    <Image
      source={LOGO_ICON}
      style={[
        styles.avatar,
        styles.defaultLogo,
        { width: avatarSize, height: avatarSize, borderRadius: radius },
        shadow.soft,
      ]}
      resizeMode="contain"
    />
  );

  if (layout === "card" || layout === "banner") {
    return (
      <View style={[styles.cardRow, layout === "banner" && styles.bannerRow]}>
        <View style={styles.cardText}>
          {name ? (
            <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={2}>
              {name}
            </Text>
          ) : null}
          {phoneText ? (
            <Text style={[styles.cardPhone, { color: colors.muted }]} numberOfLines={1}>
              {phoneText}
            </Text>
          ) : null}
        </View>
        {avatar}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {avatar}
      <View style={styles.inlineText}>
        {name ? (
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {name}
          </Text>
        ) : null}
        {phoneText ? (
          <Text style={[styles.phoneInline, { color: colors.muted }]} numberOfLines={1}>
            {phoneText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  inlineText: { flex: 1, gap: 2 },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
  },
  bannerRow: {
    marginTop: 0,
    flex: 0,
  },
  cardText: { flex: 1, gap: 4, minWidth: 0 },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardPhone: {
    fontSize: 14,
    fontWeight: "500",
  },
  avatar: {},
  defaultLogo: {
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  phoneInline: {
    fontSize: 13,
  },
});
