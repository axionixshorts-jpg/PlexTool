import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { colors } from "../../theme/colors";

export default function SkeletonLoader({
  width,
  height,
  borderRadius = 12,
  style,
}) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      shimmer.value,
      [0, 1],
      [colors.skeleton, colors.skeletonShine],
    ),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width || "100%",
          height: height || 20,
          borderRadius,
          overflow: "hidden",
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: 16,
          gap: 12,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonLoader height={14} width="60%" />
          <SkeletonLoader height={10} width="40%" />
        </View>
      </View>
      <SkeletonLoader height={12} width="90%" />
      <SkeletonLoader height={12} width="70%" />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        <SkeletonLoader width={80} height={28} borderRadius={14} />
        <SkeletonLoader width={60} height={28} borderRadius={14} />
      </View>
    </View>
  );
}
