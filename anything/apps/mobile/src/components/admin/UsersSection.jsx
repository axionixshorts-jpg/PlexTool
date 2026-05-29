import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { colors } from "../../theme/colors";
import { adminFetch } from "../../utils/adminApi";
import { SectionHeader } from "./SectionHeader";
import { AdminCard } from "./AdminCard";
import { UserManageModal } from "./UserManageModal";

export function UsersSection() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users-mobile", search],
    queryFn: () => adminFetch(`/api/admin/users?search=${search}&limit=30`),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, ...body }) =>
      adminFetch(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users-mobile"] });
      setCreditAmount("");
      setCreditNote("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      adminFetch(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users-mobile"] });
      setSelected(null);
    },
  });

  const users = data?.users || [];

  return (
    <View>
      <SectionHeader title="Users" count={data?.total || 0} />
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
          placeholder="Search users..."
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
          {users.map((u) => (
            <AdminCard key={u.id}>
              <TouchableOpacity
                onPress={() => setSelected(u)}
                activeOpacity={0.8}
                style={{ padding: 14 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: "rgba(57,255,136,0.12)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {u.avatar_url ? (
                      <Image
                        source={{ uri: u.avatar_url }}
                        style={{ width: 42, height: 42, borderRadius: 21 }}
                        contentFit="cover"
                      />
                    ) : (
                      <Text
                        style={{
                          color: colors.primary,
                          fontSize: 16,
                          fontFamily: "Inter_700Bold",
                        }}
                      >
                        {(u.name || "U").charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      {u.name || "Unknown"}
                    </Text>
                    <Text
                      style={{ color: colors.textMuted, fontSize: 12 }}
                      numberOfLines={1}
                    >
                      {u.email}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 13,
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      ${parseFloat(u.balance || 0).toFixed(0)}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                      {u.role}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </AdminCard>
          ))}
          {users.length === 0 && (
            <Text
              style={{
                color: colors.textMuted,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              No users found
            </Text>
          )}
        </View>
      )}

      <UserManageModal
        visible={!!selected}
        user={selected}
        creditAmount={creditAmount}
        setCreditAmount={setCreditAmount}
        creditNote={creditNote}
        setCreditNote={setCreditNote}
        onClose={() => setSelected(null)}
        onAction={(action) =>
          actionMutation.mutate({
            id: selected.id,
            action,
            amount: parseFloat(creditAmount),
            description: creditNote,
          })
        }
        onDelete={() => deleteMutation.mutate(selected.id)}
        isPending={actionMutation.isPending}
      />
    </View>
  );
}
