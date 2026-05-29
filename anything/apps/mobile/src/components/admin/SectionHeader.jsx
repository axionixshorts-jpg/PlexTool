import { View, Text, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import { colors } from "../../theme/colors";

export function SectionHeader({ title, count, action, onAction }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontFamily: "Inter_700Bold",
          }}
        >
          {title}
        </Text>
        {count !== undefined && (
          <View
            style={{
              backgroundColor: colors.primaryDim,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: 11,
                fontFamily: "Inter_700Bold",
              }}
            >
              {count}
            </Text>
          </View>
        )}
      </View>
      {action && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: colors.primaryDim,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
          }}
        >
          <Plus size={14} color={colors.primary} />
          <Text
            style={{
              color: colors.primary,
              fontSize: 12,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {action}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
