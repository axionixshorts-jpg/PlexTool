import sql from "@/app/api/utils/sql";
import { getAdminFromRequest, unauthorized } from "../utils";

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) return unauthorized();

  try {
    const [
      userStats,
      campaignStats,
      submissionStats,
      walletStats,
      withdrawalStats,
      recentUsers,
      recentWithdrawals,
      topCampaigns,
      recentSubmissions,
    ] = await sql.transaction([
      sql`SELECT
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'creator') as total_creators,
        COUNT(*) FILTER (WHERE role = 'brand') as total_brands,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week
      FROM users`,

      sql`SELECT
        COUNT(*) as total_campaigns,
        COUNT(*) FILTER (WHERE status = 'active') as active_campaigns,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_approval,
        COUNT(*) FILTER (WHERE featured = true) as featured_count,
        SUM(reward_amount) as total_budget
      FROM campaigns`,

      sql`SELECT
        COUNT(*) as total_submissions,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_submissions,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_submissions,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_submissions
      FROM submissions`,

      sql`SELECT
        COALESCE(SUM(balance), 0) as total_balance,
        COALESCE(SUM(pending_balance), 0) as total_pending,
        COALESCE(SUM(lifetime_earnings), 0) as total_paid_out
      FROM wallets`,

      sql`SELECT
        COUNT(*) as total_withdrawals,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_withdrawals,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as pending_amount,
        COALESCE(SUM(amount) FILTER (WHERE status IN ('paid','processing')), 0) as paid_amount
      FROM withdrawals`,

      sql`SELECT id, name, email, role, created_at, avatar_url FROM users ORDER BY created_at DESC LIMIT 5`,

      sql`SELECT w.*, u.name as user_name, u.email as user_email
        FROM withdrawals w LEFT JOIN users u ON u.id = w.user_id
        ORDER BY w.created_at DESC LIMIT 5`,

      sql`SELECT c.*, COUNT(cp.id) as participant_count
        FROM campaigns c
        LEFT JOIN campaign_participants cp ON cp.campaign_id = c.id
        GROUP BY c.id ORDER BY participant_count DESC LIMIT 5`,

      sql`SELECT s.*, u.name as creator_name, c.title as campaign_title
        FROM submissions s
        LEFT JOIN users u ON u.id = s.user_id
        LEFT JOIN campaigns c ON c.id = s.campaign_id
        ORDER BY s.created_at DESC LIMIT 5`,
    ]);

    return Response.json({
      stats: {
        users: userStats[0],
        campaigns: campaignStats[0],
        submissions: submissionStats[0],
        wallet: walletStats[0],
        withdrawals: withdrawalStats[0],
      },
      recentUsers,
      recentWithdrawals,
      topCampaigns,
      recentSubmissions,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return Response.json(
      { error: "Failed to load dashboard" },
      { status: 500 },
    );
  }
}
