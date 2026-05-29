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

    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    let query = `
      SELECT s.*, c.title as campaign_title, c.brand_name, c.brand_logo, c.reward_amount
      FROM submissions s
      JOIN campaigns c ON s.campaign_id = c.id
      WHERE s.user_id = $1
    `;
    const params = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND s.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY s.created_at DESC`;

    const submissions = await sql(query, params);

    return Response.json({ submissions });
  } catch (error) {
    console.error("Submissions list error:", error);
    return Response.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { campaign_id, content_link, platform, screenshot_url, notes } =
      await request.json();

    if (!campaign_id || !content_link) {
      return Response.json(
        { error: "Campaign and content link are required" },
        { status: 400 },
      );
    }

    // Verify user joined the campaign
    const participation = await sql`
      SELECT id FROM campaign_participants WHERE user_id = ${userId} AND campaign_id = ${campaign_id}
    `;
    if (participation.length === 0) {
      return Response.json(
        { error: "You must join the campaign first" },
        { status: 400 },
      );
    }

    const result = await sql(
      `INSERT INTO submissions (user_id, campaign_id, content_link, platform, screenshot_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        userId,
        campaign_id,
        content_link,
        platform || "",
        screenshot_url || "",
        notes || "",
      ],
    );

    return Response.json({ submission: result[0] });
  } catch (error) {
    console.error("Submit error:", error);
    return Response.json(
      { error: "Failed to submit content" },
      { status: 500 },
    );
  }
}
