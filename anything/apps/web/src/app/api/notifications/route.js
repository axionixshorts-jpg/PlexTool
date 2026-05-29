import sql from "@/app/api/utils/sql";

function getUserIdFromToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.split(" ")[1];
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await sql`
      SELECT * FROM notifications 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 50
    `;

    const unreadCount = await sql`
      SELECT COUNT(*) as unread_total FROM notifications 
      WHERE user_id = ${userId} AND is_read = false
    `;

    return Response.json({
      notifications,
      unreadCount: parseInt(unreadCount[0]?.unread_total || 0),
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return Response.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark all as read
    await sql`UPDATE notifications SET is_read = true WHERE user_id = ${userId}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Notifications update error:", error);
    return Response.json(
      { error: "Failed to update notifications" },
      { status: 500 },
    );
  }
}
