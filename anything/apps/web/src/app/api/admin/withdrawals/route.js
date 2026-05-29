import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized } from "../utils";

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let query = `SELECT w.*, u.name as user_name, u.email as user_email, u.avatar_url,
    wal.balance as current_balance
    FROM withdrawals w
    LEFT JOIN users u ON u.id = w.user_id
    LEFT JOIN wallets wal ON wal.user_id = w.user_id
    WHERE 1=1`;
  const params = [];
  let p = 0;

  if (status) {
    p++;
    query += ` AND w.status = $${p}`;
    params.push(status);
  }
  query += ` ORDER BY w.created_at DESC`;
  p++;
  query += ` LIMIT $${p}`;
  params.push(limit);
  p++;
  query += ` OFFSET $${p}`;
  params.push(offset);

  const withdrawals = await sql(query, params);
  const totalRes = await sql`SELECT COUNT(*) FROM withdrawals`;
  const pendingAmount =
    await sql`SELECT COALESCE(SUM(amount),0) as total FROM withdrawals WHERE status = 'pending'`;

  return Response.json({
    withdrawals,
    total: parseInt(totalRes[0].count),
    pendingAmount: parseFloat(pendingAmount[0].total),
  });
}
