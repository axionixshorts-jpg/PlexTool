import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Megaphone,
  FileCheck,
  Clock,
  Wallet,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import { adminFetch } from "../../utils/adminApi";
import { StatCard } from "./StatCard";

export function DashboardSection() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-dashboard-mobile"],
    queryFn: () => adminFetch("/api/admin/dashboard"),
    refetchInterval: 60000,
  });

  const stats = data?.stats;

  const statRows = [
    [
      {
        label: "Total Users",
        value: stats?.users?.total_users || 0,
        color: colors.secondary,
        icon: Users,
      },
      {
        label: "Campaigns",
        value: stats?.campaigns?.total_campaigns || 0,
        color: colors.primary,
        icon: Megaphone,
      },
    ],
    [
      {
        label: "Submissions",
        value: stats?.submissions?.total_submissions || 0,
        color: "#7C3AED",
        icon: FileCheck,
      },
      {
        label: "Pending",
        value: stats?.submissions?.pending_submissions || 0,
        color: "#FFB547",
        icon: Clock,
      },
    ],
    [
      {
        label: "Pending Payouts",
        value: `$${parseFloat(stats?.withdrawals?.pending_amount || 0).toFixed(0)}`,
        color: "#FFB547",
        icon: Wallet,
      },
      {
        label: "Total Paid",
        value: `$${parseFloat(stats?.wallet?.total_paid_out || 0).toFixed(0)}`,
        color: colors.primary,
        icon: TrendingUp,
      },
    ],
  ];

  if (isLoading)
    return (
      <View style={{ gap: 12, padding: 4 }}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ flexDirection: "row", gap: 12 }}>
            {[1, 2].map((j) => (
              <View
                key={j}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 18,
                  height: 90,
                }}
              />
            ))}
          </View>
        ))}
      </View>
    );

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: "rgba(57,255,136,0.1)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BarChart3 size={18} color={colors.primary} />
        </View>
        <View>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontFamily: "Inter_700Bold",
            }}
          >
            Overview
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 12,
              fontFamily: "Inter_400Regular",
            }}
          >
            Platform stats
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{ marginLeft: "auto", padding: 8 }}
        >
          <RefreshCw size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      {statRows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row", gap: 12 }}>
          {row.map((s, si) => (
            <StatCard
              key={si}
              label={s.label}
              value={String(s.value)}
              color={s.color}
              icon={s.icon}
              delay={ri * 60 + si * 30}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
