import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  hasOnboarded: false,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      const userData = await SecureStore.getItemAsync("user_data");
      const onboarded = await SecureStore.getItemAsync("has_onboarded");

      if (token && userData) {
        const user = JSON.parse(userData);
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          hasOnboarded: onboarded === "true",
        });
      } else {
        set({
          isLoading: false,
          hasOnboarded: onboarded === "true",
        });
      }
    } catch (error) {
      console.error("Auth init error:", error);
      set({ isLoading: false });
    }
  },

  login: async (token, user) => {
    try {
      await SecureStore.setItemAsync("auth_token", token);
      await SecureStore.setItemAsync("user_data", JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    } catch (error) {
      console.error("Login store error:", error);
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync("auth_token");
      await SecureStore.deleteItemAsync("user_data");
      set({ token: null, user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Logout store error:", error);
    }
  },

  updateUser: async (userData) => {
    try {
      const updatedUser = { ...get().user, ...userData };
      await SecureStore.setItemAsync("user_data", JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error("Update user error:", error);
    }
  },

  completeOnboarding: async () => {
    try {
      await SecureStore.setItemAsync("has_onboarded", "true");
      set({ hasOnboarded: true });
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  },
}));

export default useAuthStore;
