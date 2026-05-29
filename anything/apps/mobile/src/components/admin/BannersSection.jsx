import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { ImageIcon as ImageIconLucide, Trash2 } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { adminFetch } from "../../utils/adminApi";
import { SectionHeader } from "./SectionHeader";
import { AdminCard } from "./AdminCard";
import { StatusPill } from "./StatusPill";
import { BannerCreateModal } from "./BannerCreateModal";

export function BannersSection() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    banner_type: "promotional",
    priority: "0",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-banners-mobile"],
    queryFn: () => adminFetch("/api/admin/banners"),
  });

  const createMutation = useMutation({
    mutationFn: (body) =>
      adminFetch("/api/admin/banners", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners-mobile"] });
      setShowCreate(false);
      setForm({
        title: "",
        subtitle: "",
        image_url: "",
        link_url: "",
        banner_type: "promotional",
        priority: "0",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) =>
      adminFetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active }),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-banners-mobile"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      adminFetch(`/api/admin/banners/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-banners-mobile"] }),
  });

  const banners = data?.banners || [];

  return (
    <View>
      <SectionHeader
        title="Promo Banners"
        count={banners.length}
        action="Add Banner"
        onAction={() => setShowCreate(true)}
      />
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 12,
          fontFamily: "Inter_400Regular",
          marginBottom: 14,
        }}
      >
        Banners appear as a slider on the home screen. Up to 10 active banners.
      </Text>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <View style={{ gap: 10 }}>
          {banners.map((b) => (
            <AdminCard key={b.id}>
              <View style={{ padding: 14 }}>
                {b.image_url ? (
                  <Image
                    source={{ uri: b.image_url }}
                    style={{
                      width: "100%",
                      height: 120,
                      borderRadius: 12,
                      marginBottom: 10,
                    }}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: 80,
                      borderRadius: 12,
                      backgroundColor: "rgba(57,255,136,0.05)",
                      borderWidth: 1,
                      borderColor: colors.cardBorder,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <ImageIconLucide size={24} color={colors.textMuted} />
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      No image
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
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
                    >
                      {b.title}
                    </Text>
                    {b.subtitle && (
                      <Text
                        style={{ color: colors.textMuted, fontSize: 12 }}
                        numberOfLines={2}
                      >
                        {b.subtitle}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginLeft: 8,
                    }}
                  >
                    <StatusPill status={b.is_active ? "active" : "paused"} />
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() =>
                      toggleMutation.mutate({
                        id: b.id,
                        is_active: !b.is_active,
                      })
                    }
                    style={{
                      flex: 1,
                      backgroundColor: b.is_active
                        ? "rgba(255,181,71,0.12)"
                        : "rgba(57,255,136,0.12)",
                      borderRadius: 12,
                      paddingVertical: 10,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: b.is_active
                        ? "rgba(255,181,71,0.3)"
                        : "rgba(57,255,136,0.3)",
                    }}
                  >
                    <Text
                      style={{
                        color: b.is_active ? "#FFB547" : "#39FF88",
                        fontSize: 12,
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      {b.is_active ? "Deactivate" : "Activate"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert("Delete Banner", `Delete "${b.title}"?`, [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => deleteMutation.mutate(b.id),
                        },
                      ])
                    }
                    style={{
                      backgroundColor: "rgba(255,77,103,0.12)",
                      padding: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(255,77,103,0.3)",
                    }}
                  >
                    <Trash2 size={15} color="#FF4D67" />
                  </TouchableOpacity>
                </View>
              </View>
            </AdminCard>
          ))}
          {banners.length === 0 && (
            <View style={{ alignItems: "center", padding: 30, gap: 10 }}>
              <ImageIconLucide size={36} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                No banners yet
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                style={{
                  backgroundColor: colors.primaryDim,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 13,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  Add First Banner
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <BannerCreateModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        form={form}
        setForm={setForm}
        onSubmit={() =>
          createMutation.mutate({
            ...form,
            priority: parseInt(form.priority) || 0,
          })
        }
        isPending={createMutation.isPending}
      />
    </View>
  );
}
