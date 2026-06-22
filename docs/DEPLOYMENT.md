# Deployment Guide

This guide covers deploying the weather dashboard to GitHub Pages and other hosting providers.

## GitHub Pages (Recommended)

### Automatic Deployment

The repository includes a `deploy.yml` workflow that automatically builds and deploys the app to GitHub Pages on every push to `main`.

**One-time setup:**

1. Go to **Settings → Pages** in your GitHub repository.
2. Under **Source**, select **GitHub Actions**.
3. Push a commit to `main` — the workflow handles the rest.

The deployed URL will be: `https://<username>.github.io/<repository-name>/`

### Manual Deployment

```bash
npm run build
# Upload the contents of dist/ to your hosting provider
```

---

## Environment Variables

| Variable         | Description                                  | Default |
|------------------|----------------------------------------------|---------|
| `VITE_BASE_URL`  | Base URL for asset paths (e.g. `/my-repo/`)  | `/`     |

Set these in a `.env` file for local development, or as repository secrets/variables for CI.

```bash
# .env.local
VITE_BASE_URL=/weather-dashboard/
```

---

## Custom Domain

1. Add a `CNAME` file to the `public/` directory containing your domain:
   ```
   weather.example.com
   ```
2. Configure your DNS provider with a CNAME record pointing to `<username>.github.io`.
3. In **Settings → Pages**, enter your custom domain and enable **Enforce HTTPS**.
4. Set `VITE_BASE_URL=/` in your deployment workflow since the app is served from the root.

---

## Other Hosting Providers

### Netlify / Vercel

Both support Vite projects out of the box:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20

No base URL configuration is needed because these platforms serve from the domain root.

### Docker / Static Server

```bash
npm run build
# Serve dist/ with any static file server, e.g.:
npx serve dist
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank page after deploy | Wrong `VITE_BASE_URL` | Set it to `/<repo-name>/` |
| 404 on refresh | SPA routing not configured | Add a `_redirects` file or server rewrite rule |
| Assets load from wrong path | Base URL mismatch | Verify `VITE_BASE_URL` matches the deployment subdirectory |
| Jekyll processing markdown | Missing `.nojekyll` | Ensure `public/.nojekyll` exists |
