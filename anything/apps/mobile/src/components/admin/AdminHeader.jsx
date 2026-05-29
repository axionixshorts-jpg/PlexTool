import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "../../theme/colors";

export function AdminHeader({ onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: colors.background,
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ArrowLeft size={19} color={colors.textSecondary} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 18,
            fontFamily: "Inter_700Bold",
          }}
        >
          Admin Panel
        </Text>
        <Text
          style={{
            color: colors.primary,
            fontSize: 11,
            fontFamily: "Inter_500Medium",
          }}
        >
          ⚡ Super Admin
        </Text>
      </View>
      <View
        style={{
          backgroundColor: "rgba(57,255,136,0.12)",
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "rgba(57,255,136,0.25)",
        }}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: 11,
            fontFamily: "Inter_700Bold",
          }}
        >
          LIVE
        </Text>
      </View>
    </View>
  );
}
