import { useState, useRef } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Eye, EyeOff } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radii, spacing } from "../../theme/spacing";

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
  keyboardType,
  autoCapitalize,
  multiline,
  numberOfLines,
  icon,
  style,
  editable = true,
  onFocus: externalOnFocus,
  onBlur: externalOnBlur,
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderColor = useSharedValue(0);

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor:
      borderColor.value === 1
        ? colors.inputFocusBorder
        : error
          ? colors.error
          : colors.inputBorder,
  }));

  const handleFocus = () => {
    setFocused(true);
    borderColor.value = withTiming(1, { duration: 200 });
    if (externalOnFocus) externalOnFocus();
  };

  const handleBlur = () => {
    setFocused(false);
    borderColor.value = withTiming(0, { duration: 200 });
    if (externalOnBlur) externalOnBlur();
  };

  return (
    <View style={[{ gap: 6 }, style]}>
      {label && (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            fontFamily: "Inter_500Medium",
            marginLeft: 4,
          }}
        >
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          {
            backgroundColor: colors.inputBg,
            borderRadius: radii.lg,
            borderWidth: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            minHeight: multiline ? 100 : 52,
          },
          animatedBorder,
        ]}
      >
        {icon && <View style={{ marginRight: 10 }}>{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || "none"}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            flex: 1,
            color: colors.textPrimary,
            fontSize: 15,
            fontFamily: "Inter_400Regular",
            paddingVertical: multiline ? 14 : 0,
            textAlignVertical: multiline ? "top" : "center",
          }}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color={colors.textMuted} />
            ) : (
              <Eye size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <Text
          style={{
            color: colors.error,
            fontSize: 12,
            fontFamily: "Inter_400Regular",
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
