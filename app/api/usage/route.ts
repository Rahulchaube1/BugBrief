import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getUsage, FREE_DAILY_LIMIT } from "@/lib/rateLimit";

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: list => list.forEach(({name,value,options}) => cookieStore.set(name,value,options)) }
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: subscription } = await supabase.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle();
  const used = await getUsage(user.id);
  return NextResponse.json({ used, limit: subscription?.status === "active" ? null : FREE_DAILY_LIMIT, pro: subscription?.status === "active" });
}
