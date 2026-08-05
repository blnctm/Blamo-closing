import { createFileRoute } from "@tanstack/react-router";
import { TrainingCatalog } from "~/routes/index";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Training Programs | Blamo Closing" },
      { name: "description", content: "Browse all Blamo Closing automotive sales training programs, PDF guides, MP3 audio, and the Complete Package." },
      { property: "og:url", content: "https://blamoclosing.com/training" },
    ],
    links: [{ rel: "canonical", href: "https://blamoclosing.com/training" }],
  }),
  component: TrainingPage,
});

function TrainingPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <div className="mx-auto max-w-6xl px-6 pt-6 pb-0 sm:pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Blamo Closing</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Training Programs</h1>
        <p className="mt-2 max-w-2xl text-base text-slate-600">Practical training for every part of the automotive sale.</p>
      </div>
      <TrainingCatalog />
    </main>
  );
}
