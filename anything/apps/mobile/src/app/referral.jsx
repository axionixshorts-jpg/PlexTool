import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import {
  ArrowLeft,
  Copy,
  Share2,
  Gift,
  Users,
  DollarSign,
  Trophy,
} from "lucide-react-native";
import useAuthStore from "../store/authStore";
import { colors, gradients } from "../theme/colors";
import PrimaryButton from "../components/ui/PrimaryButton";

const milestones = [
  { target: 5, reward: "$25", label: "5 Referrals", achieved: false },
  { target: 10, reward: "$75", label: "10 Referrals", achieved: false },
  { target: 25, reward: "$200", label: "25 Referrals", achieved: false },
  { target: 50, reward: "$500", label: "50 Referrals", achieved: false },
];

export default function ReferralScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();

  const referralCode = user?.referral_code || "CREATOR123";
  const referralLink = `https://creatorhub.app/join?ref=${referralCode}`;

  const copyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied!", "Referral code copied to clipboard");
  };

  const shareLink = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Clipboard.setStringAsync(referralLink);
    Alert.alert("Link Copied!", "Share it with friends to start earning");
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
              Referral Program
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 20 }}>
          {/* Hero Card */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <LinearGradient
              colors={["rgba(57,255,136,0.08)", "rgba(0,209,255,0.06)"]}
              style={{
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: "rgba(57,255,136,0.1)",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.primaryDim,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Gift size={28} color={colors.primary} />
              </View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 22,
                  fontFamily: "Inter_700Bold",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Invite Friends & Earn
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Earn $5 for every friend who signs up and completes their first
                campaign
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Referral Code */}
          <Animated.View entering={FadeInDown.delay(150)}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontFamily: "Inter_500Medium",
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              Your Referral Code
            </Text>
            <TouchableOpacity
              onPress={copyCode}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                padding: 16,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 20,
                  fontFamily: "Inter_700Bold",
                  letterSpacing: 2,
                }}
              >
                {referralCode}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: colors.primaryDim,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                }}
              >
                <Copy size={14} color={colors.primary} />
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 12,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  Copy
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Share Button */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <PrimaryButton
              title="Share Referral Link"
              onPress={shareLink}
              icon={<Share2 size={16} color="#000" />}
            />
          </Animated.View>

          {/* Stats */}
          <Animated.View
            entering={FadeInDown.delay(250)}
            style={{ flexDirection: "row", gap: 10 }}
          >
            {[
              {
                label: "Referrals",
                value: "0",
                icon: Users,
                color: colors.secondary,
              },
              {
                label: "Earnings",
                value: "$0",
                icon: DollarSign,
                color: colors.primary,
              },
              {
                label: "Rank",
                value: "#—",
                icon: Trophy,
                color: colors.warning,
              },
            ].map((stat, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  padding: 14,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <stat.icon size={20} color={stat.color} />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 18,
                    fontFamily: "Inter_700Bold",
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 11,
                    fontFamily: "Inter_500Medium",
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Milestones */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                marginBottom: 12,
              }}
            >
              Milestones
            </Text>
            <View style={{ gap: 10 }}>
              {milestones.map((m, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                    padding: 14,
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: m.achieved
                        ? colors.successDim
                        : colors.surfaceLight,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Trophy
                      size={16}
                      color={m.achieved ? colors.success : colors.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      {m.label}
                    </Text>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                      }}
                    >
                      Earn {m.reward} bonus
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: m.achieved ? colors.success : colors.textMuted,
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                    }}
                  >
                    0/{m.target}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
