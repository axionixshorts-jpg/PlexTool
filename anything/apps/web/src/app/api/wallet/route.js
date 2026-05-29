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

    const wallets = await sql`SELECT * FROM wallets WHERE user_id = ${userId}`;

    if (wallets.length === 0) {
      // Create wallet if doesn't exist
      const newWallet =
        await sql`INSERT INTO wallets (user_id) VALUES (${userId}) RETURNING *`;
      return Response.json({ wallet: newWallet[0] });
    }

    // Get recent earnings
    const recentEarnings = await sql`
      SELECT e.*, c.title as campaign_title 
      FROM earnings e
      LEFT JOIN campaigns c ON e.campaign_id = c.id
      WHERE e.user_id = ${userId}
      ORDER BY e.created_at DESC
      LIMIT 10
    `;

    // Get weekly stats
    const weeklyStats = await sql`
      SELECT 
        DATE_TRUNC('day', created_at) as day,
        SUM(amount) as total
      FROM earnings
      WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY day
    `;

    return Response.json({
      wallet: wallets[0],
      recentEarnings,
      weeklyStats,
    });
  } catch (error) {
    console.error("Wallet error:", error);
    return Response.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}
