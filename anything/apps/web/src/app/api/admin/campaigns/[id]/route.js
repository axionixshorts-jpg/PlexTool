import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized, logAdminAction } from "../../utils";

export async function PUT(request, { params }) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  const { id } = params;

  try {
    const body = await request.json();
    const fields = [];
    const values = [];
    let p = 0;

    const allowed = [
      "title",
      "description",
      "brand_name",
      "brand_logo",
      "reward_amount",
      "platform",
      "category",
      "deadline",
      "rules",
      "requirements",
      "example_content",
      "hero_image",
      "status",
      "featured",
      "trending",
      "max_participants",
    ];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        p++;
        fields.push(`${key} = $${p}`);
        values.push(body[key]);
      }
    }

    if (!fields.length)
      return Response.json({ error: "No fields to update" }, { status: 400 });

    p++;
    values.push(id);
    const result = await sql(
      `UPDATE campaigns SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${p} RETURNING *`,
      values,
    );

    await logAdminAction(
      admin.adminId,
      "UPDATE_CAMPAIGN",
      "campaigns",
      "campaign",
      parseInt(id),
      body,
      request,
    );
    return Response.json({ campaign: result[0] });
  } catch (error) {
    return Response.json(
      { error: "Failed to update campaign" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  const { id } = params;

  await sql`DELETE FROM campaigns WHERE id = ${id}`;
  await logAdminAction(
    admin.adminId,
    "DELETE_CAMPAIGN",
    "campaigns",
    "campaign",
    parseInt(id),
    {},
    request,
  );
  return Response.json({ success: true });
}
