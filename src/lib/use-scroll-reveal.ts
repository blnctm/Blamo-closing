import { useEffect } from "react";

/**
 * Progressive-enhancement scroll reveal.
 *
 * Observes every `.scroll-reveal` element and adds `.is-visible` when it
 * enters the viewport, driving the fade/slide-in animation. Content is
 * visible by default in CSS — the hiding only applies under a `js` class on
 * <html> (added by an inline head script before first paint) — so this hook
 * only ever ENHANCES visibility; it is never what makes content appear.
 *
 * Call it from any route component that renders `.scroll-reveal` elements.
 * It re-queries the DOM on every mount, so client-side route changes reveal
 * freshly mounted, already-in-viewport content immediately.
 */
export function useScrollReveal() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(".scroll-reveal");
    if (!("IntersectionObserver" in window)) {
      // No IO support: show everything right away (never leave content hidden).
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      // Low threshold so tall sections (e.g. the full catalog at the top of
      // /training) reveal as soon as any part is in the viewport.
      { threshold: 0.01 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
}
