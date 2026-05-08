<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1f958730-bee0-48bf-8782-8bc6da2a4009

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Manual GitHub Pages Deployment (no Actions)

You can publish the built site to GitHub Pages manually. This repository is configured with Vite `base` set to `/research_visualization/`.

Option A — Serve from `main` branch `docs/` folder (recommended):

1. Build the app:

```bash
npm run build
```

2. Copy the `dist` output to a `docs/` folder, commit and push:

```bash
rm -rf docs
cp -r dist docs
git add docs
git commit -m "chore: deploy docs" || echo "no changes to commit"
git push origin main
```

3. In the repository Settings → Pages, set the source to `main` branch and `/docs` folder.

Option B — Publish to `gh-pages` branch (alternative):

1. Build and push `dist` to `gh-pages` using git subtree:

```bash
npm run build
git branch -D gh-pages || true
git subtree push --prefix dist origin gh-pages
```

2. In the repository Settings → Pages, set the source to the `gh-pages` branch.

Notes:
- The Vite `base` is already set to `'/research_visualization/'` in `vite.config.ts` so assets resolve correctly when served under `https://<user>.github.io/research_visualization/`.
- If you prefer, add a small script to automate copying `dist`→`docs` before committing, but the above commands keep control manual.
