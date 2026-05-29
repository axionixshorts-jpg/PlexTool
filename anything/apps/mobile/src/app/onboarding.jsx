import { useState, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Zap, Target, Link2, Banknote } from "lucide-react-native";
import useAuthStore from "../store/authStore";
import { colors, gradients } from "../theme/colors";
import PrimaryButton from "../components/ui/PrimaryButton";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    icon: Zap,
    title: "Earn From Your Content",
    subtitle:
      "Turn your creativity into income. Join campaigns from top brands and get paid for what you love.",
    gradient: ["#39FF88", "#00D1FF"],
  },
  {
    id: "2",
    icon: Target,
    title: "Join Brand Campaigns",
    subtitle:
      "Browse campaigns across categories. Find the perfect match for your audience and niche.",
    gradient: ["#00D1FF", "#7C3AED"],
  },
  {
    id: "3",
    icon: Link2,
    title: "Submit Your Links",
    subtitle:
      "Share your content link, upload proof, and submit. Quick and simple process.",
    gradient: ["#7C3AED", "#FF4D67"],
  },
  {
    id: "4",
    icon: Banknote,
    title: "Get Paid Fast",
    subtitle:
      "Track approvals in real-time. Withdraw earnings to your preferred payment method.",
    gradient: ["#FFB547", "#39FF88"],
  },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace("/auth");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item, index }) => {
    const IconComponent = item.icon;
    return (
      <View
        style={{
          width,
          flex: 1,
          paddingHorizontal: 32,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <LinearGradient
            colors={item.gradient}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              justifyContent: "center",
              alignItems: "center",
              opacity: 0.15,
              position: "absolute",
            }}
          />
          <IconComponent size={48} color={item.gradient[0]} />
        </Animated.View>

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 28,
            fontFamily: "Inter_700Bold",
            textAlign: "center",
            marginBottom: 16,
            letterSpacing: -0.5,
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            textAlign: "center",
            lineHeight: 24,
            paddingHorizontal: 8,
          }}
        >
          {item.subtitle}
        </Text>
      </View>
    );
  };

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      {/* Skip button */}
      <Animated.View
        entering={FadeInUp.delay(300)}
        style={{
          position: "absolute",
          top: insets.top + 12,
          right: 20,
          zIndex: 10,
        }}
      >
        <TouchableOpacity onPress={handleSkip} style={{ padding: 8 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 15,
              fontFamily: "Inter_500Medium",
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        style={{ flex: 1 }}
      />

      {/* Bottom section */}
      <View
        style={{ paddingHorizontal: 32, paddingBottom: insets.bottom + 24 }}
      >
        {/* Dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            marginBottom: 32,
          }}
        >
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === currentIndex ? 28 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i === currentIndex ? colors.primary : colors.surfaceLight,
              }}
            />
          ))}
        </View>

        <PrimaryButton
          title={isLast ? "Get Started" : "Continue"}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}
