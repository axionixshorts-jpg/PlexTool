import { useState } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import useAuthStore from "../store/authStore";
import { ADMIN_EMAIL } from "../constants/admin";
import { AccessDenied } from "../components/admin/AccessDenied";
import { AdminHeader } from "../components/admin/AdminHeader";
import { AdminTabBar } from "../components/admin/AdminTabBar";
import { DashboardSection } from "../components/admin/DashboardSection";
import { CampaignsSection } from "../components/admin/CampaignsSection";
import { SubmissionsSection } from "../components/admin/SubmissionsSection";
import { UsersSection } from "../components/admin/UsersSection";
import { WithdrawalsSection } from "../components/admin/WithdrawalsSection";
import { BannersSection } from "../components/admin/BannersSection";

export default function AdminPanelScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (user?.email !== ADMIN_EMAIL) {
    return <AccessDenied onGoBack={() => router.back()} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <AdminHeader onBack={() => router.back()} />

      <AdminTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 30,
        }}
        showsVerticalScrollIndicator={false}
        key={activeTab}
      >
        {activeTab === "dashboard" && <DashboardSection />}
        {activeTab === "campaigns" && <CampaignsSection />}
        {activeTab === "submissions" && <SubmissionsSection />}
        {activeTab === "users" && <UsersSection />}
        {activeTab === "withdrawals" && <WithdrawalsSection />}
        {activeTab === "banners" && <BannersSection />}
      </ScrollView>
    </View>
  );
}
