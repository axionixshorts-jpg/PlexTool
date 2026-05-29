import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const campaigns = await sql`
      SELECT * FROM campaigns WHERE id = ${id}
    `;

    if (campaigns.length === 0) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    return Response.json({ campaign: campaigns[0] });
  } catch (error) {
    console.error("Campaign detail error:", error);
    return Response.json(
      { error: "Failed to fetch campaign" },
      { status: 500 },
    );
  }
}
