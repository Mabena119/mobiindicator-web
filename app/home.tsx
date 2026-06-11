import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { connectCode, refreshCharts, ApiError } from "../src/api";
import { LOGO_ICON } from "../src/brand";
import { MentorBadge } from "../src/components/MentorBadge";
import { ThemeToggle } from "../src/components/ThemeToggle";
import { useAppTheme } from "../src/ThemeContext";
import { isLicenseKey, normalizeLicenseKey } from "../src/license";
import { removeLicenseIfInvalid } from "../src/licenseCleanup";
import {
  isAlreadyUsedError,
  isDeviceConflictError,
  isExpiredApiError,
  isLicenseExpired,
  isRevokedApiError,
} from "../src/licenseExpiry";
import { resolveMemberAuth } from "../src/memberAuth";
import {
  getSavedLicenses,
  purgeAutoAddedLicenses,
  removeLicense,
  updateLicense,
  upsertLicense,
} from "../src/storage";
import { useHomeStyles } from "../src/styles/useHomeStyles";
import type { SavedLicense } from "../src/types";

function formatExpiry(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpired(iso: string | null): boolean {
  return isLicenseExpired(iso);
}

async function handleLicenseApiError(code: string, ex: unknown): Promise<"removed" | "keep"> {
  return (await removeLicenseIfInvalid(code, ex)) ? "removed" : "keep";
}

function categoryLabel(cat: string): string {
  if (cat === "both") return "Swing + Scalper";
  if (cat === "scalper") return "Scalper";
  return "Swing";
}

export default function IndicatorsHomeScreen() {
  const { colors } = useAppTheme();
  const styles = useHomeStyles();
  const [licenses, setLicenses] = useState<SavedLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberReady, setMemberReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const load = useCallback(async () => {
    await purgeAutoAddedLicenses();
    const saved = await getSavedLicenses();
    setLicenses(saved);
    return saved;
  }, []);

  const syncLiveStatus = useCallback(async (saved: SavedLicense[]) => {
    await Promise.all(
      saved.map(async (lic) => {
        if (isLicenseExpired(lic.expires_at)) {
          await removeLicense(lic.code);
          return;
        }
        try {
          const session = await refreshCharts(lic.code);
          if (isLicenseExpired(session.expires_at)) {
            await removeLicense(lic.code);
            return;
          }
          await updateLicense(lic.code, session);
        } catch (ex) {
          await handleLicenseApiError(lic.code, ex);
        }
      }),
    );
    await load();
  }, [load]);

  const ensureMember = useCallback(async (): Promise<boolean> => {
    const auth = await resolveMemberAuth();
    if (auth.kind === "missing" || auth.kind === "logged_out") {
      router.replace("/");
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    resolveMemberAuth().then((auth) => {
      if (auth.kind === "missing" || auth.kind === "logged_out") {
        router.replace("/");
        return;
      }
      setMemberReady(true);
    });
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      void ensureMember().then((ok) => {
        if (ok && memberReady) void load().then((saved) => syncLiveStatus(saved));
      });
    });
    return () => sub.remove();
  }, [ensureMember, load, syncLiveStatus, memberReady]);

  useEffect(() => {
    if (!memberReady) return;
    load()
      .then((saved) => syncLiveStatus(saved))
      .finally(() => setLoading(false));
  }, [load, syncLiveStatus, memberReady]);

  useEffect(() => {
    if (loading || licenses.length === 0) return;
    const id = setInterval(() => {
      void syncLiveStatus(licenses);
    }, 10000);
    return () => clearInterval(id);
  }, [loading, licenses, syncLiveStatus]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (!(await ensureMember())) return;
      const saved = await load();
      await syncLiveStatus(saved);
    } finally {
      setRefreshing(false);
    }
  }, [load, syncLiveStatus, ensureMember]);

  function confirmRemove(lic: SavedLicense) {
    const title = "Remove license key?";
    const message = `Disconnect "${lic.indicator_name || lic.name}" from this device?`;
    const onConfirm = async () => {
      await removeLicense(lic.code);
      setLicenses((prev) => prev.filter((l) => l.code !== lic.code));
    };

    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n\n${message}`)) void onConfirm();
      return;
    }
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => void onConfirm() },
    ]);
  }

  async function onAddKey() {
    const trimmed = normalizeLicenseKey(newCode);
    if (!trimmed) {
      setAddError("Enter your license key");
      return;
    }
    if (!isLicenseKey(trimmed)) {
      setAddError("Only license keys starting with MK- are accepted");
      return;
    }
    await purgeAutoAddedLicenses();
    const current = await getSavedLicenses();
    setLicenses(current);
    if (current.some((l) => l.code === trimmed)) {
      setAddError("This key is already connected");
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      const session = await connectCode(trimmed);
      const feed = (session.feed_code ?? "").trim().toUpperCase();
      for (const lic of current) {
        if (lic.code !== trimmed && feed && lic.feed_code === feed) {
          await removeLicense(lic.code);
        }
      }
      await upsertLicense(trimmed, session);
      setNewCode("");
      setAddOpen(false);
      await load();
    } catch (ex) {
      if (ex instanceof ApiError && isAlreadyUsedError(ex.message, ex.status)) {
        setAddError("This key has already been used and cannot be added again");
      } else if (ex instanceof ApiError && isDeviceConflictError(ex.message, ex.status)) {
        setAddError(
          /already has a license/i.test(ex.message)
            ? "This indicator is already licensed on this device"
            : "This key is already activated on another device",
        );
      } else if (ex instanceof ApiError && isExpiredApiError(ex.message, ex.status)) {
        setAddError("This license key has expired");
      } else if (ex instanceof ApiError && isRevokedApiError(ex.message, ex.status)) {
        setAddError("This license key has been revoked");
      } else {
        setAddError(ex instanceof Error ? ex.message : "Could not connect");
      }
    } finally {
      setAdding(false);
    }
  }

  function openCharts(lic: SavedLicense) {
    router.push({ pathname: "/charts", params: { code: lic.code } });
  }

  if (!memberReady || loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Image source={LOGO_ICON} style={styles.logo} accessibilityLabel="MobiIndicator" />
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Mentor indicators</Text>
            <Text style={styles.lead}>
              Add mentor license keys (MK-) to view live charts. Keys are entered manually — nothing is added automatically.
            </Text>
          </View>
          <ThemeToggle compact />
        </View>
      </View>

      <FlatList
        data={licenses}
        keyExtractor={(item) => item.code}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          licenses.length === 0 ? styles.emptyList : styles.listContent
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        renderItem={({ item }) => {
          const expired = isExpired(item.expires_at);
          const connected = item.mt5_connected ?? item.chart_count > 0;
          return (
            <View style={styles.card}>
              <Pressable
                onPress={() => openCharts(item)}
                style={({ pressed }) => [styles.cardMain, pressed && styles.cardPressed]}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{item.indicator_name || item.name}</Text>
                  {expired ? (
                    <View style={styles.badgeExpired}>
                      <Text style={styles.badgeExpiredText}>Expired</Text>
                    </View>
                  ) : connected ? (
                    <View style={styles.badgeLive}>
                      <View style={styles.liveDot} />
                      <Text style={styles.badgeLiveText}>Connected</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeOffline}>
                      <Text style={styles.badgeOfflineText}>Waiting for MT5</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardMeta}>
                  {item.plan_label} plan · Expires {formatExpiry(item.expires_at)}
                </Text>
                <Text style={styles.cardMeta}>
                  {categoryLabel(item.category)}
                  {connected
                    ? ` · ${item.chart_count} live chart${item.chart_count === 1 ? "" : "s"}`
                    : " · MT5 connector offline"}
                </Text>
                <MentorBadge
                  layout="card"
                  size={72}
                  displayName={item.mentor_display_name}
                  imagePath={item.mentor_image}
                  phone={item.mentor_phone}
                  cacheKey={item.mentor_image || item.code}
                />
              </Pressable>
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => openCharts(item)}
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.actionPressed]}
                >
                  <Text style={styles.actionPrimary}>Open charts</Text>
                </Pressable>
                <Pressable
                  onPress={() => confirmRemove(item)}
                  style={({ pressed }) => [styles.actionBtn, styles.actionDanger, pressed && styles.actionPressed]}
                >
                  <Text style={styles.actionDangerText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            setAddError(null);
            setNewCode("");
            setAddOpen(true);
          }}
          style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
        >
          <Text style={styles.addBtnText}>+ Add license key</Text>
        </Pressable>
      </View>

      <Modal visible={addOpen} animationType="slide" transparent onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add license key</Text>
            <Text style={styles.modalHint}>
              Enter an MK- key from your mentor. You can connect multiple indicators.
            </Text>
            <TextInput
              value={newCode}
              onChangeText={setNewCode}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="MK-XXXXXXXX"
              placeholderTextColor={colors.muted}
              style={styles.input}
              editable={!adding}
              returnKeyType="done"
              onSubmitEditing={onAddKey}
            />
            {addError ? <Text style={styles.error}>{addError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setAddOpen(false)}
                disabled={adding}
                style={({ pressed }) => [styles.modalBtn, pressed && styles.actionPressed]}
              >
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={onAddKey}
                disabled={adding}
                style={({ pressed }) => [styles.modalBtn, styles.modalConnect, pressed && styles.actionPressed]}
              >
                {adding ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConnectText}>Connect</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </View>
  );
}

