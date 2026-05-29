import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized, logAdminAction } from "../utils";

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  const banners =
    await sql`SELECT * FROM banners ORDER BY priority ASC, created_at DESC`;
  return Response.json({ banners });
}

export async function POST(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  try {
    const {
      title,
      subtitle,
      image_url,
      link_url,
      banner_type,
      priority,
      is_active,
      starts_at,
      ends_at,
    } = await request.json();
    if (!title)
      return Response.json({ error: "Title required" }, { status: 400 });
    const result = await sql`
      INSERT INTO banners (title, subtitle, image_url, link_url, banner_type, priority, is_active, starts_at, ends_at)
      VALUES (${title}, ${subtitle}, ${image_url}, ${link_url}, ${banner_type || "promotional"}, ${priority || 0}, ${is_active !== false}, ${starts_at || null}, ${ends_at || null})
      RETURNING *
    `;
    await logAdminAction(
      admin.adminId,
      "CREATE_BANNER",
      "banners",
      "banner",
      result[0].id,
      { title },
      request,
    );
    return Response.json({ banner: result[0] });
  } catch (error) {
    return Response.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
