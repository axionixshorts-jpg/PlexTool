import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors } from "../../theme/colors";
import { radii, spacing } from "../../theme/spacing";

export default function Card({
  children,
  style,
  delay = 0,
  animated = true,
  onPress,
}) {
  const cardStyle = {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    ...style,
  };

  if (animated) {
    return (
      <Animated.View
        entering={FadeInDown.delay(delay).duration(400).springify()}
        style={cardStyle}
      >
        {children}
      </Animated.View>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
