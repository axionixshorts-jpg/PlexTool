import sql from "@/app/api/utils/sql";
import argon2 from "argon2";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const existing =
      await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await argon2.hash(password);
    const referralCode =
      "CRE" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const result = await sql(
      `INSERT INTO users (email, password_hash, name, referral_code) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, referral_code, avatar_url, bio, onboarded, created_at`,
      [email.toLowerCase(), passwordHash, name || "", referralCode],
    );

    const user = result[0];

    // Create wallet for the user
    await sql`INSERT INTO wallets (user_id) VALUES (${user.id})`;

    // Generate simple token (user id + timestamp encoded)
    const tokenData = JSON.stringify({ userId: user.id, ts: Date.now() });
    const token = Buffer.from(tokenData).toString("base64");

    return Response.json({ user, token });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
