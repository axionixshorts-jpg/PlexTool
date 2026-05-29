import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  LayoutDashboard,
  Megaphone,
  FileCheck,
  Users,
  Wallet,
  Image as ImageIcon,
} from "lucide-react-native";
import { colors } from "../../theme/colors";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "submissions", label: "Submissions", icon: FileCheck },
  { id: "users", label: "Users", icon: Users },
  { id: "withdrawals", label: "Payouts", icon: Wallet },
  { id: "banners", label: "Banners", icon: ImageIcon },
];

export function AdminTabBar({ activeTab, onTabChange }) {
  return (
    <View
      style={{ borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: isActive
                  ? "rgba(57,255,136,0.12)"
                  : colors.surface,
                borderWidth: 1,
                borderColor: isActive
                  ? "rgba(57,255,136,0.4)"
                  : colors.cardBorder,
              }}
            >
              <tab.icon
                size={14}
                color={isActive ? colors.primary : colors.textMuted}
              />
              <Text
                style={{
                  color: isActive ? colors.primary : colors.textMuted,
                  fontSize: 13,
                  fontFamily: isActive ? "Inter_700Bold" : "Inter_500Medium",
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
