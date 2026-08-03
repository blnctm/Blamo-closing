import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/testimonials")({
  component: Testimonials,
});

type Review = {
  text: string;
  createdAt: string;
  productName?: string;
  reviewerName?: string;
};

function Testimonials() {
  const [items, setItems] = useState<Review[] | null>(null);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((x) => setItems(x.testimonials ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <main className="min-h-dvh bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="inline-block rounded-lg py-2.5 text-sm font-semibold text-amber-700">
          ← Blamo Closing
        </a>
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight">
          Reviews from verified buyers
        </h1>
        <p className="mt-3 text-slate-600">
          Real feedback from people who purchased Blamo Closing training.
        </p>

        {items?.length === 0 && (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center text-slate-600 shadow-sm">
            No reviews yet. Every review here comes from a verified buyer after
            a real purchase.
          </div>
        )}

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {items?.map((x, i) => (
            <article
              key={i}
              className="rounded-2xl bg-white p-7 shadow-sm"
            >
              <p className="text-lg leading-8 text-slate-700">“{x.text}”</p>
              <p className="mt-5 text-sm font-bold text-slate-900">
                — {x.reviewerName ?? "Verified buyer"}
              </p>
              {x.productName && (
                <p className="mt-1 text-sm font-semibold text-amber-700">
                  {x.productName}
                </p>
              )}
              <time className="mt-2 block text-xs text-slate-400">
                {new Date(x.createdAt).toLocaleDateString()}
              </time>
            </article>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-slate-500">
          Reviews are from verified buyers.
        </p>
      </div>
    </main>
  );
}
