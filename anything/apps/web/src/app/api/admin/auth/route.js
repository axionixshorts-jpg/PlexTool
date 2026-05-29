import sql from "@/app/api/utils/sql";
import argon2 from "argon2";

const ADMIN_EMAIL = "rexoagency.in@gmail.com";
const ADMIN_PASSWORD = "Mm5678@";
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || "superadmin-secret-2026";

function makeToken(adminId) {
  const payload = {
    adminId,
    role: "superadmin",
    ts: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function verifyAdminToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    if (payload.role !== "superadmin") return null;
    return payload;
  } catch {
    return null;
  }
}

// Ensure admin account exists
async function ensureAdminUser() {
  const existing =
    await sql`SELECT id FROM admin_users WHERE email = ${ADMIN_EMAIL}`;
  if (existing.length === 0) {
    const hash = await argon2.hash(ADMIN_PASSWORD);
    await sql`
      INSERT INTO admin_users (email, password_hash, name, role)
      VALUES (${ADMIN_EMAIL}, ${hash}, 'Super Admin', 'superadmin')
    `;
  }
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    await ensureAdminUser();

    const admins =
      await sql`SELECT * FROM admin_users WHERE email = ${email.toLowerCase()} AND is_active = true`;
    if (admins.length === 0) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const admin = admins[0];
    const valid = await argon2.verify(admin.password_hash, password);
    if (!valid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await sql`UPDATE admin_users SET last_login = NOW() WHERE id = ${admin.id}`;

    // Log the login
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await sql`
      INSERT INTO admin_logs (admin_id, action, module, details, ip_address)
      VALUES (${admin.id}, 'ADMIN_LOGIN', 'auth', ${{ email: admin.email }}::jsonb, ${ip})
    `;

    const token = makeToken(admin.id);
    const { password_hash, ...safeAdmin } = admin;

    return Response.json({ token, admin: safeAdmin });
  } catch (error) {
    console.error("Admin auth error:", error);
    return Response.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer "))
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyAdminToken(auth.slice(7));
    if (!payload)
      return Response.json(
        { error: "Token expired or invalid" },
        { status: 401 },
      );

    const admins =
      await sql`SELECT id, email, name, role, last_login FROM admin_users WHERE id = ${payload.adminId}`;
    if (admins.length === 0)
      return Response.json({ error: "Admin not found" }, { status: 404 });

    return Response.json({ admin: admins[0] });
  } catch (error) {
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}
