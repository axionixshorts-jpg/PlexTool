import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized, logAdminAction } from "../../utils";

export async function PUT(request, { params }) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  const { id } = params;

  try {
    const { status, reviewer_notes } = await request.json();
    if (!["approved", "rejected", "pending"].includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await sql`
      UPDATE submissions SET status = ${status}, reviewer_notes = ${reviewer_notes || null},
      reviewed_at = NOW() WHERE id = ${id} RETURNING *
    `;

    // If approved, credit the creator
    if (status === "approved") {
      const sub = result[0];
      const campaign =
        await sql`SELECT reward_amount FROM campaigns WHERE id = ${sub.campaign_id}`;
      if (campaign.length > 0) {
        const reward = parseFloat(campaign[0].reward_amount);
        const wallet =
          await sql`SELECT balance FROM wallets WHERE user_id = ${sub.user_id}`;
        const current = parseFloat(wallet[0]?.balance || 0);
        await sql`UPDATE wallets SET balance = balance + ${reward}, lifetime_earnings = lifetime_earnings + ${reward}, updated_at = NOW() WHERE user_id = ${sub.user_id}`;
        await sql`INSERT INTO earnings (user_id, submission_id, campaign_id, amount, earning_type, status)
          VALUES (${sub.user_id}, ${sub.id}, ${sub.campaign_id}, ${reward}, 'campaign', 'approved')`;
        await sql`INSERT INTO wallet_transactions (user_id, amount, transaction_type, description, balance_before, balance_after, admin_id)
          VALUES (${sub.user_id}, ${reward}, 'campaign_reward', 'Campaign submission approved', ${current}, ${current + reward}, ${admin.adminId})`;
        // Notify creator
        await sql`INSERT INTO notifications (user_id, notification_type, title, message)
          VALUES (${sub.user_id}, 'submission_approved', 'Submission Approved! 🎉', ${"Your submission was approved. $" + reward + " added to your wallet."})`;
      }
    } else if (status === "rejected") {
      const sub = result[0];
      await sql`INSERT INTO notifications (user_id, notification_type, title, message)
        VALUES (${sub.user_id}, 'submission_rejected', 'Submission Update', ${reviewer_notes || "Your submission was not approved."})`;
    }

    await logAdminAction(
      admin.adminId,
      `SUBMISSION_${status.toUpperCase()}`,
      "submissions",
      "submission",
      parseInt(id),
      { status, reviewer_notes },
      request,
    );
    return Response.json({ submission: result[0] });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update submission" },
      { status: 500 },
    );
  }
}
