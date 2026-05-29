import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const platform = url.searchParams.get("platform");
    const status = url.searchParams.get("status") || "active";
    const featured = url.searchParams.get("featured");
    const trending = url.searchParams.get("trending");
    const search = url.searchParams.get("search");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    let query = `SELECT * FROM campaigns WHERE status = $1`;
    const params = [status];
    let paramCount = 1;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }
    if (platform) {
      paramCount++;
      query += ` AND platform = $${paramCount}`;
      params.push(platform);
    }
    if (featured === "true") {
      query += ` AND featured = true`;
    }
    if (trending === "true") {
      query += ` AND trending = true`;
    }
    if (search) {
      paramCount++;
      query += ` AND (LOWER(title) LIKE LOWER($${paramCount}) OR LOWER(brand_name) LIKE LOWER($${paramCount}) OR LOWER(category) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    paramCount++;
    query += ` ORDER BY featured DESC, created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const campaigns = await sql(query, params);

    return Response.json({ campaigns });
  } catch (error) {
    console.error("Campaigns list error:", error);
    return Response.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 },
    );
  }
}
