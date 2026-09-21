import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  if (request.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { email } = await request.json();
  if (typeof email !== "string" || !email.includes("@")) return NextResponse.json({ error: "Valid email required." }, { status: 400 });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const { error } = await admin.from("subscriptions").upsert({ user_id: user.id, status: "active", updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
