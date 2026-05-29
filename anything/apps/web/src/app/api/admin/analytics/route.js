import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized } from "../utils";

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();

  try {
    const [
      userGrowth,
      submissionTrend,
      earningsByMonth,
      campaignsByCategory,
      platformBreakdown,
    ] = await sql.transaction([
      // User signups last 7 days
      sql`SELECT DATE(created_at) as date, COUNT(*) as count
          FROM users WHERE created_at >= NOW() - INTERVAL '7 days'
          GROUP BY DATE(created_at) ORDER BY date ASC`,

      // Submissions last 7 days
      sql`SELECT DATE(created_at) as date,
          COUNT(*) FILTER (WHERE status='approved') as approved,
          COUNT(*) FILTER (WHERE status='pending') as pending,
          COUNT(*) FILTER (WHERE status='rejected') as rejected
          FROM submissions WHERE created_at >= NOW() - INTERVAL '7 days'
          GROUP BY DATE(created_at) ORDER BY date ASC`,

      // Earnings last 6 months
      sql`SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
          COALESCE(SUM(amount),0) as total
          FROM earnings WHERE status = 'approved'
          AND created_at >= NOW() - INTERVAL '6 months'
          GROUP BY DATE_TRUNC('month', created_at) ORDER BY DATE_TRUNC('month', created_at) ASC`,

      // Campaigns by category
      sql`SELECT category, COUNT(*) as count, COALESCE(SUM(reward_amount),0) as total_reward
          FROM campaigns WHERE category IS NOT NULL
          GROUP BY category ORDER BY count DESC LIMIT 8`,

      // Submissions by platform
      sql`SELECT platform, COUNT(*) as count FROM submissions WHERE platform IS NOT NULL
          GROUP BY platform ORDER BY count DESC`,
    ]);

    return Response.json({
      userGrowth,
      submissionTrend,
      earningsByMonth,
      campaignsByCategory,
      platformBreakdown,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return Response.json(
      { error: "Failed to load analytics" },
      { status: 500 },
    );
  }
}
