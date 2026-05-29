export const adminFetch = async (path, opts = {}) => {
  const base = process.env.EXPO_PUBLIC_PROXY_BASE_URL || "";
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret":
        process.env.EXPO_PUBLIC_ADMIN_SECRET || "creatorhub-admin-2024",
      ...(opts.headers || {}),
    },
  });
  return res.json();
};
