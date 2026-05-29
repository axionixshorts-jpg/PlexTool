import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";
import { Search, SlidersHorizontal, Clock, Users } from "lucide-react-native";
import { api } from "../../utils/api";
import { colors } from "../../theme/colors";
import StatusBadge from "../../components/ui/StatusBadge";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";

const platforms = ["All", "Instagram", "YouTube", "TikTok", "Twitch"];
const categoryList = [
  "All",
  "Fashion",
  "Technology",
  "Health & Fitness",
  "Food & Cooking",
  "Gaming",
  "Beauty",
  "Travel",
  "Lifestyle",
];

function CampaignListCard({ campaign, onPress }) {
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: 14,
        flexDirection: "row",
        gap: 12,
      }}
    >
      <Image
        source={{ uri: campaign.brand_logo }}
        style={{ width: 48, height: 48, borderRadius: 16 }}
        contentFit="cover"
      />
      <View style={{ flex: 1, gap: 6 }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 15,
            fontFamily: "Inter_600SemiBold",
          }}
          numberOfLines={1}
        >
          {campaign.title}
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 12,
            fontFamily: "Inter_400Regular",
          }}
          numberOfLines={1}
        >
          {campaign.brand_name} · {campaign.category}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginTop: 2,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              fontFamily: "Inter_700Bold",
            }}
          >
            ${campaign.reward_amount}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Clock size={12} color={colors.textMuted} />
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontFamily: "Inter_400Regular",
              }}
            >
              {daysLeft}d left
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Users size={12} color={colors.textMuted} />
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontFamily: "Inter_400Regular",
              }}
            >
              {campaign.current_participants}/{campaign.max_participants || "∞"}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <StatusBadge status={campaign.status} />
        <View
          style={{
            backgroundColor: colors.surfaceLight,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 10,
              fontFamily: "Inter_500Medium",
            }}
          >
            {campaign.platform}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CampaignsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const queryParams = {};
  if (search) queryParams.search = search;
  if (selectedPlatform !== "All") queryParams.platform = selectedPlatform;
  if (selectedCategory !== "All") queryParams.category = selectedCategory;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["campaigns", queryParams],
    queryFn: () => api.getCampaigns(queryParams),
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const campaigns = data?.campaigns || [];

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
          Campaigns
        </Animated.Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.inputBg,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            paddingHorizontal: 14,
            gap: 10,
          }}
        >
          <Search size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search campaigns..."
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              height: 46,
              color: colors.textPrimary,
              fontSize: 14,
              fontFamily: "Inter_400Regular",
            }}
          />
          <TouchableOpacity>
            <SlidersHorizontal size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Platform Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: 10 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {platforms.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setSelectedPlatform(p)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor:
                selectedPlatform === p ? colors.primaryDim : colors.surface,
              borderWidth: 1,
              borderColor:
                selectedPlatform === p ? colors.primary : colors.cardBorder,
            }}
          >
            <Text
              style={{
                color:
                  selectedPlatform === p
                    ? colors.primary
                    : colors.textSecondary,
                fontSize: 12,
                fontFamily: "Inter_500Medium",
              }}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {categoryList.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setSelectedCategory(c)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor:
                selectedCategory === c ? colors.secondaryDim : colors.surface,
              borderWidth: 1,
              borderColor:
                selectedCategory === c ? colors.secondary : colors.cardBorder,
            }}
          >
            <Text
              style={{
                color:
                  selectedCategory === c
                    ? colors.secondary
                    : colors.textSecondary,
                fontSize: 12,
                fontFamily: "Inter_500Medium",
              }}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Campaign List */}
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50)}>
            <CampaignListCard
              campaign={item}
              onPress={() => router.push(`/campaign-detail?id=${item.id}`)}
            />
          </Animated.View>
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
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 15,
                  fontFamily: "Inter_500Medium",
                }}
              >
                No campaigns found
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
