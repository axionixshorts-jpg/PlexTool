import { Redirect } from "expo-router";
import useAuthStore from "../store/authStore";

export default function Index() {
  const { isAuthenticated, hasOnboarded, user } = useAuthStore();

  if (!hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  if (user && !user.onboarded) {
    return <Redirect href="/role-select" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
