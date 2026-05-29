import * as SecureStore from "expo-secure-store";

const getToken = async () => {
  try {
    return await SecureStore.getItemAsync("auth_token");
  } catch {
    return null;
  }
};

export async function apiRequest(endpoint, options = {}) {
  const token = await getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data) =>
    apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMe: () => apiRequest("/api/auth/me"),

  // Campaigns
  getCampaigns: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/campaigns?${query}`);
  },
  getCampaign: (id) => apiRequest(`/api/campaigns/${id}`),
  joinCampaign: (id) =>
    apiRequest(`/api/campaigns/${id}/join`, { method: "POST" }),

  // Submissions
  getSubmissions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/submissions?${query}`);
  },
  submitContent: (data) =>
    apiRequest("/api/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Wallet
  getWallet: () => apiRequest("/api/wallet"),
  withdraw: (data) =>
    apiRequest("/api/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: () => apiRequest("/api/notifications"),
  markNotificationsRead: () =>
    apiRequest("/api/notifications", { method: "PUT" }),

  // Profile
  getProfile: () => apiRequest("/api/profile"),
  updateProfile: (data) =>
    apiRequest("/api/profile", { method: "PUT", body: JSON.stringify(data) }),
};
