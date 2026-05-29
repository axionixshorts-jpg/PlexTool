import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Mail, Lock, User, ArrowLeft } from "lucide-react-native";
import useAuthStore from "../store/authStore";
import { api } from "../utils/api";
import { colors } from "../theme/colors";
import PrimaryButton from "../components/ui/PrimaryButton";
import Input from "../components/ui/Input";
import KeyboardAvoidingAnimatedView from "../components/KeyboardAvoidingAnimatedView";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login: storeLogin } = useAuthStore();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (isSignup && !form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Min 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = isSignup
        ? await api.register({
            name: form.name,
            email: form.email,
            password: form.password,
          })
        : await api.login({ email: form.email, password: form.password });

      await storeLogin(data.token, data.user);

      if (data.user.onboarded) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/role-select");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [form, isSignup]);

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={{ marginBottom: 40, marginTop: 40 }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            CREATORHUB
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 32,
              fontFamily: "Inter_700Bold",
              letterSpacing: -0.5,
              marginBottom: 8,
            }}
          >
            {isSignup ? "Create Account" : "Welcome Back"}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              lineHeight: 24,
            }}
          >
            {isSignup
              ? "Start earning from your content today"
              : "Sign in to continue to your dashboard"}
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200)} style={{ gap: 16 }}>
          {isSignup && (
            <Input
              label="Full Name"
              placeholder="Your name"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              error={errors.name}
              icon={<User size={18} color={colors.textMuted} />}
              autoCapitalize="words"
            />
          )}

          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            error={errors.email}
            keyboardType="email-address"
            icon={<Mail size={18} color={colors.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="Min 6 characters"
            value={form.password}
            onChangeText={(t) => setForm({ ...form, password: t })}
            error={errors.password}
            secureTextEntry
            icon={<Lock size={18} color={colors.textMuted} />}
          />
        </Animated.View>

        {/* Submit */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={{ marginTop: 32 }}
        >
          <PrimaryButton
            title={isSignup ? "Create Account" : "Sign In"}
            onPress={handleSubmit}
            loading={loading}
          />
        </Animated.View>

        {/* Toggle */}
        <Animated.View
          entering={FadeInDown.delay(400)}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 24,
            gap: 4,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              fontFamily: "Inter_400Regular",
            }}
          >
            {isSignup ? "Already have an account?" : "Don't have an account?"}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsSignup(!isSignup);
              setErrors({});
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
