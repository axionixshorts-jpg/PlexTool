import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Clock,
  Users,
  DollarSign,
  Share2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Instagram,
  Youtube,
  PlaySquare,
  CheckCircle,
} from "lucide-react-native";
import { api } from "../utils/api";
import { colors, gradients } from "../theme/colors";
import PrimaryButton from "../components/ui/PrimaryButton";
import SecondaryButton from "../components/ui/SecondaryButton";
import StatusBadge from "../components/ui/StatusBadge";
import SkeletonLoader from "../components/ui/SkeletonLoader";

const platformIcons = {
  Instagram: Instagram,
  YouTube: Youtube,
  TikTok: PlaySquare,
  Twitch: PlaySquare,
};

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 15,
            fontFamily: "Inter_600SemiBold",
          }}
        >
          {title}
        </Text>
        {open ? (
          <ChevronUp size={18} color={colors.textMuted} />
        ) : (
          <ChevronDown size={18} color={colors.textMuted} />
        )}
      </TouchableOpacity>
      {open && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            paddingTop: 12,
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}

export default function CampaignDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api.getCampaign(id),
    enabled: !!id,
  });

  const joinMutation = useMutation({
    mutationFn: () => api.joinCampaign(id),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      Alert.alert(
        "Joined! 🎉",
        "You successfully joined this campaign. Start creating content!",
        [
          {
            text: "Submit Content",
            onPress: () => router.push(`/submit-content?campaignId=${id}`),
          },
          { text: "OK" },
        ],
      );
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const campaign = data?.campaign;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
        }}
      >
        <StatusBar style="light" />
        <SkeletonLoader
          height={200}
          borderRadius={24}
          style={{ marginBottom: 16 }}
        />
        <SkeletonLoader height={24} width="70%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={16} width="40%" style={{ marginBottom: 20 }} />
        <SkeletonLoader height={100} borderRadius={16} />
      </View>
    );
  }

  if (!campaign) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 16,
            fontFamily: "Inter_500Medium",
          }}
        >
          Campaign not found
        </Text>
      </View>
    );
  }

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24),
    ),
  );
  const PlatformIcon = platformIcons[campaign.platform] || Instagram;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: campaign.hero_image }}
            style={{ width: "100%", height: 240 }}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={["transparent", colors.background]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: insets.top + 8,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          {/* Actions */}
          <View
            style={{
              position: "absolute",
              top: insets.top + 8,
              right: 16,
              flexDirection: "row",
              gap: 8,
            }}
          >
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Bookmark size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Share2 size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: -20 }}>
          {/* Brand & Title */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <Image
              source={{ uri: campaign.brand_logo }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors.cardBorder,
              }}
              contentFit="cover"
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 22,
                  fontFamily: "Inter_700Bold",
                  letterSpacing: -0.3,
                }}
              >
                {campaign.title}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                }}
              >
                by {campaign.brand_name}
              </Text>
            </View>
          </Animated.View>

          {/* Stats Row */}
          <Animated.View
            entering={FadeInDown.delay(150)}
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
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
              <DollarSign size={14} color={colors.primary} />
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontFamily: "Inter_700Bold",
                }}
              >
                ${campaign.reward_amount}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.surfaceLight,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Clock size={14} color={colors.textSecondary} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {daysLeft} days left
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.surfaceLight,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Users size={14} color={colors.textSecondary} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {campaign.current_participants}/
                {campaign.max_participants || "∞"}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.surfaceLight,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <PlatformIcon size={14} color={colors.textSecondary} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {campaign.platform}
              </Text>
            </View>
          </Animated.View>

          {/* Description */}
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={{ marginBottom: 16 }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 15,
                fontFamily: "Inter_400Regular",
                lineHeight: 24,
              }}
            >
              {campaign.description}
            </Text>
          </Animated.View>

          {/* Collapsible Sections */}
          <View style={{ gap: 12 }}>
            <Animated.View entering={FadeInDown.delay(250)}>
              <CollapsibleSection title="Campaign Rules" defaultOpen>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    lineHeight: 22,
                  }}
                >
                  {campaign.rules || "No specific rules provided."}
                </Text>
              </CollapsibleSection>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300)}>
              <CollapsibleSection title="Requirements">
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    lineHeight: 22,
                  }}
                >
                  {campaign.requirements || "No specific requirements."}
                </Text>
              </CollapsibleSection>
            </Animated.View>

            {campaign.example_content && (
              <Animated.View entering={FadeInDown.delay(350)}>
                <CollapsibleSection title="Example Content">
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      lineHeight: 22,
                    }}
                  >
                    {campaign.example_content}
                  </Text>
                </CollapsibleSection>
              </Animated.View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <Animated.View
        entering={FadeInUp.delay(400)}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
        }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title="Join Campaign"
              onPress={() => joinMutation.mutate()}
              loading={joinMutation.isPending}
              icon={<CheckCircle size={18} color="#000" />}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
