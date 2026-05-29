import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized } from "../utils";

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let query = `SELECT s.*, u.name as creator_name, u.email as creator_email, u.avatar_url as creator_avatar,
    c.title as campaign_title, c.brand_name, c.reward_amount
    FROM submissions s
    LEFT JOIN users u ON u.id = s.user_id
    LEFT JOIN campaigns c ON c.id = s.campaign_id
    WHERE 1=1`;
  const params = [];
  let p = 0;

  if (status) {
    p++;
    query += ` AND s.status = $${p}`;
    params.push(status);
  }
  if (search) {
    p++;
    query += ` AND (LOWER(u.name) LIKE LOWER($${p}) OR LOWER(c.title) LIKE LOWER($${p}))`;
    params.push(`%${search}%`);
  }
  query += ` ORDER BY s.created_at DESC`;
  p++;
  query += ` LIMIT $${p}`;
  params.push(limit);
  p++;
  query += ` OFFSET $${p}`;
  params.push(offset);

  const submissions = await sql(query, params);
  const totalRes = await sql`SELECT COUNT(*) FROM submissions`;
  return Response.json({ submissions, total: parseInt(totalRes[0].count) });
}
