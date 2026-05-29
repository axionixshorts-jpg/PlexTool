import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  DollarSign,
  Megaphone,
  FileCheck,
  Gift,
  Clock,
} from "lucide-react-native";
import { api } from "../utils/api";
import { colors } from "../theme/colors";

const typeConfig = {
  submission_approved: {
    icon: FileCheck,
    color: colors.success,
    bg: colors.successDim,
  },
  campaign_joined: {
    icon: Megaphone,
    color: colors.secondary,
    bg: colors.secondaryDim,
  },
  withdrawal: {
    icon: DollarSign,
    color: colors.primary,
    bg: colors.primaryDim,
  },
  referral: { icon: Gift, color: colors.warning, bg: colors.warningDim },
  reminder: {
    icon: Clock,
    color: colors.textSecondary,
    bg: colors.surfaceLight,
  },
  default: { icon: Bell, color: colors.textSecondary, bg: colors.surfaceLight },
};

function NotificationItem({ notification, index }) {
  const config =
    typeConfig[notification.notification_type] || typeConfig.default;
  const IconComponent = config.icon;
  const timeAgo = getTimeAgo(notification.created_at);

  return (
    <Animated.View entering={FadeInDown.delay(index * 40)}>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          padding: 14,
          backgroundColor: notification.is_read
            ? "transparent"
            : "rgba(57,255,136,0.03)",
          borderRadius: 16,
          borderWidth: notification.is_read ? 0 : 1,
          borderColor: notification.is_read
            ? "transparent"
            : "rgba(57,255,136,0.06)",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: config.bg,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconComponent size={20} color={config.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              marginBottom: 3,
            }}
          >
            {notification.title}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              fontFamily: "Inter_400Regular",
              lineHeight: 18,
            }}
          >
            {notification.message}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 11,
              fontFamily: "Inter_400Regular",
              marginTop: 4,
            }}
          >
            {timeAgo}
          </Text>
        </View>
        {!notification.is_read && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.primary,
              marginTop: 4,
            }}
          />
        )}
      </View>
    </Animated.View>
  );
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: api.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: api.markNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
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
              Notifications
            </Text>
            {unreadCount > 0 && (
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
                    fontSize: 12,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={() => markReadMutation.mutate()}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <CheckCheck size={16} color={colors.primary} />
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 13,
                  fontFamily: "Inter_500Medium",
                }}
              >
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <NotificationItem notification={item} index={index} />
        )}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
          gap: 4,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <Bell size={48} color={colors.textMuted} />
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                marginTop: 16,
              }}
            >
              No notifications yet
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 13,
                fontFamily: "Inter_400Regular",
                marginTop: 4,
              }}
            >
              We'll notify you when something happens
            </Text>
          </View>
        }
      />
    </View>
  );
}
