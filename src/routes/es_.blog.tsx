import { createFileRoute, Link } from "@tanstack/react-router";
import { ES_BLOG_ARTICLES } from "~/lib/blog-es-content";

export const Route = createFileRoute("/es_/blog")({
  head: ({ matches }) => ({ meta: [
    { title: "Blog de Blamo Closing | Capacitación de ventas para el piso del concesionario" },
    { name: "description", content: "Consejos prácticos de ventas automotrices, guiones para manejar objeciones y capacitación para el concesionario, de Blamo Closing." },
    { property: "og:title", content: "Blog de Blamo Closing | Capacitación de ventas para el piso del concesionario" },
    { property: "og:description", content: "Consejos prácticos de ventas automotrices, guiones para manejar objeciones y capacitación para el concesionario, de Blamo Closing." },
    { property: "og:type", content: "website" }, { property: "og:url", content: "https://blamoclosing.com/es/blog" },
  ], links: matches.some((match) => (match.routeId as string) === "/es/blog/$slug") ? [] : [{ rel: "canonical", href: "https://blamoclosing.com/es/blog" }] }),
  component: EsBlogIndex,
});

function EsBlogIndex() {
  return <main lang="es" className="min-h-screen bg-slate-50"><EsBlogHeader /><section className="mx-auto max-w-5xl px-6 py-16 sm:py-24"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Revista Blamo Closing</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Capacitación de ventas para el piso del concesionario.</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">Orientación clara y práctica para vendedores automotrices que quieren mejores conversaciones y cierres más seguros.</p><div className="mt-12 grid gap-6 md:grid-cols-2">{ES_BLOG_ARTICLES.map((article) => <article key={article.slug} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><p className="text-sm text-slate-500">{article.date} · {Math.max(3, Math.ceil(article.markdown.split(/\s+/).length / 220))} min de lectura</p><h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900"><Link className="hover:text-amber-700" to="/es/blog/$slug" params={{ slug: article.slug }}>{article.title}</Link></h2><p className="mt-3 leading-relaxed text-slate-600">{article.description}</p><Link className="mt-5 inline-flex font-semibold text-amber-700 hover:text-amber-800" to="/es/blog/$slug" params={{ slug: article.slug }}>Leer el artículo →</Link></article>)}</div></section><EsBlogFooter /></main>;
}

export function EsBlogHeader() { return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5"><Link to="/es" className="text-lg font-bold tracking-tight text-slate-900">Blamo<span className="text-slate-400"> Closing</span></Link><nav className="flex items-center gap-5 text-sm font-semibold"><Link to="/es/blog" className="rounded-lg py-2.5 text-amber-700">Blog</Link><a href="/es#paquete" className="hidden rounded-lg bg-amber-500 px-4 py-2.5 text-slate-950 sm:inline-block">Obtén el Paquete Completo</a></nav></div></header>; }
export function EsBlogFooter() { return <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500"><span>© {new Date().getFullYear()} Blamo Closing · Material de capacitación original</span><nav className="flex flex-wrap gap-x-5 gap-y-2"><Link to="/es" className="rounded-lg py-2.5 hover:text-slate-900">Inicio</Link><Link to="/es/blog" className="rounded-lg py-2.5 hover:text-slate-900">Blog</Link><a href="/training" className="rounded-lg py-2.5 hover:text-slate-900">Guías de capacitación</a></nav></div></footer>; }
