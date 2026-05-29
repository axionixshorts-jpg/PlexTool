import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized, logAdminAction } from "../../utils";

export async function PUT(request, { params }) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  const { id } = params;

  try {
    const { status } = await request.json();
    const validStatuses = [
      "pending",
      "approved",
      "processing",
      "paid",
      "rejected",
    ];
    if (!validStatuses.includes(status))
      return Response.json({ error: "Invalid status" }, { status: 400 });

    const processedAt = ["paid", "rejected"].includes(status)
      ? new Date().toISOString()
      : null;
    const result = await sql`
      UPDATE withdrawals SET status = ${status}, processed_at = ${processedAt}
      WHERE id = ${id} RETURNING *
    `;

    const withdrawal = result[0];

    // If rejected, refund the balance
    if (status === "rejected") {
      await sql`UPDATE wallets SET balance = balance + ${withdrawal.amount} WHERE user_id = ${withdrawal.user_id}`;
      await sql`INSERT INTO notifications (user_id, notification_type, title, message)
        VALUES (${withdrawal.user_id}, 'withdrawal_rejected', 'Withdrawal Rejected', ${"Your withdrawal of $" + withdrawal.amount + " was rejected. Amount refunded."})`;
    }

    if (status === "paid") {
      await sql`INSERT INTO notifications (user_id, notification_type, title, message)
        VALUES (${withdrawal.user_id}, 'withdrawal_paid', 'Payment Sent! 💸', ${"Your withdrawal of $" + withdrawal.amount + " has been processed."})`;
    }

    await logAdminAction(
      admin.adminId,
      `WITHDRAWAL_${status.toUpperCase()}`,
      "withdrawals",
      "withdrawal",
      parseInt(id),
      { status },
      request,
    );
    return Response.json({ withdrawal: result[0] });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update withdrawal" },
      { status: 500 },
    );
  }
}
