"use client";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export function Pricing(){
 const [loading,setLoading]=useState(false); const upi=process.env.NEXT_PUBLIC_UPI_ID||"chauberahul797@okhdfcbank"; const qr=`upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(process.env.NEXT_PUBLIC_UPI_NAME||"BugBrief")}&am=12&cu=INR`;
 async function checkout(){setLoading(true); const r=await fetch("/api/stripe/checkout",{method:"POST"}); const d=await r.json(); if(d.url) location.href=d.url; else alert(d.error||"Please sign in first."); setLoading(false);}
 return <div><div className="text-center"><p className="font-semibold text-brand">PRICING</p><h1 className="mt-2 text-5xl font-black">Simple enough to understand instantly.</h1><p className="mx-auto mt-4 max-w-2xl text-gray-600">$12/month for unlimited reports. Free users get 5/day.</p></div>
 <div className="mt-12 grid gap-8 md:grid-cols-2">
  <div className="rounded-3xl border-2 border-brand p-8"><h2 className="text-2xl font-bold">Pro — $12/month</h2><p className="mt-2 text-gray-600">Stripe subscription, automatically renewed.</p><button onClick={checkout} disabled={loading} className="mt-7 w-full rounded-xl bg-brand px-5 py-3 font-bold text-white disabled:opacity-50">{loading?"Opening checkout…":"Subscribe with Stripe"}</button><p className="mt-3 text-center text-xs text-gray-500">You must be signed in before checkout.</p></div>
  <div className="rounded-3xl border p-8"><h2 className="text-2xl font-bold">India UPI</h2><p className="mt-2 text-gray-600">Pay ₹999 using any UPI app.</p><div className="mt-5 flex justify-center"><QRCodeSVG value={qr} size={180}/></div><p className="mt-4 text-center font-mono text-sm">{upi}</p><p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">After payment, email your payment proof and account email for activation. Direct UPI does not provide a reliable automatic subscription webhook, so this path requires verification.</p></div>
 </div></div>
}
