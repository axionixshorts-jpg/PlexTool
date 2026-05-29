import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { XCircle, Upload } from "lucide-react-native";
import { Image } from "expo-image";
import { colors } from "../../theme/colors";

export function BannerCreateModal({
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
            Add New Banner
          </Text>
          <TouchableOpacity onPress={onClose}>
            <XCircle size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, gap: 16 }}
        >
          {[
            {
              label: "Banner Title *",
              key: "title",
              placeholder: "e.g. Summer Sale - 50% Off",
            },
            {
              label: "Subtitle",
              key: "subtitle",
              placeholder: "Short description",
            },
            {
              label: "Image URL *",
              key: "image_url",
              placeholder: "https://example.com/banner.jpg",
            },
            {
              label: "Link URL (optional)",
              key: "link_url",
              placeholder: "https://example.com/offer",
            },
            {
              label: "Banner Type",
              key: "banner_type",
              placeholder: "promotional / announcement / event",
            },
            {
              label: "Priority (0 = highest)",
              key: "priority",
              placeholder: "0",
              keyboardType: "numeric",
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
                }}
                autoCapitalize="none"
              />
            </View>
          ))}
          {form.image_url ? (
            <View>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  marginBottom: 8,
                  letterSpacing: 0.5,
                }}
              >
                PREVIEW
              </Text>
              <Image
                source={{ uri: form.image_url }}
                style={{ width: "100%", height: 160, borderRadius: 14 }}
                contentFit="cover"
              />
            </View>
          ) : null}
        </ScrollView>
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={onSubmit}
            disabled={isPending || !form.title || !form.image_url}
            style={{
              backgroundColor:
                !form.title || !form.image_url
                  ? colors.surface
                  : colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              opacity: !form.title || !form.image_url ? 0.5 : 1,
            }}
          >
            {isPending ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Upload size={18} color="#000" />
            )}
            <Text
              style={{
                color: "#000",
                fontSize: 16,
                fontFamily: "Inter_700Bold",
              }}
            >
              Upload Banner
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
