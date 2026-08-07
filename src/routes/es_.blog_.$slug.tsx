import { createFileRoute, Link } from "@tanstack/react-router";
import { ES_BLOG_ARTICLES, getEsBlogArticle } from "~/lib/blog-es-content";
import { renderBlogMarkdown } from "~/lib/blog-markdown";
import { EsBlogFooter, EsBlogHeader } from "./es_.blog";
export const Route = createFileRoute("/es_/blog_/$slug")({
  loader: ({ params }) => getEsBlogArticle(params.slug),
  head: ({ loaderData, params }) => {
    const article = loaderData ?? getEsBlogArticle(params.slug);
    if (!article) return { meta: [{ title: "Artículo no encontrado | Blamo Closing" }] };
    const url = `https://blamoclosing.com/es/blog/${article.slug}`;
    return { meta: [
      { title: `${article.title} | Blamo Closing` }, { name: "description", content: article.description },
      { property: "og:title", content: `${article.title} | Blamo Closing` }, { property: "og:description", content: article.description },
      { property: "og:type", content: "article" }, { property: "og:url", content: url }, { property: "article:published_time", content: article.date },
    ], links: [{ rel: "canonical", href: url }] };
  },
  component: EsBlogArticlePage,
});
export function EsBlogArticlePage() {
  const article = Route.useLoaderData();
  if (!article) return <main lang="es" className="p-12 text-center"><h1 className="text-3xl font-bold">Artículo no encontrado</h1><Link to="/es/blog" className="mt-4 inline-block text-amber-700">Volver al blog</Link></main>;
  return <main lang="es" className="min-h-screen bg-slate-50"><EsBlogHeader /><article className="mx-auto max-w-3xl px-6 py-14 sm:py-20"><Link to="/es/blog" className="inline-block rounded-lg py-2.5 text-sm font-semibold text-amber-700">← Volver al blog</Link><p className="mt-8 text-sm text-slate-500">{article.date}</p><h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">{article.title}</h1><p className="mt-6 text-xl leading-relaxed text-slate-600">{article.description}</p><div className="blog-prose mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10" dangerouslySetInnerHTML={{ __html: renderBlogMarkdown(article.markdown) }} /><div className="mt-10 rounded-2xl bg-slate-900 p-8 text-white"><h2 className="text-2xl font-bold">¿Quieres el proceso completo?</h2><p className="mt-2 text-slate-300">Pon estas ideas en práctica con las guías de capacitación de Blamo Closing.</p><a href={`https://blamoclosing.com/training#${article.productSlug}`} className="mt-5 inline-flex rounded-xl bg-amber-500 px-5 py-3.5 font-bold text-slate-950">Ver las guías de capacitación</a></div></article><EsBlogFooter /></main>;
}
export function getStaticEsBlogSlugs() { return ES_BLOG_ARTICLES.map(({ slug }) => slug); }
