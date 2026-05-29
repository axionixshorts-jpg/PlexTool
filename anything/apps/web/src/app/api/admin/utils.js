import sql from "@/app/api/utils/sql";

const MOBILE_ADMIN_SECRET =
  process.env.ADMIN_JWT_SECRET || "creatorhub-admin-2024";

export function verifyAdminToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    if (payload.role !== "superadmin") return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAdminFromRequest(request) {
  // 1. Mobile app access via admin secret header
  const secret = request.headers.get("x-admin-secret");
  if (secret && secret === MOBILE_ADMIN_SECRET) {
    return { adminId: 1, role: "superadmin", mobile: true };
  }
  // 2. Web admin via JWT Bearer token
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyAdminToken(auth.slice(7));
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function logAdminAction(
  adminId,
  action,
  module,
  targetType = null,
  targetId = null,
  details = {},
  request = null,
) {
  try {
    const ip = request?.headers?.get("x-forwarded-for") || "unknown";
    await sql`
      INSERT INTO admin_logs (admin_id, action, module, target_type, target_id, details, ip_address)
      VALUES (${adminId}, ${action}, ${module}, ${targetType}, ${targetId}, ${JSON.stringify(details)}::jsonb, ${ip})
    `;
  } catch (e) {
    console.error("Failed to log admin action:", e);
  }
}
