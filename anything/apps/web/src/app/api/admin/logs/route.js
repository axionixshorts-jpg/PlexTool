import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized } from "../utils";

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const module = url.searchParams.get("module");

  let query = `SELECT al.*, a.name as admin_name, a.email as admin_email
    FROM admin_logs al LEFT JOIN admin_users a ON a.id = al.admin_id WHERE 1=1`;
  const params = [];
  let p = 0;

  if (module) {
    p++;
    query += ` AND al.module = $${p}`;
    params.push(module);
  }
  query += ` ORDER BY al.created_at DESC`;
  p++;
  query += ` LIMIT $${p}`;
  params.push(limit);
  p++;
  query += ` OFFSET $${p}`;
  params.push(offset);

  const logs = await sql(query, params);
  return Response.json({ logs });
}
