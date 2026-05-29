import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized, logAdminAction } from "../utils";

export async function POST(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();

  try {
    const { target, title, message, notification_type } = await request.json();
    if (!title || !message)
      return Response.json(
        { error: "Title and message required" },
        { status: 400 },
      );

    let users = [];
    if (target === "all") {
      users = await sql`SELECT id FROM users`;
    } else if (target === "creators") {
      users = await sql`SELECT id FROM users WHERE role = 'creator'`;
    } else if (target === "brands") {
      users = await sql`SELECT id FROM users WHERE role = 'brand'`;
    } else if (target === "user" && request.userId) {
      users = [{ id: request.userId }];
    }

    let count = 0;
    for (const user of users) {
      await sql`INSERT INTO notifications (user_id, notification_type, title, message)
        VALUES (${user.id}, ${notification_type || "system"}, ${title}, ${message})`;
      count++;
    }

    await logAdminAction(
      admin.adminId,
      "SEND_NOTIFICATION",
      "notifications",
      null,
      null,
      { target, title, count },
      request,
    );
    return Response.json({ success: true, sent: count });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  const logs = await sql`SELECT al.*, a.name as admin_name FROM admin_logs al
    LEFT JOIN admin_users a ON a.id = al.admin_id
    WHERE al.module = 'notifications' ORDER BY al.created_at DESC LIMIT 20`;
  return Response.json({ logs });
}
