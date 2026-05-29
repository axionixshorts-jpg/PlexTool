import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors } from "../../theme/colors";

export function StatCard({
  label,
  value,
  color = colors.primary,
  icon: Icon,
  delay = 0,
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: `${color}22`,
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: `${color}18`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon size={17} color={color} />
      </View>
      <Text
        style={{
          color,
          fontSize: 22,
          fontFamily: "Inter_700Bold",
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontFamily: "Inter_500Medium",
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}
