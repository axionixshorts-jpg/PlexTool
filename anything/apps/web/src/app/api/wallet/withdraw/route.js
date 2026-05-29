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

export async function POST(request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, method, method_details } = await request.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!method) {
      return Response.json(
        { error: "Payment method is required" },
        { status: 400 },
      );
    }

    // Check wallet balance
    const wallets = await sql`SELECT * FROM wallets WHERE user_id = ${userId}`;
    if (wallets.length === 0 || parseFloat(wallets[0].balance) < amount) {
      return Response.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Create withdrawal and update wallet
    const [withdrawal] = await sql.transaction([
      sql(
        `INSERT INTO withdrawals (user_id, amount, method, method_details) VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, amount, method, JSON.stringify(method_details || {})],
      ),
      sql`UPDATE wallets SET balance = balance - ${amount}, pending_balance = pending_balance + ${amount}, updated_at = NOW() WHERE user_id = ${userId}`,
    ]);

    // Create notification
    await sql(
      `INSERT INTO notifications (user_id, notification_type, title, message) VALUES ($1, $2, $3, $4)`,
      [
        userId,
        "withdrawal",
        "Withdrawal Requested",
        `Your withdrawal of $${amount} is being processed.`,
      ],
    );

    return Response.json({ withdrawal: withdrawal[0] });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return Response.json({ error: "Withdrawal failed" }, { status: 500 });
  }
}
