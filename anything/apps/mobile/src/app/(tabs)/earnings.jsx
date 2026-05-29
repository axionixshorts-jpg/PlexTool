import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Clock,
  Wallet,
} from "lucide-react-native";
import { api } from "../../utils/api";
import { colors, gradients } from "../../theme/colors";
import PrimaryButton from "../../components/ui/PrimaryButton";
import Card from "../../components/ui/Card";
import SkeletonLoader from "../../components/ui/SkeletonLoader";

function StatCard({ title, value, icon: Icon, color, delay }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={{ flex: 1 }}
    >
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
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: `${color}20`,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon size={18} color={color} />
        </View>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 11,
            fontFamily: "Inter_500Medium",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 20,
            fontFamily: "Inter_700Bold",
          }}
        >
          {value}
        </Text>
      </View>
    </Animated.View>
  );
}

function EarningItem({ earning, index }) {
  const date = new Date(earning.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const isPositive = earning.earning_type !== "withdrawal";

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 50)}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: isPositive ? colors.successDim : colors.errorDim,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          {isPositive ? (
            <ArrowDownRight size={18} color={colors.success} />
          ) : (
            <ArrowUpRight size={18} color={colors.error} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontFamily: "Inter_500Medium",
            }}
          >
            {earning.campaign_title || "Campaign Reward"}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 12,
              fontFamily: "Inter_400Regular",
            }}
          >
            {date} · {earning.earning_type}
          </Text>
        </View>
        <Text
          style={{
            color: isPositive ? colors.success : colors.error,
            fontSize: 16,
            fontFamily: "Inter_700Bold",
          }}
        >
          {isPositive ? "+" : "-"}${parseFloat(earning.amount).toFixed(2)}
        </Text>
      </View>
    </Animated.View>
  );
}

function WeeklyChart({ stats }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxVal = Math.max(
    ...(stats?.map((s) => parseFloat(s.total)) || [1]),
    1,
  );

  return (
    <Animated.View entering={FadeInDown.delay(250)}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: 16,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 15,
            fontFamily: "Inter_600SemiBold",
            marginBottom: 16,
          }}
        >
          Weekly Earnings
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 6,
            height: 100,
          }}
        >
          {days.map((day, i) => {
            const stat = stats?.[i];
            const val = stat ? parseFloat(stat.total) : 0;
            const height = Math.max((val / maxVal) * 80, 4);
            return (
              <View key={day} style={{ flex: 1, alignItems: "center", gap: 6 }}>
                <LinearGradient
                  colors={
                    val > 0
                      ? gradients.primary
                      : [colors.surfaceLight, colors.surfaceLight]
                  }
                  style={{
                    width: "100%",
                    height,
                    borderRadius: 6,
                  }}
                />
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 10,
                    fontFamily: "Inter_500Medium",
                  }}
                >
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["wallet"],
    queryFn: api.getWallet,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const wallet = data?.wallet;
  const earnings = data?.recentEarnings || [];
  const weeklyStats = data?.weeklyStats || [];

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
          <Animated.Text
            entering={FadeInDown.delay(50)}
            style={{
              color: colors.textPrimary,
              fontSize: 24,
              fontFamily: "Inter_700Bold",
              letterSpacing: -0.3,
            }}
          >
            Earnings
          </Animated.Text>
        </View>

        {/* Balance Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
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
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  fontFamily: "Inter_500Medium",
                  marginBottom: 8,
                }}
              >
                Total Balance
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 40,
                  fontFamily: "Inter_700Bold",
                  letterSpacing: -1,
                  marginBottom: 20,
                }}
              >
                ${wallet ? parseFloat(wallet.balance).toFixed(2) : "0.00"}
              </Text>
              <PrimaryButton
                title="Withdraw Funds"
                onPress={() => router.push("/withdraw")}
                icon={<Wallet size={18} color="#000" />}
              />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            gap: 10,
            marginBottom: 16,
          }}
        >
          <StatCard
            title="Pending"
            value={`$${wallet ? parseFloat(wallet.pending_balance).toFixed(0) : "0"}`}
            icon={Clock}
            color={colors.warning}
            delay={150}
          />
          <StatCard
            title="Lifetime"
            value={`$${wallet ? parseFloat(wallet.lifetime_earnings).toFixed(0) : "0"}`}
            icon={TrendingUp}
            color={colors.primary}
            delay={200}
          />
        </View>

        {/* Weekly Chart */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <WeeklyChart stats={weeklyStats} />
        </View>

        {/* Recent Transactions */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              marginBottom: 8,
            }}
          >
            Recent Transactions
          </Text>
          {isLoading ? (
            <View style={{ gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <SkeletonLoader key={i} height={60} borderRadius={12} />
              ))}
            </View>
          ) : earnings.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <DollarSign size={40} color={colors.textMuted} />
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  marginTop: 12,
                }}
              >
                No transactions yet
              </Text>
            </View>
          ) : (
            earnings.map((e, i) => (
              <EarningItem key={e.id} earning={e} index={i} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
