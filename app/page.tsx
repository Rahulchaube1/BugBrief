import Link from "next/link";
import { ArrowRight, Check, ClipboardPaste, FileText, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <main>
      <section className="border-b bg-gradient-to-b from-orange-50 to-white">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
            <Zap className="h-4 w-4 text-brand" /> From messy report to reproducible issue in seconds
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
            Stop asking, <span className="text-brand">“Can you reproduce it?”</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Paste the client message, error, screenshot text, or rough notes. BugBrief turns it into a clean engineering ticket with steps, expected behavior, actual behavior, severity, and useful technical context.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800">
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl border px-6 py-3 font-semibold hover:bg-gray-50">
              Try the workflow
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">Free plan includes 5 reports/day. No credit card required.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            [ClipboardPaste, "Paste anything", "Client messages, Slack fragments, stack traces, QA notes, or your own rough description."],
            [FileText, "Get an issue", "BugBrief produces a concise, reproducible Markdown issue you can paste into GitHub, Jira, Linear, or ClickUp."],
            [ShieldCheck, "Share safer", "The report pipeline masks common secrets and credentials before they become part of the generated ticket."]
          ].map(([Icon, title, body]) => (
            <div key={String(title)} className="rounded-2xl border p-7">
              <Icon className="h-7 w-7 text-brand" />
              <h2 className="mt-5 text-xl font-bold">{String(title)}</h2>
              <p className="mt-2 leading-7 text-gray-600">{String(body)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="font-semibold text-brand">WHY THIS EXISTS</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">A good bug report is a debugging tool.</h2>
              <p className="mt-5 leading-8 text-gray-600">
                Developers repeatedly lose time because incoming reports omit reproduction steps, browser/device context, expected behavior, or the exact error. A 2026 developer discussion described properly writing a bug report as an 8–12 minute task, with repeated context switching between screenshots, browsers, and issue trackers.
              </p>
            </div>
            <div className="rounded-3xl bg-black p-8 text-white">
              <p className="text-sm text-gray-400">INPUT</p>
              <p className="mt-2 font-mono text-sm">“checkout breaks on mobile after clicking pay, client sent screenshot, says it worked yesterday”</p>
              <div className="my-6 h-px bg-gray-700" />
              <p className="text-sm text-gray-400">OUTPUT</p>
              <p className="mt-2 font-mono text-sm">Steps → Expected → Actual → Environment → Severity → Reproduction notes</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="font-semibold text-brand">SIMPLE PRICING</p>
          <h2 className="mt-2 text-4xl font-black">Pay for fewer interruptions.</h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-2xl border p-8">
            <h3 className="text-2xl font-bold">Free</h3>
            <p className="mt-2 text-gray-600">For occasional debugging.</p>
            <p className="mt-6 text-4xl font-black">$0</p>
            <ul className="mt-6 space-y-3 text-sm">
              {["5 reports/day", "Markdown output", "Basic secret masking"].map(x => <li key={x} className="flex gap-2"><Check className="h-5 w-5 text-brand" />{x}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-brand p-8 shadow-lg">
            <h3 className="text-2xl font-bold">Pro</h3>
            <p className="mt-2 text-gray-600">For developers, agencies, and QA teams.</p>
            <p className="mt-6 text-4xl font-black">$12<span className="text-base font-medium text-gray-500">/month</span></p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Unlimited reports", "Better context extraction", "History", "Copy-ready Markdown", "Priority processing"].map(x => <li key={x} className="flex gap-2"><Check className="h-5 w-5 text-brand" />{x}</li>)}
            </ul>
            <Link href="/pricing" className="mt-8 block rounded-xl bg-brand px-5 py-3 text-center font-bold text-white hover:opacity-90">Get Pro</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
