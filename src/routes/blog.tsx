import { createFileRoute, Link } from "@tanstack/react-router";
import { BLOG_ARTICLES } from "~/lib/blog-content";

export const Route = createFileRoute("/blog")({
  head: ({ matches }) => ({ meta: [
    { title: "Automotive Sales Training Tips | Blamo Closing Blog" },
    { name: "description", content: "Practical automotive sales tips, objection-handling scripts, and dealership training advice from Blamo Closing." },
    { property: "og:title", content: "Automotive Sales Training Tips | Blamo Closing Blog" },
    { property: "og:description", content: "Practical automotive sales tips, objection-handling scripts, and dealership training advice from Blamo Closing." },
    { property: "og:type", content: "website" }, { property: "og:url", content: "https://blamoclosing.com/blog" },
  ], links: matches.some((match) => match.routeId === "/blog/$slug") ? [] : [{ rel: "canonical", href: "https://blamoclosing.com/blog" }] }),
  component: BlogIndex,
});

function BlogIndex() {
  return <main className="min-h-screen bg-slate-50"><BlogHeader /><section className="mx-auto max-w-5xl px-6 py-16 sm:py-24"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Blamo Closing Journal</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Sales training for the real dealership floor.</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">Clear, practical guidance for automotive sales reps who want better conversations and more confident closes.</p><div className="mt-12 grid gap-6 md:grid-cols-2">{BLOG_ARTICLES.map((article) => <article key={article.slug} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><p className="text-sm text-slate-500">{article.date} · {Math.max(3, Math.ceil(article.markdown.split(/\s+/).length / 220))} min read</p><h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900"><Link className="hover:text-amber-700" to="/blog/$slug" params={{ slug: article.slug }}>{article.title}</Link></h2><p className="mt-3 leading-relaxed text-slate-600">{article.description}</p><Link className="mt-5 inline-flex font-semibold text-amber-700 hover:text-amber-800" to="/blog/$slug" params={{ slug: article.slug }}>Read the article →</Link></article>)}</div></section><BlogFooter /></main>;
}

export function BlogHeader() { return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5"><Link to="/" className="text-lg font-bold tracking-tight text-slate-900">Blamo<span className="text-slate-400"> Closing</span></Link><nav className="flex items-center gap-5 text-sm font-semibold"><Link to="/blog" className="text-amber-700">Blog</Link><a href="/#catalog" className="hidden rounded-lg bg-amber-500 px-4 py-2 text-slate-950 sm:inline-block">Get the Complete Package</a></nav></div></header>; }
export function BlogFooter() { return <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500"><span>© {new Date().getFullYear()} Blamo Closing · Original training material</span><nav className="flex gap-5"><Link to="/" className="hover:text-slate-900">Home</Link><Link to="/blog" className="hover:text-slate-900">Blog</Link><a href="/#catalog" className="hover:text-slate-900">Training guides</a></nav></div></footer>; }
