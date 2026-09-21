"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email,setEmail] = useState(""); const [password,setPassword] = useState(""); const [message,setMessage] = useState(""); const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options:{ emailRedirectTo:`${window.location.origin}/auth/callback` }});
    if (result.error) return setMessage(result.error.message);
    if (mode === "signup" && !result.data.session) setMessage("Check your email to confirm your account.");
    else router.push("/dashboard");
  }
  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo:`${window.location.origin}/auth/callback` }});
    if (error) setMessage(error.message);
  }
  return <div className="mt-8">
    <form onSubmit={submit} className="space-y-4">
      <input className="w-full rounded-xl border px-4 py-3" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input className="w-full rounded-xl border px-4 py-3" type="password" placeholder="Password (8+ characters)" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required />
      <button className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white">{mode === "login" ? "Sign in" : "Create account"}</button>
    </form>
    <button onClick={google} className="mt-3 w-full rounded-xl border px-4 py-3 font-semibold">Continue with Google</button>
    {message && <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">{message}</p>}
  </div>;
}
