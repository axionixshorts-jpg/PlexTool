import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { adminFetch } from "../../utils/adminApi";
import { SectionHeader } from "./SectionHeader";
import { AdminCard } from "./AdminCard";
import { StatusPill } from "./StatusPill";
import { SubmissionReviewModal } from "./SubmissionReviewModal";

export function SubmissionsSection() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [reviewNote, setReviewNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-submissions-mobile", statusFilter],
    queryFn: () =>
      adminFetch(`/api/admin/submissions?status=${statusFilter}&limit=30`),
    refetchInterval: 30000,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, notes }) =>
      adminFetch(`/api/admin/submissions/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status, reviewer_notes: notes }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-submissions-mobile"] });
      setSelected(null);
      setReviewNote("");
    },
  });

  const submissions = data?.submissions || [];
  const tabs = [
    { v: "pending", label: "Pending", color: "#FFB547" },
    { v: "approved", label: "Approved", color: "#39FF88" },
    { v: "rejected", label: "Rejected", color: "#FF4D67" },
  ];

  return (
    <View>
      <SectionHeader title="Submissions" count={data?.total || 0} />
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
          {submissions.map((s) => (
            <AdminCard key={s.id}>
              <TouchableOpacity
                onPress={() => setSelected(s)}
                activeOpacity={0.8}
                style={{ padding: 14 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                        marginBottom: 2,
                      }}
                      numberOfLines={1}
                    >
                      {s.creator_name}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {s.campaign_title}
                    </Text>
                  </View>
                  <StatusPill status={s.status} />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 14,
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    ${s.reward_amount}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Eye size={14} color={colors.textMuted} />
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 12,
                        fontFamily: "Inter_500Medium",
                      }}
                    >
                      Tap to review
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </AdminCard>
          ))}
          {submissions.length === 0 && (
            <Text
              style={{
                color: colors.textMuted,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              No {statusFilter} submissions
            </Text>
          )}
        </View>
      )}

      <SubmissionReviewModal
        visible={!!selected}
        submission={selected}
        reviewNote={reviewNote}
        setReviewNote={setReviewNote}
        onClose={() => {
          setSelected(null);
          setReviewNote("");
        }}
        onReview={(status) =>
          reviewMutation.mutate({
            id: selected.id,
            status,
            notes: reviewNote,
          })
        }
        isPending={reviewMutation.isPending}
      />
    </View>
  );
}
