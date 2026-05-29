import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized, logAdminAction } from "../../utils";

export async function PUT(request, { params }) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  const { id } = params;

  try {
    const { action, amount, description, ...fields } = await request.json();

    // Special actions
    if (action === "ban") {
      // Mark user as banned via a bio flag for now (extend with a status column ideally)
      await sql`UPDATE users SET bio = CONCAT('[BANNED] ', COALESCE(bio,'')) WHERE id = ${id}`;
      await logAdminAction(
        admin.adminId,
        "BAN_USER",
        "users",
        "user",
        parseInt(id),
        {},
        request,
      );
      return Response.json({ success: true, action: "banned" });
    }

    if (action === "add_balance" && amount) {
      const wallet = await sql`SELECT * FROM wallets WHERE user_id = ${id}`;
      const current = parseFloat(wallet[0]?.balance || 0);
      const newBalance = current + parseFloat(amount);
      await sql`UPDATE wallets SET balance = ${newBalance}, lifetime_earnings = lifetime_earnings + ${parseFloat(amount)} WHERE user_id = ${id}`;
      await sql`INSERT INTO wallet_transactions (user_id, amount, transaction_type, description, balance_before, balance_after, admin_id)
        VALUES (${id}, ${amount}, 'admin_credit', ${description || "Admin credit"}, ${current}, ${newBalance}, ${admin.adminId})`;
      await logAdminAction(
        admin.adminId,
        "WALLET_CREDIT",
        "wallet",
        "user",
        parseInt(id),
        { amount },
        request,
      );
      return Response.json({ success: true, action: "balance_added" });
    }

    if (action === "deduct_balance" && amount) {
      const wallet = await sql`SELECT * FROM wallets WHERE user_id = ${id}`;
      const current = parseFloat(wallet[0]?.balance || 0);
      const newBalance = Math.max(0, current - parseFloat(amount));
      await sql`UPDATE wallets SET balance = ${newBalance} WHERE user_id = ${id}`;
      await sql`INSERT INTO wallet_transactions (user_id, amount, transaction_type, description, balance_before, balance_after, admin_id)
        VALUES (${id}, ${-amount}, 'admin_debit', ${description || "Admin debit"}, ${current}, ${newBalance}, ${admin.adminId})`;
      await logAdminAction(
        admin.adminId,
        "WALLET_DEBIT",
        "wallet",
        "user",
        parseInt(id),
        { amount },
        request,
      );
      return Response.json({ success: true, action: "balance_deducted" });
    }

    // General profile update
    const allowed = ["name", "email", "bio", "avatar_url", "role", "onboarded"];
    const setClauses = [];
    const values = [];
    let p = 0;
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        p++;
        setClauses.push(`${key} = $${p}`);
        values.push(fields[key]);
      }
    }
    if (setClauses.length) {
      p++;
      values.push(id);
      await sql(
        `UPDATE users SET ${setClauses.join(", ")}, updated_at = NOW() WHERE id = $${p}`,
        values,
      );
    }

    await logAdminAction(
      admin.adminId,
      "UPDATE_USER",
      "users",
      "user",
      parseInt(id),
      fields,
      request,
    );
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();
  const { id } = params;
  await sql`DELETE FROM users WHERE id = ${id}`;
  await logAdminAction(
    admin.adminId,
    "DELETE_USER",
    "users",
    "user",
    parseInt(id),
    {},
    request,
  );
  return Response.json({ success: true });
}
