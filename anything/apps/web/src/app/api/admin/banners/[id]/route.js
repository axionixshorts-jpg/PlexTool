import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized, logAdminAction } from "../../utils";

export async function PUT(request, { params }) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  const { id } = params;
  const body = await request.json();

  const allowed = [
    "title",
    "subtitle",
    "image_url",
    "link_url",
    "banner_type",
    "priority",
    "is_active",
    "starts_at",
    "ends_at",
  ];
  const sets = [];
  const vals = [];
  let p = 0;
  for (const key of allowed) {
    if (body[key] !== undefined) {
      p++;
      sets.push(`${key} = $${p}`);
      vals.push(body[key]);
    }
  }
  if (!sets.length)
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  p++;
  vals.push(id);
  const result = await sql(
    `UPDATE banners SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${p} RETURNING *`,
    vals,
  );
  await logAdminAction(
    admin.adminId,
    "UPDATE_BANNER",
    "banners",
    "banner",
    parseInt(id),
    body,
    request,
  );
  return Response.json({ banner: result[0] });
}

export async function DELETE(request, { params }) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  const { id } = params;
  await sql`DELETE FROM banners WHERE id = ${id}`;
  await logAdminAction(
    admin.adminId,
    "DELETE_BANNER",
    "banners",
    "banner",
    parseInt(id),
    {},
    request,
  );
  return Response.json({ success: true });
}
