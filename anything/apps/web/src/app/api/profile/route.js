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

    const users = await sql`
      SELECT id, email, name, avatar_url, bio, role, referral_code, onboarded, created_at
      FROM users WHERE id = ${userId}
    `;
    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const socials =
      await sql`SELECT * FROM social_profiles WHERE user_id = ${userId}`;
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM campaign_participants WHERE user_id = ${userId}) as campaigns_joined,
        (SELECT COUNT(*) FROM submissions WHERE user_id = ${userId}) as total_submissions,
        (SELECT COUNT(*) FROM submissions WHERE user_id = ${userId} AND status = 'approved') as approved_submissions,
        (SELECT COALESCE(SUM(amount), 0) FROM earnings WHERE user_id = ${userId}) as total_earned
    `;

    return Response.json({
      user: users[0],
      socials,
      stats: stats[0],
    });
  } catch (error) {
    console.error("Profile error:", error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, bio, avatar_url, role } = await request.json();

    const setClauses = [];
    const values = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      setClauses.push(`name = $${paramCount}`);
      values.push(name);
    }
    if (bio !== undefined) {
      paramCount++;
      setClauses.push(`bio = $${paramCount}`);
      values.push(bio);
    }
    if (avatar_url !== undefined) {
      paramCount++;
      setClauses.push(`avatar_url = $${paramCount}`);
      values.push(avatar_url);
    }
    if (role !== undefined) {
      paramCount++;
      setClauses.push(`role = $${paramCount}`);
      values.push(role);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    setClauses.push(`updated_at = NOW()`);
    paramCount++;
    values.push(userId);

    const query = `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING id, email, name, avatar_url, bio, role, referral_code, onboarded`;
    const result = await sql(query, values);

    return Response.json({ user: result[0] });
  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
