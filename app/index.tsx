import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiError, checkMemberStatus } from "../src/api";
import { LOGO_ICON } from "../src/brand";
import { AppModal } from "../src/components/AppModal";
import { PaymentWebSheet } from "../src/components/PaymentWebSheet";
import { ThemeToggle } from "../src/components/ThemeToggle";
import { useAppTheme } from "../src/ThemeContext";
import { resolveMemberAuth } from "../src/memberAuth";
import { clearMemberSession, saveMemberSession } from "../src/memberStorage";
import { radii, spacing } from "../src/theme";
import type { MemberStartResponse } from "../src/types";

function isValidEmail(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return trimmed.includes("@") && trimmed.includes(".") && trimmed.length >= 5;
}

const PAYMENT_BASE = "https://mobiindicator.com/subscribe";

function paymentUrlFor(email: string, url?: string): string {
  if (url?.trim()) return url.trim();
  return `${PAYMENT_BASE}?email=${encodeURIComponent(email.trim().toLowerCase())}`;
}

type ModalKind = "device" | "welcome" | null;

export default function WelcomeScreen() {
  const { colors, shadow } = useAppTheme();
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(PAYMENT_BASE);

  const goHome = useCallback(() => {
    router.replace("/home");
  }, []);

  const activateMember = useCallback(async (result: MemberStartResponse) => {
    await saveMemberSession({
      email: result.email,
      subscription_token: result.subscription_token,
    });
    setPaymentOpen(false);
    setModal("welcome");
  }, []);

  const handleUnpaid = useCallback((result: MemberStartResponse, trimmed: string) => {
    setPaymentUrl(paymentUrlFor(trimmed, result.payment_url));
    setPaymentOpen(true);
  }, []);

  const verifyEmail = useCallback(
    async (rawEmail: string) => {
      const trimmed = rawEmail.trim().toLowerCase();
      if (!isValidEmail(trimmed)) return;
      setSubmitting(true);
      try {
        const result = await checkMemberStatus(trimmed);
        if (result.status === "not_found") {
          handleUnpaid(result, trimmed);
          return;
        }
        if (result.status === "active" && result.paid) {
          await activateMember(result);
          return;
        }
        handleUnpaid(result, trimmed);
      } catch (ex) {
        if (ex instanceof ApiError && ex.status === 409) {
          setPaymentOpen(false);
          setModal("device");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [activateMember, handleUnpaid],
  );

  useEffect(() => {
    resolveMemberAuth()
      .then(async (auth) => {
        if (auth.kind === "missing" || auth.kind === "logged_out") {
          setEmail("");
          return;
        }
        setEmail(auth.session.email);
        const result = auth.status;
        if (result.status === "active" && result.paid) {
          goHome();
          return;
        }
        handleUnpaid(result, auth.session.email);
      })
      .catch((ex) => {
        if (ex instanceof ApiError && ex.status === 409) {
          setModal("device");
        }
      })
      .finally(() => setChecking(false));
  }, [goHome, handleUnpaid]);

  async function onContinue() {
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) return;
    await verifyEmail(trimmed);
  }

  async function onSwitchAccount() {
    await clearMemberSession();
    setEmail("");
    setModal(null);
    setPaymentOpen(false);
    setPaymentUrl(PAYMENT_BASE);
  }

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "left", "right"]}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: spacing.md }}>
        <ThemeToggle compact />
      </View>

      <View style={{ flex: 1, paddingHorizontal: spacing.lg, justifyContent: "center", gap: spacing.lg }}>
        <View style={{ alignItems: "center", gap: spacing.md }}>
          <Image
            source={LOGO_ICON}
            style={{
              width: 72,
              height: 72,
              borderRadius: radii.sm,
              backgroundColor: "#fff",
              ...shadow.soft,
            }}
          />
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.4 }}>
            Welcome to MobiIndicator
          </Text>
          <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: "center" }}>
            Enter the email to continue
          </Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!submitting}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
              borderRadius: radii.sm,
              paddingHorizontal: spacing.md,
              paddingVertical: Platform.OS === "ios" ? 14 : 12,
              fontSize: 16,
            }}
          />
        </View>

        <Pressable
          onPress={onContinue}
          disabled={submitting || !isValidEmail(email)}
          style={({ pressed }) => ({
            backgroundColor: colors.accent,
            borderRadius: radii.sm,
            paddingVertical: 14,
            alignItems: "center",
            opacity: pressed || submitting || !isValidEmail(email) ? 0.6 : 1,
          })}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Continue</Text>
          )}
        </Pressable>

        {email ? (
          <Pressable onPress={onSwitchAccount}>
            <Text style={{ color: colors.muted, textAlign: "center", fontSize: 13 }}>Use a different email</Text>
          </Pressable>
        ) : null}
      </View>

      <PaymentWebSheet
        visible={paymentOpen}
        url={paymentUrl}
        onClose={() => setPaymentOpen(false)}
        onPaid={() => {
          setPaymentOpen(false);
          void verifyEmail(email);
        }}
      />

      <AppModal
        visible={modal === "device"}
        icon="warning"
        title="Email already in use"
        message="This email is registered on another device. Use the device you subscribed with, or try a different email."
        onRequestClose={() => setModal(null)}
        actions={[
          {
            label: "Try another email",
            variant: "primary",
            onPress: () => {
              void onSwitchAccount();
            },
          },
        ]}
      />

      <AppModal
        visible={modal === "welcome"}
        icon="success"
        title="You're all set"
        message="Your subscription is active on this device. Add your mentor license key (MK-) to start viewing live charts."
        actions={[
          {
            label: "Add license key",
            variant: "primary",
            onPress: () => {
              setModal(null);
              goHome();
            },
          },
        ]}
      />
    </SafeAreaView>
    </View>
  );
}
