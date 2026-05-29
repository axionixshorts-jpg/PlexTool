import { View, Text } from "react-native";
import { colors } from "../../theme/colors";
import { radii, spacing } from "../../theme/spacing";

const statusConfig = {
  active: { bg: colors.successDim, text: colors.success, dot: colors.success },
  pending: { bg: colors.warningDim, text: colors.warning, dot: colors.warning },
  approved: {
    bg: colors.successDim,
    text: colors.success,
    dot: colors.success,
  },
  rejected: { bg: colors.errorDim, text: colors.error, dot: colors.error },
  completed: {
    bg: colors.primaryDim,
    text: colors.primary,
    dot: colors.primary,
  },
  joined: {
    bg: colors.secondaryDim,
    text: colors.secondary,
    dot: colors.secondary,
  },
  processing: {
    bg: colors.warningDim,
    text: colors.warning,
    dot: colors.warning,
  },
  paid: { bg: colors.successDim, text: colors.success, dot: colors.success },
  failed: { bg: colors.errorDim, text: colors.error, dot: colors.error },
};

export default function StatusBadge({ status, label }) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const displayLabel = label || status;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: config.bg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radii.full,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: config.dot,
        }}
      />
      <Text
        style={{
          color: config.text,
          fontSize: 11,
          fontFamily: "Inter_600SemiBold",
          textTransform: "capitalize",
        }}
      >
        {displayLabel}
      </Text>
    </View>
  );
}
