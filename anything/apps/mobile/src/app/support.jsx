import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  FileText,
  AlertTriangle,
  HelpCircle,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import PrimaryButton from "../components/ui/PrimaryButton";
import SecondaryButton from "../components/ui/SecondaryButton";
import Input from "../components/ui/Input";
import KeyboardAvoidingAnimatedView from "../components/KeyboardAvoidingAnimatedView";

const faqs = [
  {
    question: "How do I earn money?",
    answer:
      "Join brand campaigns, create content, submit your links, and earn once your submission is approved. Rewards vary by campaign.",
  },
  {
    question: "How long does approval take?",
    answer:
      "Most submissions are reviewed within 24-48 hours. You'll receive a notification once your submission is approved or needs revision.",
  },
  {
    question: "What are the minimum withdrawal requirements?",
    answer:
      "The minimum withdrawal amount is $10. You can withdraw to UPI, bank transfer, or PayPal.",
  },
  {
    question: "How does the referral program work?",
    answer:
      "Share your unique referral code with friends. You earn $5 for each friend who signs up and completes their first campaign.",
  },
  {
    question: "Can I join multiple campaigns?",
    answer:
      "Yes! You can join as many active campaigns as you want, as long as you meet the requirements for each one.",
  },
  {
    question: "What happens if my submission is rejected?",
    answer:
      "You'll receive feedback on why it was rejected. You can make changes and resubmit for the same campaign if the deadline hasn't passed.",
  },
];

function FAQItem({ faq, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 50)}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              flex: 1,
              marginRight: 12,
            }}
          >
            {faq.question}
          </Text>
          {expanded ? (
            <ChevronUp size={18} color={colors.textMuted} />
          ) : (
            <ChevronDown size={18} color={colors.textMuted} />
          )}
        </View>
        {expanded && (
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 16,
              borderTopWidth: 1,
              borderTopColor: colors.divider,
              paddingTop: 12,
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontFamily: "Inter_400Regular",
                lineHeight: 20,
              }}
            >
              {faq.answer}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticket, setTicket] = useState({ subject: "", description: "" });

  const handleSubmitTicket = () => {
    if (!ticket.subject.trim() || !ticket.description.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    Alert.alert(
      "Ticket Submitted",
      "Our team will get back to you within 24 hours.",
    );
    setShowTicketForm(false);
    setTicket({ subject: "", description: "" });
  };

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
              Help & Support
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 20 }}>
          {/* Quick Actions */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={{ flexDirection: "row", gap: 10 }}
          >
            <TouchableOpacity
              onPress={() => setShowTicketForm(true)}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                padding: 16,
                alignItems: "center",
                gap: 8,
              }}
            >
              <MessageCircle size={24} color={colors.primary} />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 13,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Contact Us
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                padding: 16,
                alignItems: "center",
                gap: 8,
              }}
            >
              <Mail size={24} color={colors.secondary} />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 13,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Email Us
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                padding: 16,
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertTriangle size={24} color={colors.warning} />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 13,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Report
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Ticket Form */}
          {showTicketForm && (
            <Animated.View
              entering={FadeInDown}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                padding: 16,
                gap: 14,
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Submit a Ticket
              </Text>
              <Input
                label="Subject"
                placeholder="Brief description of your issue"
                value={ticket.subject}
                onChangeText={(t) => setTicket({ ...ticket, subject: t })}
              />
              <Input
                label="Description"
                placeholder="Describe your issue in detail..."
                value={ticket.description}
                onChangeText={(t) => setTicket({ ...ticket, description: t })}
                multiline
                numberOfLines={4}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <SecondaryButton
                    title="Cancel"
                    onPress={() => setShowTicketForm(false)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <PrimaryButton title="Submit" onPress={handleSubmitTicket} />
                </View>
              </View>
            </Animated.View>
          )}

          {/* FAQ */}
          <View>
            <Animated.View
              entering={FadeInDown.delay(150)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <HelpCircle size={20} color={colors.textPrimary} />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Frequently Asked Questions
              </Text>
            </Animated.View>
            <View style={{ gap: 10 }}>
              {faqs.map((faq, i) => (
                <FAQItem key={i} faq={faq} index={i} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
