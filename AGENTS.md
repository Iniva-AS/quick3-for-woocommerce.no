# Repository Guidelines

## Project Structure & Module Organization
This Astro marketing site lives under `website/`. Source code is in `src/` with file-based routing in `src/pages` (locale-aware variants under `src/pages/[locale]`). Reusable UI lives in `src/components` and layouts in `src/layouts`. Localized strings are managed through `src/i18n`, while static assets are under `public/`. Built artifacts publish to `dist/`.

## Build, Test, and Development Commands
- `npm install` - install dependencies (run before the first start or when the lockfile changes).
- `npm run dev` - start the Astro dev server at `http://localhost:4321` with hot reloading.
- `npm run build` - generate a static production bundle in `dist/`.
- `npm run preview` - serve the most recent production build locally for regression checks.
- `npx astro check` - optional pre-push type/content validation using Astro's compiler.

## Coding Style & Naming Conventions
Follow Astro and TypeScript defaults. Use tabs for indentation (see `src/pages/[locale]/index.astro`), lowercase route filenames, and PascalCase for components and layouts. Organize reusable logic alongside components, keep translations synchronized between locales, and rely on Tailwind utilities provided via `src/styles/global.css`.

## Testing Guidelines
Automated tests are not yet configured. Before merging, run `npm run build && npm run preview`, then click through `/no` and `/en` flows, ensuring docs navigation, pricing, and forms behave as expected. Log regressions as issues and propose end-to-end coverage when features merit it.

## Commit & Pull Request Guidelines
Commits use short, imperative summaries (e.g., `added more tracking`). Keep each commit focused on a single concern. Pull requests should include a clear description, before/after screenshots for UI changes, any content context worth noting, and links to related issues or deployment tasks.

## Deployment & Configuration Notes
Production deployments run on Ploi with `npm ci && npm run build`, serving static assets from `website/dist`. Update `astro.config.mjs` and sitemap settings when adding locales or routes, and ensure environment variables remain consistent across deployments.
