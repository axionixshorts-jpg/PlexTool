import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Palette, Building2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import useAuthStore from "../store/authStore";
import { api } from "../utils/api";
import { colors, gradients } from "../theme/colors";
import PrimaryButton from "../components/ui/PrimaryButton";

function RoleCard({
  icon: Icon,
  title,
  description,
  selected,
  onPress,
  gradient,
  delay,
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          scale.value = withSpring(0.97, {}, () => {
            scale.value = withSpring(1);
          });
          onPress();
        }}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              backgroundColor: colors.surface,
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: selected ? colors.primary : colors.cardBorder,
              padding: 24,
              gap: 16,
            },
          ]}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={gradient}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                opacity: 0.15,
              }}
            />
            <Icon size={28} color={gradient[0]} />
          </View>

          <View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 20,
                fontFamily: "Inter_700Bold",
                marginBottom: 6,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                lineHeight: 22,
              }}
            >
              {description}
            </Text>
          </View>

          {selected && (
            <View
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#000",
                  fontSize: 14,
                  fontFamily: "Inter_700Bold",
                }}
              >
                ✓
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RoleSelect() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.updateProfile({ role: selected, onboarded: true });
      await updateUser({ role: selected, onboarded: true });
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + 24,
        paddingHorizontal: 24,
      }}
    >
      <StatusBar style="light" />

      <Animated.View
        entering={FadeInDown.delay(100)}
        style={{ marginBottom: 32 }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 28,
            fontFamily: "Inter_700Bold",
            letterSpacing: -0.5,
            marginBottom: 8,
          }}
        >
          Choose Your Role
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 16,
            fontFamily: "Inter_400Regular",
          }}
        >
          How will you use CreatorHub?
        </Text>
      </Animated.View>

      <View style={{ gap: 16, flex: 1 }}>
        <RoleCard
          icon={Palette}
          title="Creator"
          description="Join campaigns, create content, and earn money from brands you love."
          selected={selected === "creator"}
          onPress={() => setSelected("creator")}
          gradient={gradients.primary}
          delay={200}
        />
        <RoleCard
          icon={Building2}
          title="Brand"
          description="Launch campaigns, discover creators, and grow your brand reach."
          selected={selected === "brand"}
          onPress={() => setSelected("brand")}
          gradient={["#00D1FF", "#7C3AED"]}
          delay={300}
        />
      </View>

      <View style={{ paddingBottom: insets.bottom + 24 }}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={!selected}
        />
      </View>
    </View>
  );
}
