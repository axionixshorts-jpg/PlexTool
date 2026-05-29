import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import {
  Bell,
  ChevronRight,
  TrendingUp,
  Zap,
  Star,
  Clock,
} from "lucide-react-native";
import useAuthStore from "../../store/authStore";
import { api } from "../../utils/api";
import { colors, gradients } from "../../theme/colors";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";
import StatusBadge from "../../components/ui/StatusBadge";

const { width } = Dimensions.get("window");

const categories = [
  "All",
  "Fashion",
  "Tech",
  "Fitness",
  "Food",
  "Gaming",
  "Beauty",
  "Travel",
];

// ─── Promotional Banner Slider ──────────────────────────────────────────────
function BannerSlider({ banners }) {
  const flatRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [banners?.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(80).springify()}
      style={{ marginBottom: 20 }}
    >
      <FlatList
        ref={flatRef}
        data={banners}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        style={{ flexGrow: 0 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.93}
            style={{ width, paddingHorizontal: 20 }}
          >
            <View
              style={{
                borderRadius: 22,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(57,255,136,0.12)",
              }}
            >
              <Image
                source={{ uri: item.image_url }}
                style={{ width: "100%", height: 148 }}
                contentFit="cover"
                transition={300}
              />
              <LinearGradient
                colors={["transparent", "rgba(11,11,15,0.88)"]}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                  justifyContent: "flex-end",
                  padding: 14,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontFamily: "Inter_700Bold",
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 11,
                      fontFamily: "Inter_400Regular",
                    }}
                    numberOfLines={1}
                  >
                    {item.subtitle}
                  </Text>
                ) : null}
              </LinearGradient>
              {/* Type badge */}
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 9,
                  paddingVertical: 3,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: "#000",
                    fontSize: 10,
                    fontFamily: "Inter_700Bold",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {item.banner_type?.replace("_", " ") || "PROMO"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* Dot indicators */}
      {banners.length > 1 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
            marginTop: 10,
          }}
        >
          {banners.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatRef.current?.scrollToIndex({ index: i, animated: true });
                setActiveIndex(i);
              }}
              style={{
                width: i === activeIndex ? 22 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  i === activeIndex ? colors.primary : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function WalletCard({ wallet }) {
  const balance = wallet ? parseFloat(wallet.balance || 0).toFixed(2) : "0.00";
  const pending = wallet
    ? parseFloat(wallet.pending_balance || 0).toFixed(2)
    : "0.00";

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()}>
      <LinearGradient
        colors={["#1A2B1F", "#151C20"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: "rgba(57, 255, 136, 0.1)",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              fontFamily: "Inter_500Medium",
            }}
          >
            Available Balance
          </Text>
          <View
            style={{
              backgroundColor: colors.primaryDim,
              paddingHorizontal: 10,
              paddingVertical: 4,
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
              ${pending} pending
            </Text>
          </View>
        </View>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 36,
            fontFamily: "Inter_700Bold",
            letterSpacing: -1,
          }}
        >
          ${balance}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
          }}
        >
          <TrendingUp size={14} color={colors.primary} />
          <Text
            style={{
              color: colors.primary,
              fontSize: 13,
              fontFamily: "Inter_500Medium",
            }}
          >
            +12.5% this week
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function CampaignCard({ campaign, onPress, index }) {
  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 60).springify()}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: campaign.hero_image }}
          style={{ width: "100%", height: 130 }}
          contentFit="cover"
          transition={200}
        />
        <View style={{ padding: 14 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Image
              source={{ uri: campaign.brand_logo }}
              style={{ width: 28, height: 28, borderRadius: 14 }}
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
                {campaign.title}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                }}
              >
                {campaign.brand_name}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
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
              <StatusBadge status={campaign.status} />
            </View>
            <View
              style={{
                backgroundColor: colors.surfaceLight,
                paddingHorizontal: 8,
                paddingVertical: 4,
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
                {campaign.platform}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function FeaturedCarousel({ campaigns, router }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, marginHorizontal: -20 }}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
    >
      {campaigns.map((c, i) => (
        <TouchableOpacity
          key={c.id}
          onPress={() => router.push(`/campaign-detail?id=${c.id}`)}
          activeOpacity={0.85}
          style={{ width: width * 0.72 }}
        >
          <Animated.View entering={FadeInRight.delay(150 + i * 80)}>
            <LinearGradient
              colors={["rgba(57,255,136,0.08)", "rgba(0,209,255,0.06)"]}
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(57,255,136,0.1)",
                overflow: "hidden",
              }}
            >
              <Image
                source={{ uri: c.hero_image }}
                style={{ width: "100%", height: 140 }}
                contentFit="cover"
                transition={200}
              />
              <View style={{ padding: 14 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 6,
                  }}
                >
                  <Star
                    size={14}
                    color={colors.primary}
                    fill={colors.primary}
                  />
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 12,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Featured
                  </Text>
                </View>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 15,
                    fontFamily: "Inter_600SemiBold",
                    marginBottom: 4,
                  }}
                  numberOfLines={1}
                >
                  {c.title}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 13,
                      fontFamily: "Inter_400Regular",
                    }}
                  >
                    {c.brand_name}
                  </Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 15,
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    ${c.reward_amount}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: bannersData } = useQuery({
    queryKey: ["banners"],
    queryFn: () => fetch("/api/banners").then((r) => r.json()),
    staleTime: 60000,
  });

  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: api.getWallet,
  });

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ["campaigns", "featured"],
    queryFn: () => api.getCampaigns({ featured: "true", limit: "5" }),
  });

  const {
    data: trendingData,
    isLoading: trendingLoading,
    refetch,
  } = useQuery({
    queryKey: ["campaigns", "trending"],
    queryFn: () => api.getCampaigns({ trending: "true", limit: "6" }),
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const firstName = user?.name?.split(" ")[0] || "Creator";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Animated.View entering={FadeInDown.delay(50)}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                }}
              >
                Welcome back,
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 22,
                  fontFamily: "Inter_700Bold",
                  letterSpacing: -0.3,
                }}
              >
                {firstName} 👋
              </Text>
            </Animated.View>
            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Bell size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── PROMOTIONAL BANNER SLIDER ── */}
        <BannerSlider banners={bannersData?.banners || []} />

        {/* Wallet */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <WalletCard wallet={walletData?.wallet} />
        </View>

        {/* Quick Stats */}
        <Animated.View
          entering={FadeInDown.delay(150)}
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Campaigns",
              value: "12",
              icon: Zap,
              color: colors.primary,
            },
            {
              label: "Submissions",
              value: "8",
              icon: Clock,
              color: colors.secondary,
            },
            {
              label: "Approved",
              value: "5",
              icon: Star,
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
                padding: 12,
                alignItems: "center",
                gap: 6,
              }}
            >
              <stat.icon size={18} color={stat.color} />
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

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginBottom: 20 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor:
                  selectedCategory === cat ? colors.primaryDim : colors.surface,
                borderWidth: 1,
                borderColor:
                  selectedCategory === cat ? colors.primary : colors.cardBorder,
              }}
            >
              <Text
                style={{
                  color:
                    selectedCategory === cat
                      ? colors.primary
                      : colors.textSecondary,
                  fontSize: 13,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              Featured Campaigns
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/campaigns")}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 13,
                  fontFamily: "Inter_500Medium",
                }}
              >
                See all
              </Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {featuredLoading ? (
            <View style={{ gap: 12 }}>
              <SkeletonCard />
            </View>
          ) : (
            <FeaturedCarousel
              campaigns={featuredData?.campaigns || []}
              router={router}
            />
          )}
        </View>

        {/* Trending */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              Trending Now 🔥
            </Text>
          </View>
          {trendingLoading ? (
            <View style={{ gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              {(trendingData?.campaigns || []).map((campaign, i) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  index={i}
                  onPress={() =>
                    router.push(`/campaign-detail?id=${campaign.id}`)
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
