import { View } from "react-native";
import { colors } from "../../theme/colors";

export function AdminCard({ children, style }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </View>
  );
}
