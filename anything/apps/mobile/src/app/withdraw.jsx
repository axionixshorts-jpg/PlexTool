import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Globe,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";
import { api } from "../utils/api";
import { colors } from "../theme/colors";
import PrimaryButton from "../components/ui/PrimaryButton";
import Input from "../components/ui/Input";
import KeyboardAvoidingAnimatedView from "../components/KeyboardAvoidingAnimatedView";

const methods = [
  {
    id: "upi",
    label: "UPI",
    icon: Smartphone,
    description: "Instant transfer",
  },
  {
    id: "bank",
    label: "Bank Transfer",
    icon: CreditCard,
    description: "1-3 business days",
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: Globe,
    description: "1-2 business days",
  },
];

export default function WithdrawScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [errors, setErrors] = useState({});

  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: api.getWallet,
  });

  const balance = walletData?.wallet
    ? parseFloat(walletData.wallet.balance)
    : 0;

  const withdrawMutation = useMutation({
    mutationFn: (data) => api.withdraw(data),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      setShowConfirm(false);
      Alert.alert(
        "Withdrawal Requested! 🎉",
        "Your funds are being processed.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const validate = () => {
    const newErrors = {};
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0)
      newErrors.amount = "Enter a valid amount";
    else if (numAmount > balance) newErrors.amount = "Insufficient balance";
    else if (numAmount < 10) newErrors.amount = "Minimum withdrawal is $10";
    if (!selectedMethod) newErrors.method = "Select a payment method";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWithdraw = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const confirmWithdraw = () => {
    withdrawMutation.mutate({
      amount: parseFloat(amount),
      method: selectedMethod,
    });
  };

  const presetAmounts = [25, 50, 100, 250];

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
              Withdraw Funds
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 24 }}>
          {/* Balance */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontFamily: "Inter_500Medium",
                marginBottom: 4,
              }}
            >
              Available Balance
            </Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 36,
                fontFamily: "Inter_700Bold",
                letterSpacing: -1,
              }}
            >
              ${balance.toFixed(2)}
            </Text>
          </Animated.View>

          {/* Amount */}
          <Animated.View entering={FadeInDown.delay(150)}>
            <Input
              label="Withdrawal Amount"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              error={errors.amount}
              keyboardType="numeric"
              icon={
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 18,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  $
                </Text>
              }
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              {presetAmounts.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAmount(preset.toString());
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor:
                      amount === preset.toString()
                        ? colors.primaryDim
                        : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      amount === preset.toString()
                        ? colors.primary
                        : colors.cardBorder,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color:
                        amount === preset.toString()
                          ? colors.primary
                          : colors.textSecondary,
                      fontSize: 13,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    ${preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Payment Methods */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontFamily: "Inter_500Medium",
                marginBottom: 10,
                marginLeft: 4,
              }}
            >
              Payment Method
            </Text>
            <View style={{ gap: 10 }}>
              {methods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedMethod(method.id);
                  }}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    padding: 16,
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor:
                      selectedMethod === method.id
                        ? colors.primary
                        : colors.cardBorder,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor:
                        selectedMethod === method.id
                          ? colors.primaryDim
                          : colors.surfaceLight,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <method.icon
                      size={20}
                      color={
                        selectedMethod === method.id
                          ? colors.primary
                          : colors.textSecondary
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 15,
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      {method.label}
                    </Text>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                      }}
                    >
                      {method.description}
                    </Text>
                  </View>
                  {selectedMethod === method.id && (
                    <CheckCircle2 size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {errors.method && (
              <Text
                style={{
                  color: colors.error,
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  marginTop: 6,
                  marginLeft: 4,
                }}
              >
                {errors.method}
              </Text>
            )}
          </Animated.View>

          {/* Withdraw Button */}
          <Animated.View entering={FadeInDown.delay(250)}>
            <PrimaryButton title="Withdraw" onPress={handleWithdraw} />
          </Animated.View>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
          onPress={() => setShowConfirm(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: insets.bottom + 24,
              alignItems: "center",
              gap: 16,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.textMuted,
                marginBottom: 4,
              }}
            />
            <AlertCircle size={40} color={colors.warning} />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 18,
                fontFamily: "Inter_700Bold",
              }}
            >
              Confirm Withdrawal
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                textAlign: "center",
              }}
            >
              Withdraw ${parseFloat(amount || 0).toFixed(2)} via{" "}
              {methods.find((m) => m.id === selectedMethod)?.label || ""}?
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                width: "100%",
                marginTop: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() => setShowConfirm(false)}
                  style={{
                    height: 54,
                    borderRadius: 999,
                    backgroundColor: colors.surfaceLight,
                    borderWidth: 1,
                    borderColor: colors.cardBorderLight,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 16,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  title="Confirm"
                  onPress={confirmWithdraw}
                  loading={withdrawMutation.isPending}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingAnimatedView>
  );
}
