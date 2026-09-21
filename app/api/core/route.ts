import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { maskSecrets } from "@/lib/utils";
import { getUsage, FREE_DAILY_LIMIT, recordUsage } from "@/lib/rateLimit";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });

async function getUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: list => list.forEach(({name,value,options}) => cookieStore.set(name,value,options)) }
  });
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const body = await request.json();
    const raw = typeof body.input === "string" ? body.input.trim() : "";
    if (raw.length < 10 || raw.length > 12000) return NextResponse.json({ error: "Input must be 10–12,000 characters." }, { status: 400 });

    const { data: subscription } = await supabase.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle();
    const pro = subscription?.status === "active";
    const usage = await getUsage(user.id);
    if (!pro && usage >= FREE_DAILY_LIMIT) return NextResponse.json({ error: "Free daily limit reached. Upgrade to Pro for unlimited reports." }, { status: 402 });

    const sanitized = maskSecrets(raw);
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `You are BugBrief, an expert software QA lead. Convert messy bug reports into a concise, technically useful issue. Never invent facts. Use "Unknown" when information is missing. Return JSON with keys: title, summary, severity, environment, steps_to_reproduce (array), expected_behavior, actual_behavior, technical_context, likely_area, reproduction_confidence (low|medium|high), markdown. The markdown must be ready to paste into GitHub/Jira/Linear. Keep it factual and compact.` },
        { role: "user", content: sanitized }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No model response.");
    const report = JSON.parse(content);

    await recordUsage(user.id, raw.length);
    await admin.from("reports").insert({
      user_id: user.id,
      input_text: sanitized,
      output_json: report
    });

    return NextResponse.json({ report, usage: usage + 1, limit: pro ? null : FREE_DAILY_LIMIT });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not generate the report. Please try again." }, { status: 500 });
  }
}
