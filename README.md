# Blamo Closing — Storefront

Online sales-rep training storefront for **Blamo Closing** (car-dealership sales
training). Built with [TanStack Start](https://tanstack.com/start) (React 19 +
Vite 7 + Tailwind CSS 4).

## Pages

- `/` — landing page / storefront: The Sales Rep Starter Kit, The 10 Steps of
  the Sale, and The Five Closes in Action video, each with a PayPal buy button.
- `/thanks?product=<slug>` — post-purchase download page (`starter-kit`,
  `ten-steps`, `five-closes`).
- `/unsubscribe?email=<address>` — one-click unsubscribe page for the free
  lead-magnet list (flips `subscribed=false` and shows a confirmation page).

Product PDFs, the training video MP4, and ad images live in `public/` and are
served as static assets. The free lead-magnet PDF is
`public/3-closes-that-work.pdf` → `/3-closes-that-work.pdf` (public, no gate).

## Free lead magnet (email capture)

The homepage band captures an email → `POST /api/lead-magnet` upserts the
subscriber and returns the download URL for the free PDF. Sequence emails are
NOT sent from code — the team batch-sends them from the inbox using:

- `GET /api/lead-magnet/due?day=0|3|7|14` — subscribers due for that sequence
  email (day 0 = immediately; 3/7/14 = that many days after subscribing),
  protected by the `X-Admin-Key` header (env `ADMIN_KEY`).
- `POST /api/unsubscribe {email}` and the `/unsubscribe?email=` page both set
  `subscribed=false` + `unsubscribed_at=now()`.

Schema: `db/migrations/003_lead_magnet_subscribers.sql`.

## Local dev

```bash
bun install
bun run dev      # dev server
bun run build    # vite build (dist/client + dist/server)
```

## Deploying to Vercel

The repo is wired for [Vercel](https://vercel.com) via `vercel.json` +
`build-vercel.sh`:

- **Install command:** `bun install`
- **Build command:** `bash ./build-vercel.sh`
- `build-vercel.sh` runs the vite build and assembles a
  [Build Output API](https://vercel.com/docs/build-output-api) v3 bundle in
  `.vercel/output`: `dist/client` is published as static files (including the
  PDFs/video/PNGs from `public/`) and the SSR handler
  (`vercel-entry.ts` → `dist/server/server.js`) is bundled into a single
  Node 22 function (`render.func`) that serves all routes.

Framework auto-detection is disabled (`"framework": null`) on purpose: this
project does not use Nitro, and the Build Output API bundle is the supported
way to run this SSR app on Vercel.

After pushing to `main`, import the repo at vercel.com → **Add New Project →
Import → select `blnctm/Blamo-closing` → Deploy** (no settings to change;
framework preset shows "Other" and the build command above is used).

## Notes

- `publish.sh` / `serve.ts` / `go-live.sh` are platform-specific (port 3000
  preview hosting) and not used by Vercel.
- Buy-button links are public PayPal checkout URLs defined as constants at the
  top of `src/routes/index.tsx` — swap them in one place when the owner
  provides per-product PayPal Buy Now links.
