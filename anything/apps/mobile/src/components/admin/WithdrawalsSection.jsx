import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { colors } from "../../theme/colors";
import { adminFetch } from "../../utils/adminApi";
import { SectionHeader } from "./SectionHeader";
import { AdminCard } from "./AdminCard";
import { StatusPill } from "./StatusPill";

export function WithdrawalsSection() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-withdrawals-mobile", statusFilter],
    queryFn: () =>
      adminFetch(`/api/admin/withdrawals?status=${statusFilter}&limit=30`),
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) =>
      adminFetch(`/api/admin/withdrawals/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-withdrawals-mobile"] }),
  });

  const withdrawals = data?.withdrawals || [];
  const tabs = [
    { v: "pending", label: "Pending", color: "#FFB547" },
    { v: "processing", label: "Processing", color: "#00D1FF" },
    { v: "paid", label: "Paid", color: "#39FF88" },
  ];

  return (
    <View>
      <SectionHeader title="Withdrawals" count={data?.total || 0} />
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.v}
            onPress={() => setStatusFilter(t.v)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor:
                statusFilter === t.v ? `${t.color}20` : colors.surface,
              borderWidth: 1,
              borderColor: statusFilter === t.v ? t.color : colors.cardBorder,
            }}
          >
            <Text
              style={{
                color: statusFilter === t.v ? t.color : colors.textMuted,
                fontSize: 12,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <View style={{ gap: 10 }}>
          {withdrawals.map((w) => (
            <AdminCard key={w.id}>
              <View style={{ padding: 14 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      {w.user_name}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {w.method?.toUpperCase()} •{" "}
                      {new Date(w.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <StatusPill status={w.status} />
                </View>
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 18,
                    fontFamily: "Inter_700Bold",
                    marginBottom: 10,
                  }}
                >
                  ${w.amount}
                </Text>
                {statusFilter === "pending" && (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() =>
                        updateMutation.mutate({
                          id: w.id,
                          status: "processing",
                        })
                      }
                      style={{
                        flex: 1,
                        backgroundColor: "rgba(0,209,255,0.12)",
                        borderRadius: 12,
                        paddingVertical: 10,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "rgba(0,209,255,0.3)",
                      }}
                    >
                      <Text
                        style={{
                          color: "#00D1FF",
                          fontSize: 12,
                          fontFamily: "Inter_700Bold",
                        }}
                      >
                        ▶ Process
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        updateMutation.mutate({ id: w.id, status: "rejected" })
                      }
                      style={{
                        flex: 1,
                        backgroundColor: "rgba(255,77,103,0.12)",
                        borderRadius: 12,
                        paddingVertical: 10,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "rgba(255,77,103,0.3)",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FF4D67",
                          fontSize: 12,
                          fontFamily: "Inter_700Bold",
                        }}
                      >
                        ✗ Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {statusFilter === "processing" && (
                  <TouchableOpacity
                    onPress={() =>
                      updateMutation.mutate({ id: w.id, status: "paid" })
                    }
                    style={{
                      backgroundColor: "rgba(57,255,136,0.12)",
                      borderRadius: 12,
                      paddingVertical: 10,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "rgba(57,255,136,0.3)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#39FF88",
                        fontSize: 12,
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      ✓ Mark as Paid
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </AdminCard>
          ))}
          {withdrawals.length === 0 && (
            <Text
              style={{
                color: colors.textMuted,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              No {statusFilter} withdrawals
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
