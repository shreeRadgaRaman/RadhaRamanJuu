# Radha Raman Juu · Vrindavan — Website V2

A static website: plain HTML, CSS and a few small JavaScript files. No framework, no build step for the site itself, no third-party scripts, fonts or trackers. A first visit loads about 270 KB on a phone and 330 KB on a desktop (measured with your real photos, before your host's compression), of which JavaScript is 16 KB.

## Current status

**Complete: nothing is left to fill in.** `npm run check -- --strict` passes with no placeholders.

- **Your photographs:** the close-up darshan photo is the hero and the first gallery photo; the sanctum photo is the second gallery photo. The social-share card (what WhatsApp, Instagram, Facebook, Telegram and X show) is built from the close-up.
- **Your links:** Instagram `@radha_raman_juu.darshan`, YouTube `@radharamanjuu_official`, the WhatsApp Channel, and your email `shreeradharaman.vrindavan00@gmail.com`. All three profiles are also in the structured data for search engines.
- **Your address:** `https://shreeradgaraman.github.io/RadhaRamanJuu/` is set in the canonical link, social-share tags, structured data, `sitemap.xml`, `robots.txt` and the 404 page.
- **Content researched from public sources** (the temple's own `radharaman.org` and Wikipedia; see the next section): the aarti schedule, overview, history and seva text.

## Please check before you publish

Everything below was written from published sources, not from an official notice, so please read it once and correct anything you know to be different.

1. **Aarti times** (Today's Darshan section). Sources disagree. The set used is the one the Braj Rasik and shrimathuraji.com listings agree on:

   | Aarti | Summer | Winter |
   | --- | --- | --- |
   | Mangla | 5:00 am | 5:30 am |
   | Shringar | 10:00 am | 10:30 am |
   | Rajbhog | 12:30 pm | 12:30 pm |
   | Sandhya | 7:15 pm | 6:30 pm |
   | Shayan | 9:30 pm | 9:00 pm |

   Other sites give 4:00 am for summer Mangla, and 7:00 pm for summer Sandhya. **You know the real times: correct any that are wrong.** To change a time, edit the text inside the matching `<span class="slot__value">` in `index.html`. The page states that times are "compiled from published listings, not an official temple notice"; keep that wording until you have confirmed them with the temple.
2. **"Aulai Darshan"** from the original brief is not in any source I could find, so the fifth card is **Shayan Aarti** instead. If "Aulai" is a real darshan, tell me when it happens and add it as another `<li class="slot">`.
3. **Overview, History, Seva** (Temple information section) are short summaries with a small source line under each. The temple dates are deliberately left out because sources disagree about them (1542 is quoted for the manifestation, other sources date the temple itself differently). Seva *booking* details are not included, because the temple's own site blocks automated reading. If you have them, add them to the Seva section.
4. **Your GitHub address** is `shreeradgaraman…` (with a "g"). Your email says `shreeradharaman…`. If the GitHub name is a typo, run `npm run domain -- https://YOUR-CORRECT-ADDRESS/` and everything is updated at once.

## Publishing on GitHub Pages

1. Upload every file in this folder to the root of the repository `RadhaRamanJuu` (keep the folders exactly as they are, and include the hidden `.nojekyll` and `.gitignore` files).
2. In the repository, go to **Settings → Pages**, choose **Deploy from a branch**, select your main branch and the **/ (root)** folder, and save. After a minute the site is live at `https://shreeradgaraman.github.io/RadhaRamanJuu/`.

Notes for GitHub Pages:
- The site lives in a sub-folder (`/RadhaRamanJuu/`). Everything uses relative links, and the 404 page knows the base path, so missing pages show the styled "not found" page instead of a blank one. This was tested by serving the project exactly the way GitHub Pages does.
- `.nojekyll` stops GitHub from running its site generator over your files.
- `_headers` is ignored by GitHub Pages (it only works on Netlify and Cloudflare Pages). The Content-Security-Policy inside `index.html` still applies. Headers such as `X-Frame-Options` cannot be set on GitHub Pages.
- Search engines read `robots.txt` only from the very top of a domain, so the one in this folder is informational for a project site. Submit `sitemap.xml` in Google Search Console instead.
- Everything in the repository is public, including `source-images/originals/`. Remove that folder from the repository if you don't want the original photo files to be downloadable.
- Moving to your own domain later? Run `npm run domain -- https://your-domain.com` and re-upload the changed files.

## Quick start

```bash
npm install                      # helper tools: sharp (images), playwright + axe-core (browser tests)
npm run dev                      # preview at http://localhost:5173 (a local server is needed: the site uses ES modules)
npm test                         # fast unit tests (darshan timing logic), no dependencies
npx playwright install chromium  # one time, for the browser tests
npm run test:browser             # full browser test suite
npm run check                    # pre-launch checks and the list of what is still to fill in
```

## Everyday tasks

**Add or replace a photograph**
1. Put the photo in `source-images/` and run `npm run images`. It resizes and compresses only. It never crops, retouches or regenerates anything, so the deity is exactly as photographed. It also removes leftover sizes of the photo it replaces.
2. The tool prints the exact `width`, `height` and `srcset` to use.
3. *Replacing an existing one* (e.g. `hero.jpg`): keep the same file name. If the new photo has different pixel dimensions, update the `width`/`height`/`srcset` in `index.html` to the values the tool prints.
4. *Adding a gallery photo*: copy one `<li class="masonry__item">` block in the gallery section and change the file name, `width`/`height`, `srcset` and `alt` text. With three photos or fewer the gallery is centred; from four it becomes a masonry grid automatically.

> Your two photos were sent through WhatsApp, which compresses them (about 920–990 px wide). They look good at this size, but for the sharpest result on large screens, send the original files and replace `source-images/hero.jpg` and `source-images/sanctum.jpg`. A thin white border that WhatsApp had added around both photos was trimmed off; nothing inside the photographs was touched. Your untouched files are kept in `source-images/originals/`.

**Add Vrindavan photographs.** The arch-shaped photo row for the Vrindavan section is built and styled, and parked as a comment in `index.html` until real photos exist (placeholder pictures were removed so they can never reach the live site). To switch it on, put three photos (3:4 portrait works best) in `source-images/` as `vrindavan-1.jpg` … `vrindavan-3.jpg`, run `npm run images`, and add this under the `vrindavan__head` block, filling in `srcset`, `width`, `height` and `alt` from the tool's output:

```html
<ul class="arches" data-reveal="fade" data-scroll-region aria-label="Photographs of Vrindavan">
  <li class="arches__item"><figure class="arch-card" data-frame><picture>
    <source type="image/avif" srcset="…" sizes="(min-width: 900px) 360px, 70vw">
    <source type="image/webp" srcset="…" sizes="(min-width: 900px) 360px, 70vw">
    <img class="arch-card__img" src="…" srcset="…" sizes="(min-width: 900px) 360px, 70vw" width="…" height="…" alt="…" loading="lazy" decoding="async">
  </picture></figure></li>
  <!-- repeat for photos 2 and 3 -->
</ul>
```

**Replace the social-share card.** `assets/img/og-image.jpg` is 1200×630. The current one uses your close-up photo, shown whole, beside the site name.

## What's in the folder

| Path | Purpose |
| --- | --- |
| `index.html` | The whole home page |
| `.nojekyll` | Tells GitHub Pages to publish the files as they are |
| `css/tokens.css` | **All** colours, type sizes, spacing, radii, glass and motion values. Change a design value here once |
| `css/styles.css` | Components and sections |
| `js/` | `main.js` starts independent features: `nav.js`, `darshan.js`, `gallery.js`, `reveal.js`, `guards.js` |
| `assets/fonts/` | Self-hosted Marcellus, Hanken Grotesk, Tiro Devanagari Hindi (Devanagari loads only when Hindi text is shown) |
| `assets/img/` | Generated AVIF / WebP / JPEG versions of your photos (rebuilt by `npm run images`) |
| `source-images/` | Your photographs. `originals/` holds the untouched files you sent |
| `tools/` | `build-images.mjs` and `site.mjs` (domain + pre-launch check) |
| `tests/` | `darshan.test.mjs` (unit) and `browser.test.mjs` (full browser suite) |
| `_headers` | Security and cache headers for Netlify / Cloudflare Pages (copy the values for other hosts) |
| `404.html` | Friendly not-found page (assumes the site is at the domain root) |

## How it is built to stay reliable

- **One broken feature never takes the site down.** Each script feature loads and starts on its own. If one fails to download, has an error, or crashes, it is logged in the console and everything else keeps working. If the scroll-reveal feature is the one that fails, every section is simply shown. The browser tests prove this by breaking each file in turn.
- **Content is visible with JavaScript off**, and the fade-in animations fail open after 2.5 seconds if scripts never start.
- **Missing images** become a calm fallback panel, and **unconfigured links** are hidden instead of leading to dead pages.

## Design decisions

- **One memorable device: the arch.** It echoes the temple niche and frames the hero photograph. Everything else stays quiet.
- **Darshan as a timeline**, because darshan really is a sequence through the day. The rail shows what is completed, live and upcoming.
- **Colour:** ivory and cream grounds, deep maroon for headings and buttons, gold only as hairlines and small marks. The muted saffron used for text is a darker shade so it passes contrast.
- **Glass is used sparingly.** Real backdrop blur is limited to three small elements (navigation, mobile menu, hero "now" card). Larger and repeated cards use translucency without blur, because blurring big areas is the costliest effect on phones. Browsers without `backdrop-filter`, users who ask for reduced transparency, and very low-memory phones all get solid fallbacks.
- **The deity is never covered.** The hero card sits over flowers and lace at the lower right (desktop) or just beneath the photograph (phones), clear of the face and of the "श्री राधा रमण जी" mark in the corner of your photos.
- **Motion:** one hero entrance, a slow fade as sections arrive, and hover states. No parallax, no looping animation. `prefers-reduced-motion` removes essentially all of it.

## Things worth knowing

- **Hindi spellings** on the darshan cards (मंगला आरती, शृंगार आरती, राजभोग आरती, संध्या आरती, शयन आरती) are the standard forms, but please glance over them.
- **Seasons.** Both the summer and winter times are always shown. The page highlights summer from April to October and winter from November to March, as commonly published. The temple decides the real change date; if it differs, edit `seasonFor` in `js/darshan.js`. A single time (an aarti) shows "Upcoming" and then "Earlier today"; a start–end range would also show "Live".
- **Structured data** describes the site as an `Organization` and `WebSite`, with your email and your Instagram, YouTube and WhatsApp Channel profiles. If this is the temple's official site, you can add a `HinduTemple` entry with its confirmed address. I did not invent one.
- **Security policy.** `index.html` has a Content-Security-Policy that allows only your own files, plus one hashed inline line (it adds the `js` class). If you edit that line, `npm run check` tells you the new hash.
- **Privacy / legal links:** none were added, since I could not see yours. Add them to the footer if the old site had them.
- **Your email address is shown as text on the page** (and in a mail link), so it can be picked up by automated address collectors. That is normal for a public contact address. If spam becomes a problem, use a contact form service instead.
- **Brand marks** (Instagram, YouTube, WhatsApp) use the official paths from the Simple Icons project (CC0).
