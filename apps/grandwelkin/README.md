# Grand Welkin — grandwelkin.com

The one-page company site for **RNP Grand Welkin LLP** (Bangalore, India). A single
static HTML page: no framework, no server, no database, no cookies, no third-party
scripts, no analytics. It lives in this monorepo as a standalone static app under
`apps/grandwelkin/` (no `package.json`, so pnpm/Bazel ignore it) and deploys to Vercel
as its own project.

## What's here
```
apps/grandwelkin/
├── index.html      # the page (semantic, accessible, JSON-LD inline)
├── styles.css      # all styles (system fonts, light/dark via prefers-color-scheme)
├── app.js          # ~1 KB: the "copy email" button, nothing else
├── favicon.svg     # inline-style SVG icon
├── og.svg          # source for the social image
├── og.png          # 1200×630 social card (generated from og.svg)
├── robots.txt      # allow all + sitemap
├── sitemap.xml     # the one URL
└── vercel.json     # security headers + CSP + caching
```
Critical page weight: **~15 KB uncompressed, ~4.7 KB gzipped** (the OG image is only
fetched by crawlers, not by the page).

## Preview locally
Any static server works — there is no build step:
```bash
cd apps/grandwelkin
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to Vercel
1. Push this repo to GitHub (it can be the existing monorepo).
2. In Vercel → **Add New → Project** → import the repo.
3. Set **Root Directory = `apps/grandwelkin`**.
4. **Framework Preset = Other**. Leave Build Command empty and **Output Directory empty**
   (Vercel serves the files as-is). There is nothing to build.
5. Deploy. The `vercel.json` in this folder applies the security headers and CSP.

## Connect grandwelkin.com (domain bought elsewhere, e.g. GoDaddy)
1. Vercel → your project → **Settings → Domains** → add `grandwelkin.com` **and**
   `www.grandwelkin.com`. Set the redirect so one is canonical (recommended: redirect
   `www` → `grandwelkin.com`, since the canonical tag points at the apex).
2. Vercel shows the exact DNS records to add. At your registrar's DNS panel, create:
   - **Apex (`grandwelkin.com`)** — an **A** record to the IP Vercel shows (currently
     `76.76.21.21`). If your registrar supports it, an **ALIAS/ANAME** to
     `cname.vercel-dns.com` is better for the apex.
   - **`www`** — a **CNAME** to `cname.vercel-dns.com`.
   - Remove any old parking/forwarding A or CNAME records for these names first.
3. Wait for propagation (minutes to a few hours). Vercel issues the TLS certificate
   automatically; the HSTS header is already set in `vercel.json`.

> Tip: always use the exact values shown in **your** Vercel dashboard — IPs/targets can
> change. The steps above are the current defaults.

## Regenerating the social image
`og.png` is rendered from `og.svg` at 1200×630. To regenerate after editing `og.svg`,
rasterize with any tool that renders SVG text, e.g. headless Chrome:
```bash
chrome --headless=new --window-size=1200,630 --force-device-scale-factor=1 \
  --screenshot=og.png "file://$PWD/og.svg"
```
(or `rsvg-convert -w 1200 -h 630 og.svg -o og.png`, or `sharp`/ImageMagick).

## Go-live checklist
- [ ] **Domain** — add `grandwelkin.com` + `www` in Vercel and point DNS (above).
- [ ] **Email** — set up the contact + support addresses at your mail provider
      (Google Workspace, Zoho Mail, Fastmail, …): `contact@grandwelkin.com`,
      `support_calc@grandwelkin.com`, `support_pdf@grandwelkin.com`. Add the provider's
      MX / SPF / DKIM records at your registrar. (These are email DNS records; they're
      separate from the website records above.)
- [ ] **Google Search Console** — add the `grandwelkin.com` property (Domain property =
      one DNS TXT record, covers www + subdomains), verify, then submit
      `https://grandwelkin.com/sitemap.xml` and request indexing of `/`.
- [ ] **Bing Webmaster Tools** — add the site (you can import from Search Console),
      verify, and submit the same sitemap.
- [ ] Validate the live page in Google's **Rich Results Test** (Organization JSON-LD)
      and check the share card with a link preview.

## Privacy
The site **sets no cookies and collects nothing** — no analytics, trackers, embeds or
third-party scripts. This is stated on the page (the *Privacy* section). If you ever
want traffic numbers, add **Vercel Web Analytics** yourself; it's privacy-friendly and
cookieless, but it is not included here by design.

## Notes on the guarantees
- **Performance / Core Web Vitals:** no web fonts (system stack), one small render-path
  CSS file, deferred ~1 KB JS, no images on the page itself → fast FCP/LCP and CLS 0.
- **Accessibility:** semantic landmarks, skip link, visible focus, labelled controls,
  AA contrast in light and dark.
- **Responsive:** verified no horizontal scroll from 280 px to 1920 px.
- **Security headers / CSP** live in `vercel.json` (`default-src 'self'`, HSTS,
  nosniff, Referrer-Policy, Permissions-Policy, `frame-ancestors 'none'`).
