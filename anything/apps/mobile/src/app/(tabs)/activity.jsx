import { useState, useCallback } from "react";
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
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";
import { Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react-native";
import { api } from "../../utils/api";
import { colors } from "../../theme/colors";
import StatusBadge from "../../components/ui/StatusBadge";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";

const tabs = ["All", "Pending", "Approved", "Rejected"];

function SubmissionCard({ submission, index }) {
  const date = new Date(submission.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const statusIcons = {
    pending: <Clock size={16} color={colors.warning} />,
    approved: <CheckCircle size={16} color={colors.success} />,
    rejected: <XCircle size={16} color={colors.error} />,
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: 14,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
            source={{ uri: submission.brand_logo }}
            style={{ width: 40, height: 40, borderRadius: 12 }}
            contentFit="cover"
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
              }}
              numberOfLines={1}
            >
              {submission.campaign_title}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                fontFamily: "Inter_400Regular",
              }}
            >
              {submission.brand_name} · {date}
            </Text>
          </View>
          {statusIcons[submission.status] || statusIcons.pending}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <StatusBadge status={submission.status} />
            {submission.status === "approved" && (
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontFamily: "Inter_700Bold",
                }}
              >
                +${submission.reward_amount}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 5,
              backgroundColor: colors.surfaceLight,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontFamily: "Inter_500Medium",
              }}
            >
              View
            </Text>
            <ExternalLink size={12} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {submission.reviewer_notes && (
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 10,
              padding: 10,
            }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                fontFamily: "Inter_400Regular",
              }}
            >
              Note: {submission.reviewer_notes}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("All");

  const queryParams = {};
  if (activeTab !== "All") queryParams.status = activeTab.toLowerCase();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["submissions", queryParams],
    queryFn: () => api.getSubmissions(queryParams),
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const submissions = data?.submissions || [];

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
        <Animated.Text
          entering={FadeInDown.delay(50)}
          style={{
            color: colors.textPrimary,
            fontSize: 24,
            fontFamily: "Inter_700Bold",
            letterSpacing: -0.3,
          }}
        >
          Activity
        </Animated.Text>
      </View>

      {/* Tabs */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.surface,
            borderRadius: 14,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.cardBorder,
          }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor:
                  activeTab === tab ? colors.primary : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: activeTab === tab ? "#000" : colors.textSecondary,
                  fontSize: 13,
                  fontFamily:
                    activeTab === tab ? "Inter_600SemiBold" : "Inter_500Medium",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submissions List */}
      <FlatList
        data={submissions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <SubmissionCard submission={item} index={index} />
        )}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
          gap: 12,
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
          isLoading ? (
            <View style={{ gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingTop: 80 }}>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  marginBottom: 6,
                }}
              >
                No submissions yet
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                }}
              >
                Join a campaign and submit content to get started
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
