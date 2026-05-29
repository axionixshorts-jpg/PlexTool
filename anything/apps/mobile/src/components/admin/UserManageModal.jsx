import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { ArrowLeft, Trash2 } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { AdminCard } from "./AdminCard";

export function UserManageModal({
  visible,
  user,
  creditAmount,
  setCreditAmount,
  creditNote,
  setCreditNote,
  onClose,
  onAction,
  onDelete,
  isPending,
}) {
  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TouchableOpacity onPress={onClose}>
            <ArrowLeft size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontFamily: "Inter_700Bold",
            }}
          >
            Manage User
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <AdminCard>
            <View style={{ padding: 16, gap: 10 }}>
              {[
                ["Name", user.name],
                ["Email", user.email],
                ["Role", user.role],
                ["Balance", `$${parseFloat(user.balance || 0).toFixed(2)}`],
                [
                  "Lifetime Earnings",
                  `$${parseFloat(user.lifetime_earnings || 0).toFixed(2)}`,
                ],
                ["Submissions", String(user.submission_count || 0)],
              ].map(([label, value]) => (
                <View
                  key={label}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                    {label}
                  </Text>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 13,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </AdminCard>

          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 15,
              fontFamily: "Inter_700Bold",
            }}
          >
            Wallet Actions
          </Text>
          <AdminCard>
            <View style={{ padding: 14, gap: 10 }}>
              <TextInput
                value={creditAmount}
                onChangeText={setCreditAmount}
                placeholder="Amount (e.g. 100)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.textPrimary,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              />
              <TextInput
                value={creditNote}
                onChangeText={setCreditNote}
                placeholder="Note (optional)"
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.textPrimary,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => onAction("add_balance")}
                  disabled={!creditAmount || isPending}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(57,255,136,0.12)",
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(57,255,136,0.3)",
                  }}
                >
                  <Text
                    style={{
                      color: "#39FF88",
                      fontSize: 13,
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    + Add Balance
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onAction("deduct_balance")}
                  disabled={!creditAmount || isPending}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,77,103,0.12)",
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255,77,103,0.3)",
                  }}
                >
                  <Text
                    style={{
                      color: "#FF4D67",
                      fontSize: 13,
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    − Deduct
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </AdminCard>

          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 15,
              fontFamily: "Inter_700Bold",
            }}
          >
            Account Actions
          </Text>
          <AdminCard>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Delete User", `Permanently delete ${user.name}?`, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: onDelete,
                  },
                ])
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
              }}
            >
              <Trash2 size={18} color="#FF4D67" />
              <Text
                style={{
                  color: "#FF4D67",
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Delete Account
              </Text>
            </TouchableOpacity>
          </AdminCard>
        </ScrollView>
      </View>
    </Modal>
  );
}
