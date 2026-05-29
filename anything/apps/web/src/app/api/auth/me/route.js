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

    return Response.json({ user: users[0] });
  } catch (error) {
    console.error("Auth me error:", error);
    return Response.json({ error: "Failed to get user" }, { status: 500 });
  }
}
