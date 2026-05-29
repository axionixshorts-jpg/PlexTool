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

export async function POST(request, { params }) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if campaign exists
    const campaigns =
      await sql`SELECT * FROM campaigns WHERE id = ${id} AND status = 'active'`;
    if (campaigns.length === 0) {
      return Response.json(
        { error: "Campaign not found or not active" },
        { status: 404 },
      );
    }

    // Check if already joined
    const existing = await sql`
      SELECT id FROM campaign_participants WHERE user_id = ${userId} AND campaign_id = ${id}
    `;
    if (existing.length > 0) {
      return Response.json(
        { error: "Already joined this campaign" },
        { status: 409 },
      );
    }

    // Check max participants
    const campaign = campaigns[0];
    if (
      campaign.max_participants &&
      campaign.current_participants >= campaign.max_participants
    ) {
      return Response.json({ error: "Campaign is full" }, { status: 400 });
    }

    // Join campaign
    await sql`INSERT INTO campaign_participants (user_id, campaign_id) VALUES (${userId}, ${id})`;
    await sql`UPDATE campaigns SET current_participants = current_participants + 1 WHERE id = ${id}`;

    // Create notification
    await sql(
      `INSERT INTO notifications (user_id, notification_type, title, message) VALUES ($1, $2, $3, $4)`,
      [
        userId,
        "campaign_joined",
        "Campaign Joined!",
        `You joined "${campaign.title}". Start creating content!`,
      ],
    );

    return Response.json({
      success: true,
      message: "Successfully joined campaign",
    });
  } catch (error) {
    console.error("Join campaign error:", error);
    return Response.json({ error: "Failed to join campaign" }, { status: 500 });
  }
}
