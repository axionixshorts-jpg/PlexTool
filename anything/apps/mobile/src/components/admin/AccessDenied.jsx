import { View, Text, TouchableOpacity } from "react-native";
import { ShieldAlert } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../theme/colors";

export function AccessDenied({ onGoBack }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
      }}
    >
      <StatusBar style="light" />
      <ShieldAlert size={48} color="#FF4D67" />
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 20,
          fontFamily: "Inter_700Bold",
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        Access Denied
      </Text>
      <Text
        style={{ color: colors.textMuted, fontSize: 14, textAlign: "center" }}
      >
        This area is restricted to administrators only.
      </Text>
      <TouchableOpacity
        onPress={onGoBack}
        style={{
          marginTop: 24,
          backgroundColor: colors.surface,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 14,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: "Inter_600SemiBold",
          }}
        >
          Go Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}
