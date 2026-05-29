import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized, logAdminAction } from "../utils";

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let query = `SELECT c.*, COUNT(cp.id) as participant_count FROM campaigns c
    LEFT JOIN campaign_participants cp ON cp.campaign_id = c.id WHERE 1=1`;
  const params = [];
  let p = 0;

  if (status) {
    p++;
    query += ` AND c.status = $${p}`;
    params.push(status);
  }
  if (search) {
    p++;
    query += ` AND (LOWER(c.title) LIKE LOWER($${p}) OR LOWER(c.brand_name) LIKE LOWER($${p}))`;
    params.push(`%${search}%`);
  }
  query += ` GROUP BY c.id ORDER BY c.created_at DESC`;
  p++;
  query += ` LIMIT $${p}`;
  params.push(limit);
  p++;
  query += ` OFFSET $${p}`;
  params.push(offset);

  const campaigns = await sql(query, params);
  const total = await sql`SELECT COUNT(*) FROM campaigns`;
  return Response.json({ campaigns, total: parseInt(total[0].count) });
}

export async function POST(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json();
    const {
      title,
      description,
      brand_name,
      brand_logo,
      reward_amount,
      platform,
      category,
      deadline,
      rules,
      requirements,
      example_content,
      hero_image,
      status = "active",
      featured = false,
      trending = false,
      max_participants,
    } = body;

    if (!title)
      return Response.json({ error: "Title is required" }, { status: 400 });

    const result = await sql`
      INSERT INTO campaigns (
        title, description, brand_name, brand_logo, reward_amount,
        platform, category, deadline, rules, requirements,
        example_content, hero_image, status, featured, trending, max_participants
      ) VALUES (
        ${title}, ${description}, ${brand_name}, ${brand_logo}, ${reward_amount},
        ${platform}, ${category}, ${deadline || null}, ${rules}, ${requirements},
        ${example_content}, ${hero_image}, ${status}, ${featured}, ${trending}, ${max_participants || null}
      ) RETURNING *
    `;

    await logAdminAction(
      admin.adminId,
      "CREATE_CAMPAIGN",
      "campaigns",
      "campaign",
      result[0].id,
      { title },
      request,
    );
    return Response.json({ campaign: result[0] });
  } catch (error) {
    console.error("Create campaign error:", error);
    return Response.json(
      { error: "Failed to create campaign" },
      { status: 500 },
    );
  }
}
