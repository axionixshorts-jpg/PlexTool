import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Link2,
  Camera,
  FileText,
  Send,
  CheckCircle2,
} from "lucide-react-native";
import { api } from "../utils/api";
import useUpload from "../utils/useUpload";
import { colors } from "../theme/colors";
import PrimaryButton from "../components/ui/PrimaryButton";
import Input from "../components/ui/Input";
import KeyboardAvoidingAnimatedView from "../components/KeyboardAvoidingAnimatedView";

const platforms = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Twitch",
  "Twitter",
  "Other",
];

export default function SubmitContent() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { campaignId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [upload, { loading: uploading }] = useUpload();

  const [form, setForm] = useState({
    content_link: "",
    platform: "",
    notes: "",
  });
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: (data) => api.submitContent(data),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setSubmitted(true);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setScreenshot(result.assets[0]);
      const { url, error } = await upload({
        reactNativeAsset: result.assets[0],
      });
      if (error) {
        Alert.alert("Upload Error", error);
        return;
      }
      setScreenshotUrl(url);
    }
  }, [upload]);

  const validate = () => {
    const newErrors = {};
    if (!form.content_link.trim())
      newErrors.content_link = "Content link is required";
    if (!form.platform) newErrors.platform = "Select a platform";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    submitMutation.mutate({
      campaign_id: parseInt(campaignId),
      content_link: form.content_link,
      platform: form.platform,
      screenshot_url: screenshotUrl || "",
      notes: form.notes,
    });
  };

  if (submitted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        <StatusBar style="light" />
        <Animated.View
          entering={FadeInDown.springify()}
          style={{ alignItems: "center" }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.successDim,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <CheckCircle2 size={40} color={colors.success} />
          </View>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 24,
              fontFamily: "Inter_700Bold",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Submitted! 🎉
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 15,
              fontFamily: "Inter_400Regular",
              textAlign: "center",
              marginBottom: 32,
              lineHeight: 22,
            }}
          >
            Your content has been submitted for review. You'll be notified once
            it's approved.
          </Text>
          <PrimaryButton
            title="View Activity"
            onPress={() => router.replace("/(tabs)/activity")}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ArrowLeft size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 20,
                fontFamily: "Inter_700Bold",
              }}
            >
              Submit Content
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 20 }}>
          {/* Content Link */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <Input
              label="Content Link"
              placeholder="https://instagram.com/p/..."
              value={form.content_link}
              onChangeText={(t) => setForm({ ...form, content_link: t })}
              error={errors.content_link}
              icon={<Link2 size={18} color={colors.textMuted} />}
              keyboardType="url"
            />
          </Animated.View>

          {/* Platform */}
          <Animated.View entering={FadeInDown.delay(150)}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontFamily: "Inter_500Medium",
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              Platform
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {platforms.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setForm({ ...form, platform: p });
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor:
                      form.platform === p ? colors.primaryDim : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      form.platform === p ? colors.primary : colors.cardBorder,
                  }}
                >
                  <Text
                    style={{
                      color:
                        form.platform === p
                          ? colors.primary
                          : colors.textSecondary,
                      fontSize: 13,
                      fontFamily: "Inter_500Medium",
                    }}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.platform && (
              <Text
                style={{
                  color: colors.error,
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  marginTop: 6,
                  marginLeft: 4,
                }}
              >
                {errors.platform}
              </Text>
            )}
          </Animated.View>

          {/* Screenshot */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontFamily: "Inter_500Medium",
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              Screenshot Proof (Optional)
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.8}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderStyle: "dashed",
                padding: screenshot ? 0 : 32,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {screenshot ? (
                <Image
                  source={{ uri: screenshot.uri }}
                  style={{ width: "100%", height: 200 }}
                  contentFit="cover"
                />
              ) : (
                <View style={{ alignItems: "center", gap: 8 }}>
                  <Camera size={32} color={colors.textMuted} />
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                    }}
                  >
                    {uploading ? "Uploading..." : "Tap to upload screenshot"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Notes */}
          <Animated.View entering={FadeInDown.delay(250)}>
            <Input
              label="Notes (Optional)"
              placeholder="Any additional info for the reviewer..."
              value={form.notes}
              onChangeText={(t) => setForm({ ...form, notes: t })}
              multiline
              numberOfLines={4}
              icon={<FileText size={18} color={colors.textMuted} />}
            />
          </Animated.View>

          {/* Submit */}
          <Animated.View
            entering={FadeInDown.delay(300)}
            style={{ marginTop: 8 }}
          >
            <PrimaryButton
              title="Submit for Review"
              onPress={handleSubmit}
              loading={submitMutation.isPending}
              icon={<Send size={16} color="#000" />}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
