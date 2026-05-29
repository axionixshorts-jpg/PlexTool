import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized } from "../utils";

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();

  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  const search = url.searchParams.get("search");
  const status = url.searchParams.get("status");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let query = `SELECT u.*, w.balance, w.lifetime_earnings,
    COUNT(DISTINCT s.id) as submission_count,
    COUNT(DISTINCT cp.id) as campaign_count
    FROM users u
    LEFT JOIN wallets w ON w.user_id = u.id
    LEFT JOIN submissions s ON s.user_id = u.id
    LEFT JOIN campaign_participants cp ON cp.user_id = u.id
    WHERE 1=1`;
  const params = [];
  let p = 0;

  if (role) {
    p++;
    query += ` AND u.role = $${p}`;
    params.push(role);
  }
  if (search) {
    p++;
    query += ` AND (LOWER(u.name) LIKE LOWER($${p}) OR LOWER(u.email) LIKE LOWER($${p}))`;
    params.push(`%${search}%`);
  }

  query += ` GROUP BY u.id, w.balance, w.lifetime_earnings ORDER BY u.created_at DESC`;
  p++;
  query += ` LIMIT $${p}`;
  params.push(limit);
  p++;
  query += ` OFFSET $${p}`;
  params.push(offset);

  const users = await sql(query, params);
  const totalRes = await sql`SELECT COUNT(*) FROM users`;
  return Response.json({ users, total: parseInt(totalRes[0].count) });
}
