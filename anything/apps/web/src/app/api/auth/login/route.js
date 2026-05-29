import sql from "@/app/api/utils/sql";
import argon2 from "argon2";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const users =
      await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
    if (users.length === 0) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = users[0];
    const validPassword = await argon2.verify(user.password_hash, password);
    if (!validPassword) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const tokenData = JSON.stringify({ userId: user.id, ts: Date.now() });
    const token = Buffer.from(tokenData).toString("base64");

    const { password_hash, ...safeUser } = user;

    return Response.json({ user: safeUser, token });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
