import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized, logAdminAction } from "../utils";

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  const settings = await sql`SELECT * FROM system_settings ORDER BY key ASC`;
  const map = {};
  for (const s of settings)
    map[s.key] = { value: s.value, description: s.description, id: s.id };
  return Response.json({ settings: map, raw: settings });
}

export async function PUT(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  try {
    const { updates } = await request.json(); // { key: value, ... }
    for (const [key, value] of Object.entries(updates)) {
      await sql`
        INSERT INTO system_settings (key, value, updated_at) VALUES (${key}, ${String(value)}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = ${String(value)}, updated_at = NOW()
      `;
    }
    await logAdminAction(
      admin.adminId,
      "UPDATE_SETTINGS",
      "settings",
      null,
      null,
      updates,
      request,
    );
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
