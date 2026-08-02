import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Us — Blamo Closing" }, { name: "description", content: "Questions about Blamo Closing automotive sales training? Email us at blnctm@gmail.com." }] }),
  component: Contact,
});

function Contact() {
  return <div className="min-h-dvh bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"><a href="/" className="text-lg font-extrabold tracking-tight">Blamo<span className="text-slate-400"> Closing</span></a><nav className="flex items-center gap-5 text-sm font-medium"><a href="/" className="text-slate-500 hover:text-slate-900">Home</a><a href="/contact" className="text-slate-900">Contact</a></nav></div></header>
    <main className="relative overflow-hidden px-6 py-20 sm:py-28"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_30rem_at_50%_-10%,rgba(251,191,36,0.22),transparent)]" /><div className="relative mx-auto max-w-2xl">
      <div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">Blamo Closing</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Contact Us</h1><p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">Questions about a training product? We’d love to help.</p></div>
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-900/5 sm:p-10">
        <p className="font-semibold text-slate-800">We’re here to help — email us anytime:</p>
        <a href="mailto:blnctm@gmail.com?subject=Question about Blamo Closing training" className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-lg font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 hover:shadow-amber-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">Email us at blnctm@gmail.com</a>
        <p className="mt-6 text-sm text-slate-500">We’ll get back to you as soon as we can.</p>
      </div>
    </div></main></div>;
}
