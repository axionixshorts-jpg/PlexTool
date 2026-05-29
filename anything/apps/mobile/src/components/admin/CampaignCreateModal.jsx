import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { XCircle, Plus } from "lucide-react-native";
import { colors } from "../../theme/colors";

export function CampaignCreateModal({
  visible,
  onClose,
  form,
  setForm,
  onSubmit,
  isPending,
}) {
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
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontFamily: "Inter_700Bold",
            }}
          >
            Create Campaign
          </Text>
          <TouchableOpacity onPress={onClose}>
            <XCircle size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, gap: 14 }}
        >
          {[
            {
              label: "Campaign Title *",
              key: "title",
              placeholder: "Enter campaign title",
            },
            {
              label: "Brand Name *",
              key: "brand_name",
              placeholder: "Enter brand name",
            },
            {
              label: "Reward Amount ($) *",
              key: "reward_amount",
              placeholder: "e.g. 500",
              keyboardType: "numeric",
            },
            {
              label: "Platform",
              key: "platform",
              placeholder: "Instagram / YouTube / TikTok",
            },
            {
              label: "Category",
              key: "category",
              placeholder: "Fashion / Tech / Fitness...",
            },
            {
              label: "Description",
              key: "description",
              placeholder: "Campaign description",
              multiline: true,
            },
          ].map((field) => (
            <View key={field.key}>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  marginBottom: 6,
                  letterSpacing: 0.5,
                }}
              >
                {field.label.toUpperCase()}
              </Text>
              <TextInput
                value={form[field.key]}
                onChangeText={(v) => setForm((p) => ({ ...p, [field.key]: v }))}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={field.keyboardType || "default"}
                multiline={field.multiline}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  minHeight: field.multiline ? 80 : undefined,
                  textAlignVertical: field.multiline ? "top" : undefined,
                }}
              />
            </View>
          ))}
        </ScrollView>
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={onSubmit}
            disabled={isPending}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isPending ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Plus size={18} color="#000" />
            )}
            <Text
              style={{
                color: "#000",
                fontSize: 16,
                fontFamily: "Inter_700Bold",
              }}
            >
              Create Campaign
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
