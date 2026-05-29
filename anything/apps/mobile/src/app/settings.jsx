import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import {
  ArrowLeft,
  Bell,
  Shield,
  Moon,
  Link2,
  Trash2,
  ChevronRight,
  Globe,
  Lock,
  Eye,
  Smartphone,
  ShieldAlert,
  LayoutDashboard,
} from "lucide-react-native";
import useAuthStore from "../store/authStore";
import { colors } from "../theme/colors";

function SettingsGroup({ title, children, delay = 0 }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay)}
      style={{ marginBottom: 24 }}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 12,
          fontFamily: "Inter_600SemiBold",
          letterSpacing: 1,
          marginBottom: 10,
          paddingHorizontal: 4,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}

function SettingsRow({ icon: Icon, color, label, trailing, onPress, isLast }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.divider,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: `${color}20`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon size={17} color={color} />
      </View>
      <Text
        style={{
          flex: 1,
          color: colors.textPrimary,
          fontSize: 15,
          fontFamily: "Inter_500Medium",
        }}
      >
        {label}
      </Text>
      {trailing ||
        (onPress && <ChevronRight size={18} color={colors.textMuted} />)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [versionTaps, setVersionTaps] = useState(0);
  const [showAdminButton, setShowAdminButton] = useState(false);

  const isAdmin = user?.email === "rexoagency.in@gmail.com";

  const handleVersionTap = () => {
    const next = versionTaps + 1;
    setVersionTaps(next);
    if (next >= 7) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAdminButton(true);
      setVersionTaps(0);
    } else if (next >= 4) {
      Haptics.selectionAsync();
    }
  };

  const handleAdminAccess = () => {
    const baseUrl = process.env.EXPO_PUBLIC_BASE_URL || "";
    const adminUrl = `${baseUrl}/admin`;
    Linking.openURL(adminUrl);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. All your data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/auth");
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ArrowLeft size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 20,
                fontFamily: "Inter_700Bold",
              }}
            >
              Settings
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <SettingsGroup title="PREFERENCES" delay={100}>
            <SettingsRow
              icon={Bell}
              color={colors.secondary}
              label="Push Notifications"
              trailing={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{
                    false: colors.surfaceLight,
                    true: colors.primaryDim,
                  }}
                  thumbColor={notifications ? colors.primary : colors.textMuted}
                />
              }
            />
            <SettingsRow
              icon={Moon}
              color="#7C3AED"
              label="Dark Mode"
              trailing={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{
                    false: colors.surfaceLight,
                    true: colors.primaryDim,
                  }}
                  thumbColor={darkMode ? colors.primary : colors.textMuted}
                />
              }
            />
            <SettingsRow
              icon={Globe}
              color={colors.warning}
              label="Language"
              isLast
              trailing={
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 13,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  English
                </Text>
              }
            />
          </SettingsGroup>

          <SettingsGroup title="SECURITY" delay={200}>
            <SettingsRow
              icon={Lock}
              color={colors.primary}
              label="Change Password"
              onPress={() => {}}
            />
            <SettingsRow
              icon={Smartphone}
              color={colors.secondary}
              label="Biometric Login"
              trailing={
                <Switch
                  value={biometric}
                  onValueChange={setBiometric}
                  trackColor={{
                    false: colors.surfaceLight,
                    true: colors.primaryDim,
                  }}
                  thumbColor={biometric ? colors.primary : colors.textMuted}
                />
              }
            />
            <SettingsRow
              icon={Eye}
              color={colors.warning}
              label="Privacy Settings"
              onPress={() => {}}
              isLast
            />
          </SettingsGroup>

          <SettingsGroup title="CONNECTED ACCOUNTS" delay={300}>
            <SettingsRow
              icon={Link2}
              color={colors.primary}
              label="Manage Social Accounts"
              onPress={() => {}}
              isLast
            />
          </SettingsGroup>

          {/* ── ADMIN PANEL — shown only for rexoagency.in@gmail.com ── */}
          {isAdmin && (
            <SettingsGroup title="⚡ SUPER ADMIN" delay={350}>
              <SettingsRow
                icon={LayoutDashboard}
                color="#39FF88"
                label="Admin Panel"
                onPress={() => router.push("/admin-panel")}
                isLast
                trailing={
                  <View
                    style={{
                      backgroundColor: "rgba(57,255,136,0.15)",
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 999,
                      marginRight: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#39FF88",
                        fontSize: 10,
                        fontFamily: "Inter_600SemiBold",
                        letterSpacing: 0.5,
                      }}
                    >
                      ADMIN
                    </Text>
                  </View>
                }
              />
            </SettingsGroup>
          )}

          {/* DANGER ZONE */}
          <SettingsGroup title="DANGER ZONE" delay={400}>
            <SettingsRow
              icon={Trash2}
              color={colors.error}
              label="Delete Account"
              onPress={handleDeleteAccount}
              isLast
            />
          </SettingsGroup>

          {/* Hidden easter egg admin button */}
          {showAdminButton && !isAdmin && (
            <Animated.View
              entering={FadeInDown.springify()}
              style={{ marginBottom: 16 }}
            >
              <TouchableOpacity
                onPress={handleAdminAccess}
                activeOpacity={0.85}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "rgba(57,255,136,0.08)",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(57,255,136,0.25)",
                  padding: 16,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: "rgba(57,255,136,0.15)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ShieldAlert size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 15,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Admin Panel
                  </Text>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                    }}
                  >
                    Super Admin access only
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.primary} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Version tap easter egg */}
          <TouchableOpacity
            onPress={handleVersionTap}
            activeOpacity={1}
            style={{ alignItems: "center", paddingVertical: 16 }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                fontFamily: "Inter_400Regular",
              }}
            >
              CreatorHub v1.0.0
            </Text>
            {versionTaps >= 4 && versionTaps < 7 && (
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 11,
                  fontFamily: "Inter_500Medium",
                  marginTop: 4,
                }}
              >
                {7 - versionTaps} more taps...
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
