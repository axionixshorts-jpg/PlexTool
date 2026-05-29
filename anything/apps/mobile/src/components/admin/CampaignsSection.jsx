import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit3 } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { adminFetch } from "../../utils/adminApi";
import { SectionHeader } from "./SectionHeader";
import { AdminCard } from "./AdminCard";
import { StatusPill } from "./StatusPill";
import { CampaignCreateModal } from "./CampaignCreateModal";
import { CampaignEditModal } from "./CampaignEditModal";

export function CampaignsSection() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({
    title: "",
    brand_name: "",
    reward_amount: "",
    platform: "Instagram",
    category: "Fashion",
    description: "",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-campaigns-mobile", search],
    queryFn: () => adminFetch(`/api/admin/campaigns?search=${search}&limit=30`),
  });

  const createMutation = useMutation({
    mutationFn: (body) =>
      adminFetch("/api/admin/campaigns", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns-mobile"] });
      setShowCreate(false);
      setForm({
        title: "",
        brand_name: "",
        reward_amount: "",
        platform: "Instagram",
        category: "Fashion",
        description: "",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }) =>
      adminFetch(`/api/admin/campaigns/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-campaigns-mobile"] }),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, ...body }) =>
      adminFetch(`/api/admin/campaigns/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns-mobile"] });
      setEditTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      adminFetch(`/api/admin/campaigns/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-campaigns-mobile"] }),
  });

  const campaigns = data?.campaigns || [];

  return (
    <View>
      <SectionHeader
        title="Campaigns"
        count={campaigns.length}
        action="Create"
        onAction={() => setShowCreate(true)}
      />
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          marginBottom: 14,
          height: 44,
        }}
      >
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search campaigns..."
          placeholderTextColor={colors.textMuted}
          style={{
            flex: 1,
            color: colors.textPrimary,
            fontSize: 14,
            fontFamily: "Inter_400Regular",
          }}
        />
      </View>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <View style={{ gap: 10 }}>
          {campaigns.map((c) => (
            <AdminCard key={c.id}>
              <View style={{ padding: 14 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                        marginBottom: 2,
                      }}
                      numberOfLines={1}
                    >
                      {c.title}
                    </Text>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                      }}
                    >
                      {c.brand_name} • {c.platform}
                    </Text>
                  </View>
                  <StatusPill status={c.status} />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 15,
                      fontFamily: "Inter_700Bold",
                      flex: 1,
                    }}
                  >
                    ${c.reward_amount}
                  </Text>
                  {/* Edit Button */}
                  <TouchableOpacity
                    onPress={() => setEditTarget(c)}
                    style={{
                      backgroundColor: "rgba(0,209,255,0.12)",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "rgba(0,209,255,0.3)",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Edit3 size={12} color="#00D1FF" />
                    <Text
                      style={{
                        color: "#00D1FF",
                        fontSize: 12,
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      updateMutation.mutate({
                        id: c.id,
                        status: c.status === "active" ? "paused" : "active",
                      })
                    }
                    style={{
                      backgroundColor:
                        c.status === "active"
                          ? "rgba(255,181,71,0.15)"
                          : "rgba(57,255,136,0.15)",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: c.status === "active" ? "#FFB547" : "#39FF88",
                        fontSize: 12,
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      {c.status === "active" ? "Pause" : "Activate"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert("Delete Campaign", `Delete "${c.title}"?`, [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => deleteMutation.mutate(c.id),
                        },
                      ])
                    }
                    style={{
                      backgroundColor: "rgba(255,77,103,0.12)",
                      padding: 7,
                      borderRadius: 10,
                    }}
                  >
                    <Trash2 size={14} color="#FF4D67" />
                  </TouchableOpacity>
                </View>
              </View>
            </AdminCard>
          ))}
          {campaigns.length === 0 && (
            <Text
              style={{
                color: colors.textMuted,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              No campaigns found
            </Text>
          )}
        </View>
      )}

      <CampaignCreateModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        form={form}
        setForm={setForm}
        onSubmit={() =>
          createMutation.mutate({
            ...form,
            reward_amount: parseFloat(form.reward_amount) || 0,
          })
        }
        isPending={createMutation.isPending}
      />

      <CampaignEditModal
        visible={!!editTarget}
        campaign={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={(data) => editMutation.mutate(data)}
        isPending={editMutation.isPending}
      />
    </View>
  );
}
