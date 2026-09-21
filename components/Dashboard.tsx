"use client";
import { useEffect, useState } from "react";
import { Copy, Loader2, LogOut, Sparkles } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type Report = { title:string; summary:string; severity:string; environment:string; steps_to_reproduce:string[]; expected_behavior:string; actual_behavior:string; technical_context:string; likely_area:string; reproduction_confidence:string; markdown:string };

export function Dashboard() {
  const [input,setInput]=useState(""); const [report,setReport]=useState<Report|null>(null); const [loading,setLoading]=useState(false); const [usage,setUsage]=useState<{used:number,limit:number|null,pro:boolean}|null>(null); const [error,setError]=useState("");
  useEffect(()=>{ fetch("/api/usage").then(r=>r.json()).then(setUsage); },[]);
  async function generate() {
    setLoading(true); setError(""); setReport(null);
    try { const r=await fetch("/api/core",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({input})}); const d=await r.json(); if(!r.ok) throw new Error(d.error); setReport(d.report); setUsage(u=>u?({...u,used:d.usage}):u); }
    catch(e){setError(e instanceof Error?e.message:"Something went wrong.");} finally{setLoading(false);}
  }
  async function logout(){ await supabase.auth.signOut(); location.href="/"; }
  return <div>
    <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
      <div><p className="text-sm font-semibold text-brand">BUGBRIEF WORKSPACE</p><h1 className="mt-1 text-4xl font-black">Turn chaos into a ticket.</h1></div>
      <div className="flex items-center gap-3">
        {usage && <span className="rounded-full bg-gray-100 px-4 py-2 text-sm">{usage.pro?"Pro":`${usage.used}/${usage.limit} today`}</span>}
        <button onClick={logout} className="rounded-xl border p-3" aria-label="Sign out"><LogOut className="h-5 w-5"/></button>
      </div>
    </div>
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <section>
        <label className="text-sm font-semibold">Paste the messy report</label>
        <textarea value={input} onChange={e=>setInput(e.target.value)} className="mt-3 h-80 w-full resize-none rounded-2xl border p-5 font-mono text-sm outline-none focus:border-brand" placeholder={"Example:\nclient says checkout fails on iPhone after pressing Pay\nworked yesterday\nscreenshot shows red error\nconsole: POST /api/pay 500"} />
        <button disabled={loading||input.length<10} onClick={generate} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {loading?<><Loader2 className="h-5 w-5 animate-spin"/>Generating…</>:<><Sparkles className="h-5 w-5"/>Generate bug report</>}
        </button>
        {error && <p className="mt-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      </section>
      <section>
        <div className="flex items-center justify-between"><label className="text-sm font-semibold">Developer-ready output</label>{report&&<button onClick={()=>navigator.clipboard.writeText(report.markdown)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Copy className="h-4 w-4"/>Copy</button>}</div>
        <div className="mt-3 min-h-80 rounded-2xl border bg-gray-50 p-5">
          {!report && !loading && <div className="flex h-72 items-center justify-center text-center text-gray-500">Your structured issue will appear here.</div>}
          {loading && <div className="flex h-72 items-center justify-center text-gray-500">Reading the report, extracting facts, and writing reproduction steps…</div>}
          {report && <div className="space-y-5"><h2 className="text-2xl font-black">{report.title}</h2><p className="text-gray-700">{report.summary}</p><div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-white p-3"><b>Severity</b><div>{report.severity}</div></div><div className="rounded-xl bg-white p-3"><b>Confidence</b><div>{report.reproduction_confidence}</div></div></div><div><b className="text-sm">Steps</b><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{report.steps_to_reproduce.map((x,i)=><li key={i}>{x}</li>)}</ol></div><pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-black p-4 text-xs text-white">{report.markdown}</pre></div>}
        </div>
      </section>
    </div>
  </div>;
}
