import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { XCircle, Edit3 } from "lucide-react-native";
import { colors } from "../../theme/colors";

export function CampaignEditModal({
  visible,
  campaign,
  onClose,
  onSave,
  isPending,
}) {
  const [form, setForm] = useState({});

  // Sync form when campaign changes
  const getForm = () => {
    if (!campaign) return {};
    return {
      title: campaign.title || "",
      brand_name: campaign.brand_name || "",
      reward_amount: String(campaign.reward_amount || ""),
      platform: campaign.platform || "Instagram",
      category: campaign.category || "Fashion",
      description: campaign.description || "",
      status: campaign.status || "active",
      featured: campaign.featured ? "true" : "false",
      trending: campaign.trending ? "true" : "false",
    };
  };

  const currentForm = Object.keys(form).length > 0 ? form : getForm();

  const updateField = (key, value) =>
    setForm((prev) => ({
      ...(Object.keys(prev).length > 0 ? prev : getForm()),
      [key]: value,
    }));

  const handleClose = () => {
    setForm({});
    onClose();
  };

  const handleSave = () => {
    onSave({
      id: campaign.id,
      title: currentForm.title,
      brand_name: currentForm.brand_name,
      reward_amount: parseFloat(currentForm.reward_amount) || 0,
      platform: currentForm.platform,
      category: currentForm.category,
      description: currentForm.description,
      status: currentForm.status,
      featured: currentForm.featured === "true",
      trending: currentForm.trending === "true",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
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
            ✏️ Edit Campaign
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <XCircle size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, gap: 14 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Text Fields */}
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
            <View key={field.key} style={{ marginBottom: 4 }}>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  fontFamily: "Inter_600SemiBold",
                  marginBottom: 6,
                  letterSpacing: 0.5,
                }}
              >
                {field.label.toUpperCase()}
              </Text>
              <TextInput
                value={currentForm[field.key] || ""}
                onChangeText={(v) => updateField(field.key, v)}
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

          {/* Status */}
          <View style={{ marginBottom: 4 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontFamily: "Inter_600SemiBold",
                marginBottom: 8,
                letterSpacing: 0.5,
              }}
            >
              STATUS
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {["active", "paused", "completed"].map((s) => {
                const statusColors = {
                  active: {
                    bg: "rgba(57,255,136,0.15)",
                    border: "#39FF88",
                    text: "#39FF88",
                  },
                  paused: {
                    bg: "rgba(255,181,71,0.15)",
                    border: "#FFB547",
                    text: "#FFB547",
                  },
                  completed: {
                    bg: "rgba(255,77,103,0.15)",
                    border: "#FF4D67",
                    text: "#FF4D67",
                  },
                };
                const isSelected = currentForm.status === s;
                const sc = statusColors[s];
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => updateField("status", s)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      alignItems: "center",
                      backgroundColor: isSelected ? sc.bg : colors.surface,
                      borderWidth: 1,
                      borderColor: isSelected ? sc.border : colors.cardBorder,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? sc.text : colors.textMuted,
                        fontSize: 12,
                        fontFamily: "Inter_600SemiBold",
                        textTransform: "capitalize",
                      }}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Featured & Trending */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 4 }}>
            {[
              { key: "featured", label: "⭐ Featured" },
              { key: "trending", label: "🔥 Trending" },
            ].map((toggle) => {
              const isOn = currentForm[toggle.key] === "true";
              return (
                <TouchableOpacity
                  key={toggle.key}
                  onPress={() =>
                    updateField(toggle.key, isOn ? "false" : "true")
                  }
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: isOn
                      ? "rgba(57,255,136,0.12)"
                      : colors.surface,
                    borderWidth: 1,
                    borderColor: isOn
                      ? "rgba(57,255,136,0.4)"
                      : colors.cardBorder,
                  }}
                >
                  <Text
                    style={{
                      color: isOn ? colors.primary : colors.textMuted,
                      fontSize: 13,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    {toggle.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={
              isPending || !currentForm.title || !currentForm.brand_name
            }
            style={{
              backgroundColor:
                !currentForm.title || !currentForm.brand_name
                  ? colors.surface
                  : colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              opacity: !currentForm.title || !currentForm.brand_name ? 0.5 : 1,
            }}
          >
            {isPending ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Edit3 size={18} color="#000" />
            )}
            <Text
              style={{
                color: "#000",
                fontSize: 16,
                fontFamily: "Inter_700Bold",
              }}
            >
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
