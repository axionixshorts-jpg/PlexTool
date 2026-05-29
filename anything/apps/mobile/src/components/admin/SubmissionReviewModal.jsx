import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { Image } from "expo-image";
import { colors } from "../../theme/colors";
import { AdminCard } from "./AdminCard";

export function SubmissionReviewModal({
  visible,
  submission,
  reviewNote,
  setReviewNote,
  onClose,
  onReview,
  isPending,
}) {
  if (!submission) return null;

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
            Review Submission
          </Text>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, gap: 16 }}
        >
          <AdminCard>
            <View style={{ padding: 14, gap: 10 }}>
              {[
                ["Creator", submission.creator_name],
                ["Email", submission.creator_email],
                ["Campaign", submission.campaign_title],
                ["Brand", submission.brand_name],
                ["Platform", submission.platform],
                ["Reward", `$${submission.reward_amount}`],
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
                      color:
                        label === "Reward"
                          ? colors.primary
                          : colors.textPrimary,
                      fontSize: 13,
                      fontFamily:
                        label === "Reward"
                          ? "Inter_700Bold"
                          : "Inter_500Medium",
                      maxWidth: "60%",
                      textAlign: "right",
                    }}
                    numberOfLines={2}
                  >
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </AdminCard>

          {submission.screenshot_url && (
            <Image
              source={{ uri: submission.screenshot_url }}
              style={{ width: "100%", height: 200, borderRadius: 16 }}
              contentFit="cover"
            />
          )}

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
              REVIEWER NOTES
            </Text>
            <TextInput
              value={reviewNote}
              onChangeText={setReviewNote}
              placeholder="Optional feedback for creator..."
              placeholderTextColor={colors.textMuted}
              multiline
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderRadius: 14,
                padding: 14,
                color: colors.textPrimary,
                fontSize: 14,
                minHeight: 80,
                textAlignVertical: "top",
              }}
            />
          </View>
        </ScrollView>
        <View style={{ padding: 20, flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => onReview("rejected")}
            disabled={isPending}
            style={{
              flex: 1,
              backgroundColor: "rgba(255,77,103,0.12)",
              borderRadius: 16,
              paddingVertical: 15,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,77,103,0.3)",
            }}
          >
            <Text
              style={{
                color: "#FF4D67",
                fontSize: 15,
                fontFamily: "Inter_700Bold",
              }}
            >
              ✗ Reject
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onReview("approved")}
            disabled={isPending}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingVertical: 15,
              alignItems: "center",
            }}
          >
            {isPending ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text
                style={{
                  color: "#000",
                  fontSize: 15,
                  fontFamily: "Inter_700Bold",
                }}
              >
                ✓ Approve
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
