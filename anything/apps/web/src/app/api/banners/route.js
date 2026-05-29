import sql from "@/app/api/utils/sql";

// Public banners API for mobile app home screen
export async function GET(request) {
  try {
    const now = new Date().toISOString();
    const banners = await sql`
      SELECT * FROM banners
      WHERE is_active = true
        AND (starts_at IS NULL OR starts_at <= ${now})
        AND (ends_at IS NULL OR ends_at >= ${now})
      ORDER BY priority ASC, created_at DESC
      LIMIT 10
    `;
    return Response.json({ banners });
  } catch (error) {
    console.error("Banners fetch error:", error);
    return Response.json({ banners: [] });
  }
}
