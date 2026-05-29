import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";
import {
  Settings,
  Gift,
  HelpCircle,
  LogOut,
  ChevronRight,
  Instagram,
  Youtube,
  Twitter,
  LinkIcon,
  Edit3,
  Shield,
  Bell,
} from "lucide-react-native";
import useAuthStore from "../../store/authStore";
import { api } from "../../utils/api";
import { colors } from "../../theme/colors";

function ProfileStat({ label, value }) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 2 }}>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 20,
          fontFamily: "Inter_700Bold",
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontFamily: "Inter_500Medium",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function MenuSection({ title, items }) {
  return (
    <View style={{ marginBottom: 20 }}>
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
        {items.map((item, i) => (
          <TouchableOpacity
            key={i}
            onPress={item.onPress}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 14,
              paddingHorizontal: 16,
              gap: 12,
              borderBottomWidth: i < items.length - 1 ? 1 : 0,
              borderBottomColor: colors.divider,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: `${item.color}20`,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <item.icon size={18} color={item.color} />
            </View>
            <Text
              style={{
                flex: 1,
                color: colors.textPrimary,
                fontSize: 15,
                fontFamily: "Inter_500Medium",
              }}
            >
              {item.label}
            </Text>
            {item.badge && (
              <View
                style={{
                  backgroundColor: colors.primaryDim,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 11,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  {item.badge}
                </Text>
              </View>
            )}
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: api.getProfile,
  });

  const stats = profileData?.stats;
  const socials = profileData?.socials || [];

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  const platformIcons = {
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 24,
                fontFamily: "Inter_700Bold",
              }}
            >
              Profile
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/settings")}
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
              <Settings size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={{ paddingHorizontal: 20, marginBottom: 20 }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              padding: 20,
              alignItems: "center",
            }}
          >
            <View style={{ position: "relative", marginBottom: 14 }}>
              <Image
                source={{
                  uri:
                    user?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=39FF88&color=000&size=200`,
                }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
                contentFit="cover"
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: colors.surface,
                }}
              >
                <Edit3 size={12} color="#000" />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 20,
                fontFamily: "Inter_700Bold",
                marginBottom: 4,
              }}
            >
              {user?.name || "Creator"}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontFamily: "Inter_400Regular",
                marginBottom: 4,
              }}
            >
              {user?.email}
            </Text>
            {user?.bio && (
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                {user.bio}
              </Text>
            )}

            <View
              style={{
                backgroundColor: colors.primaryDim,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  textTransform: "capitalize",
                }}
              >
                {user?.role || "Creator"}
              </Text>
            </View>

            {/* Stats */}
            <View
              style={{
                flexDirection: "row",
                borderTopWidth: 1,
                borderTopColor: colors.divider,
                paddingTop: 16,
                width: "100%",
              }}
            >
              <ProfileStat
                label="Campaigns"
                value={stats?.campaigns_joined || 0}
              />
              <View style={{ width: 1, backgroundColor: colors.divider }} />
              <ProfileStat
                label="Submissions"
                value={stats?.total_submissions || 0}
              />
              <View style={{ width: 1, backgroundColor: colors.divider }} />
              <ProfileStat
                label="Earned"
                value={`$${stats ? parseFloat(stats.total_earned).toFixed(0) : "0"}`}
              />
            </View>
          </View>
        </Animated.View>

        {/* Connected Socials */}
        {socials.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={{ paddingHorizontal: 20, marginBottom: 20 }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                fontFamily: "Inter_600SemiBold",
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              CONNECTED ACCOUNTS
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                padding: 14,
                gap: 10,
              }}
            >
              {socials.map((s, i) => {
                const SocialIcon =
                  platformIcons[s.platform.toLowerCase()] || LinkIcon;
                return (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <SocialIcon size={18} color={colors.textSecondary} />
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        flex: 1,
                      }}
                    >
                      @{s.username}
                    </Text>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                      }}
                    >
                      {s.followers?.toLocaleString()} followers
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Menu Sections */}
        <View style={{ paddingHorizontal: 20 }}>
          <Animated.View entering={FadeInDown.delay(300)}>
            <MenuSection
              title="GENERAL"
              items={[
                {
                  label: "Referral Program",
                  icon: Gift,
                  color: colors.primary,
                  onPress: () => router.push("/referral"),
                },
                {
                  label: "Notifications",
                  icon: Bell,
                  color: colors.secondary,
                  onPress: () => router.push("/notifications"),
                },
                {
                  label: "Help & Support",
                  icon: HelpCircle,
                  color: colors.warning,
                  onPress: () => router.push("/support"),
                },
              ]}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <MenuSection
              title="ACCOUNT"
              items={[
                {
                  label: "Settings",
                  icon: Settings,
                  color: colors.textSecondary,
                  onPress: () => router.push("/settings"),
                },
                {
                  label: "Privacy & Security",
                  icon: Shield,
                  color: "#7C3AED",
                  onPress: () => router.push("/settings"),
                },
                {
                  label: "Sign Out",
                  icon: LogOut,
                  color: colors.error,
                  onPress: handleLogout,
                },
              ]}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
