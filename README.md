This repository contains a Next.js app configured to export a static site and deploy to GitHub Pages.

How it works
- `next.config.mjs` has `output: 'export'` so `npx next export` produces a static `out/` folder.
- A GitHub Actions workflow `.github/workflows/gh-pages.yml` builds the site and deploys `out/` to the `gh-pages` branch using `GITHUB_TOKEN`.

To deploy from your machine
1. Push changes to `main`.
2. GitHub Actions will run and publish `gh-pages` branch.

Notes
- Some Next.js features (server-side rendering, API routes) are not compatible with static export. Verify your app's pages render statically.
- If you need client-side-only dynamic features, ensure they run without SSR.# legalCRM1
something
