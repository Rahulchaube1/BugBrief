import { createClient } from "@supabase/supabase-js";

export const FREE_DAILY_LIMIT = 5;

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function getUsage(userId: string): Promise<number> {
  const utcDayStart = new Date();
  utcDayStart.setUTCHours(0, 0, 0, 0);

  const { count, error } = await admin
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", utcDayStart.toISOString());

  // Fail closed: a database error must not be interpreted as zero usage.
  if (error) {
    throw new Error("Usage lookup failed.");
  }

  return count ?? 0;
}

export async function recordUsage(userId: string, inputLength: number): Promise<void> {
  const { error } = await admin
    .from("usage_logs")
    .insert({ user_id: userId, input_length: inputLength });

  if (error) {
    throw new Error("Usage recording failed.");
  }
}
