import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { maskSecrets } from "@/lib/utils";
import { getUsage, FREE_DAILY_LIMIT, recordUsage } from "@/lib/rateLimit";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

type BugReport = {
  title: string;
  summary: string;
  severity: string;
  environment: string;
  steps_to_reproduce: string[];
  expected_behavior: string;
  actual_behavior: string;
  technical_context: string;
  likely_area: string;
  reproduction_confidence: "low" | "medium" | "high";
  markdown: string;
};

async function currentUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items) =>
          items.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

function validateReport(value: unknown): BugReport | null {
  if (!isRecord(value)) return null;

  const stringFields = [
    "title",
    "summary",
    "severity",
    "environment",
    "expected_behavior",
    "actual_behavior",
    "technical_context",
    "likely_area",
    "markdown",
  ] as const;

  const limits: Record<(typeof stringFields)[number], number> = {
    title: 240,
    summary: 3000,
    severity: 40,
    environment: 2000,
    expected_behavior: 3000,
    actual_behavior: 3000,
    technical_context: 4000,
    likely_area: 500,
    markdown: 12000,
  };

  for (const field of stringFields) {
    if (!boundedString(value[field], limits[field])) return null;
  }

  if (
    !Array.isArray(value.steps_to_reproduce) ||
    value.steps_to_reproduce.length > 30 ||
    !value.steps_to_reproduce.every(
      (step) => typeof step === "string" && step.length <= 1000
    )
  ) {
    return null;
  }

  const confidence = value.reproduction_confidence;
  if (confidence !== "low" && confidence !== "medium" && confidence !== "high") {
    return null;
  }

  return {
    title: value.title as string,
    summary: value.summary as string,
    severity: value.severity as string,
    environment: value.environment as string,
    steps_to_reproduce: value.steps_to_reproduce as string[],
    expected_behavior: value.expected_behavior as string,
    actual_behavior: value.actual_behavior as string,
    technical_context: value.technical_context as string,
    likely_area: value.likely_area as string,
    reproduction_confidence: confidence,
    markdown: value.markdown as string,
  };
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 64 * 1024) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }

    const { supabase, user } = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const raw = isRecord(body) && typeof body.input === "string" ? body.input.trim() : "";
    if (raw.length < 10 || raw.length > 12000) {
      return NextResponse.json(
        { error: "Input must be 10–12,000 characters." },
        { status: 400 }
      );
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error("Subscription lookup failed.");
      return NextResponse.json(
        { error: "Unable to verify your plan. Please try again." },
        { status: 503 }
      );
    }

    const isPro = subscription?.status === "active";
    const usage = await getUsage(user.id);
    if (!isPro && usage >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Free daily limit reached. Upgrade to Pro for unlimited reports." },
        { status: 402 }
      );
    }

    const sanitized = maskSecrets(raw);
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are BugBrief, an expert software QA lead. Convert messy bug reports into a concise developer-ready issue. Never invent facts; use Unknown when missing. Return JSON keys title, summary, severity, environment, steps_to_reproduce (array), expected_behavior, actual_behavior, technical_context, likely_area, reproduction_confidence (low|medium|high), markdown. Keep every field concise and use only information supported by the input.",
        },
        { role: "user", content: sanitized },
      ],
    });

    const modelContent = response.choices[0]?.message?.content;
    if (!modelContent) throw new Error("The model returned an empty response.");

    let parsed: unknown;
    try {
      parsed = JSON.parse(modelContent);
    } catch {
      throw new Error("The model returned invalid JSON.");
    }

    const report = validateReport(parsed);
    if (!report) throw new Error("The model response did not match the report schema.");

    await recordUsage(user.id, raw.length);

    const { error: persistenceError } = await admin.from("reports").insert({
      user_id: user.id,
      input_text: sanitized,
      output_json: report,
    });

    if (persistenceError) {
      // Keep the generated report available even if optional history persistence fails.
      console.error("Report persistence failed.");
    }

    return NextResponse.json({
      report,
      usage: usage + 1,
      limit: isPro ? null : FREE_DAILY_LIMIT,
    });
  } catch (error) {
    // Avoid logging request bodies, generated reports, credentials, or provider error details.
    console.error("BugBrief report generation failed.");
    return NextResponse.json(
      { error: "Could not generate the report. Please try again." },
      { status: 500 }
    );
  }
}
