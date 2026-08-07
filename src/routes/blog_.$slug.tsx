import { createFileRoute, Link } from "@tanstack/react-router";
import { BLOG_ARTICLES, getBlogArticle } from "~/lib/blog-content";
import { renderBlogMarkdown } from "~/lib/blog-markdown";
import { BlogFooter, BlogHeader } from "./blog";

export const Route = createFileRoute("/blog_/$slug")({
  loader: ({ params }) => getBlogArticle(params.slug),
  head: ({ loaderData, params }) => {
    const article = loaderData ?? getBlogArticle(params.slug);
    if (!article) return { meta: [{ title: "Article not found | Blamo Closing" }] };
    const url = `https://blamoclosing.com/blog/${article.slug}`;
    return { meta: [
      { title: `${article.title} | Blamo Closing` }, { name: "description", content: article.description },
      { property: "og:title", content: `${article.title} | Blamo Closing` }, { property: "og:description", content: article.description },
      { property: "og:type", content: "article" }, { property: "og:url", content: url }, { property: "article:published_time", content: article.date },
    ], links: [{ rel: "canonical", href: url }] };
  },
  component: BlogArticlePage,
});

export function BlogArticlePage() {
  const article = Route.useLoaderData();
  if (!article) return <main className="p-12 text-center"><h1 className="text-3xl font-bold">Article not found</h1><Link to="/blog" className="mt-4 inline-block text-amber-700">Back to the blog</Link></main>;
  return <main className="min-h-screen bg-slate-50"><BlogHeader /><article className="mx-auto max-w-3xl px-6 py-14 sm:py-20"><Link to="/blog" className="inline-block rounded-lg py-2.5 text-sm font-semibold text-amber-700">← Back to the blog</Link><p className="mt-8 text-sm text-slate-500">{article.date}</p><h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">{article.title}</h1><p className="mt-6 text-xl leading-relaxed text-slate-600">{article.description}</p><div className="blog-prose mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10" dangerouslySetInnerHTML={{ __html: renderBlogMarkdown(article.markdown) }} /><div className="mt-10 rounded-2xl bg-slate-900 p-8 text-white"><h2 className="text-2xl font-bold">Want the complete process?</h2><p className="mt-2 text-slate-300">Put these ideas into practice with Blamo Closing’s script-first training guides.</p><a href={`https://blamoclosing.com/training#${article.productSlug}`} className="mt-5 inline-flex rounded-xl bg-amber-500 px-5 py-3.5 font-bold text-slate-950">Browse the training guides</a></div></article><BlogFooter /></main>;
}

export function getStaticBlogSlugs() { return BLOG_ARTICLES.map(({ slug }) => slug); }
