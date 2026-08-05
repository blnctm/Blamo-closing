import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

// Inline SVG favicon (navy tile + amber check) so we ship no image assets.
const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='10' fill='%230F172A'/%3E%3Cpath d='M12 21l5.5 5.5L28 14' stroke='%23F59E0B' stroke-width='3.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Blamo Closing — Sales Rep Training: Closing Techniques, Scripts & Starter Kit" },
      {
        name: "description",
        content:
          "Blamo Closing — practical sales rep training. Learn closing techniques and sales closes with word-for-word scripts. Start with The Sales Rep Starter Kit PDF guide.",
      },
      { property: "og:title", content: "Blamo Closing — Sales Rep Training: Closing Techniques, Scripts & Starter Kit" },
      {
        property: "og:description",
        content:
          "Close with clarity—not pressure. A practical, script-first guide to leading qualified buyers to a clear next step.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: FAVICON },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Runs synchronously before first paint: marks the document as
            JS-capable so .scroll-reveal elements are hidden only when the
            reveal script can bring them back. No JS -> class never added ->
            content stays visible (progressive enhancement). */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');",
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
