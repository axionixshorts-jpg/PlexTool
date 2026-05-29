import { View, Text } from "react-native";
import { colors } from "../../theme/colors";

export function StatusPill({ status }) {
  const cfg = {
    pending: { bg: "rgba(255,181,71,0.15)", text: "#FFB547" },
    approved: { bg: "rgba(57,255,136,0.15)", text: "#39FF88" },
    rejected: { bg: "rgba(255,77,103,0.15)", text: "#FF4D67" },
    active: { bg: "rgba(57,255,136,0.15)", text: "#39FF88" },
    paused: { bg: "rgba(255,181,71,0.15)", text: "#FFB547" },
    paid: { bg: "rgba(57,255,136,0.15)", text: "#39FF88" },
    processing: { bg: "rgba(0,209,255,0.15)", text: "#00D1FF" },
  };
  const c = cfg[status] || {
    bg: "rgba(255,255,255,0.08)",
    text: colors.textSecondary,
  };
  return (
    <View
      style={{
        backgroundColor: c.bg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
      }}
    >
      <Text
        style={{
          color: c.text,
          fontSize: 11,
          fontFamily: "Inter_600SemiBold",
          textTransform: "capitalize",
        }}
      >
        {status}
      </Text>
    </View>
  );
}
