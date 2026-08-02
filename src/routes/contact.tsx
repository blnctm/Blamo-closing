import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Us — Blamo Closing" }, { name: "description", content: "Reach Blamo Closing with a question about our automotive sales training." }] }),
  component: Contact,
});

function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try { const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) }); if (!response.ok) throw new Error(); form.reset(); setStatus("success"); } catch { setStatus("error"); }
  }
  return <div className="min-h-dvh bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"><a href="/" className="text-lg font-extrabold tracking-tight">Blamo<span className="text-slate-400"> Closing</span></a><nav className="flex items-center gap-5 text-sm font-medium"><a href="/" className="text-slate-500 hover:text-slate-900">Home</a><a href="/contact" className="text-slate-900">Contact</a></nav></div></header>
    <main className="relative overflow-hidden px-6 py-20 sm:py-28"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_30rem_at_50%_-10%,rgba(251,191,36,0.22),transparent)]" /><div className="relative mx-auto max-w-2xl"><div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">Blamo Closing</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Contact Us</h1><p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">Have a question about our training? Send us a note and we’ll get back to you.</p></div>
      <form onSubmit={submit} className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8"><label className="block text-sm font-semibold text-slate-800" htmlFor="contact-name">Name</label><input id="contact-name" name="name" required className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30" /><label className="mt-5 block text-sm font-semibold text-slate-800" htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" required className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30" /><label className="mt-5 block text-sm font-semibold text-slate-800" htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" required maxLength={5000} rows={6} className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30" /><button disabled={status === "sending"} className="mt-6 rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-60">{status === "sending" ? "Sending…" : "Send message"}</button>{status === "success" && <p role="status" className="mt-4 font-medium text-emerald-700">Thanks — your message has been sent.</p>}{status === "error" && <p role="alert" className="mt-4 font-medium text-red-700">We couldn’t send your message. Please try again.</p>}</form>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center"><p className="font-semibold text-slate-800">Prefer another channel?</p><div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm"><a className="text-amber-700 underline underline-offset-4" href="mailto:blamo-closing-5cd03a7a@ctomail.io">blamo-closing-5cd03a7a@ctomail.io</a><a className="text-amber-700 underline underline-offset-4" href="https://www.tiktok.com/@blamoblanco">TikTok @blamoblanco</a></div></div>
    </div></main></div>;
}
