# Radha Raman Juu · Vrindavan — Website V2

A static website: plain HTML, CSS and a few small JavaScript files. No framework, no build step for the site itself, no third-party scripts, fonts or trackers. A first visit loads about 270 KB on a phone and 330 KB on a desktop (measured with your real photos, before your host's compression), of which JavaScript is 16 KB.

## Current status

**Done and in the page**
- Your two photographs: the close-up darshan photo is the hero and the first gallery photo, and the darshan sanctum photo is the second gallery photo. The social-share card (what WhatsApp, Instagram, Facebook, Telegram and X show) is built from the close-up.
- Your email, `shreeradharaman.vrindavan00@gmail.com`: contact card, notes card, "Visiting" section, footer, and the site's structured data.
- Your Instagram, `@radha_raman_juu.darshan`.
- The full design, navigation, darshan timeline, gallery with full-screen viewer, Vrindavan section, temple information, footer, 404 page, SEO files, security headers and tests.

**Still needs information only you have.** Nothing below was guessed. Run `npm run check` for the exact line numbers.

| What | Where | How |
| --- | --- | --- |
| Your domain | everywhere it is needed | `npm run domain -- https://your-domain.com` |
| Darshan timings (5 slots) | Today's Darshan section | Replace each `[Add timing]` with plain text such as `5:30 am – 6:30 am`. Live / Upcoming / Completed is worked out automatically in Indian Standard Time. Keep the slots in the order they happen. |
| Temple overview, history, seva | Temple information section | Replace the three highlighted `[…]` notes with your own text. Use only facts you can verify. |
| YouTube channel link | 4 places in `index.html` | Replace `https://www.youtube.com/@REPLACE_YOUTUBE_HANDLE` with your channel address |
| WhatsApp Channel link | 4 places in `index.html` | Replace `REPLACE_CHANNEL_ID` with your channel ID |

Until the two social links are set, those buttons are **hidden** rather than shown broken. They appear on their own once the address is filled in.

When all of that is done, `npm run check -- --strict` passes with nothing left to replace.

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

- **Hindi spellings** on the darshan cards (मंगला, शृंगार, राजभोग आरती, संध्या) should be checked by you. "Aulai Darshan" shows only its English name, because I wasn't certain of the correct Hindi spelling. You can add a `<p class="slot__hi" lang="hi">…</p>` line under its heading.
- **"Darshan timings can change with the season and on festival days"** is a general note. Please confirm it is accurate for your temple, or edit it.
- **Structured data** describes the site as an `Organization` and `WebSite`, with your Instagram profile and email. Add your YouTube and WhatsApp URLs to `sameAs` once known. If this is the temple's official site, you can add a `HinduTemple` entry with its confirmed address. I did not invent one.
- **Security policy.** `index.html` has a Content-Security-Policy that allows only your own files, plus one hashed inline line (it adds the `js` class). If you edit that line, `npm run check` tells you the new hash.
- **Privacy / legal links:** none were added, since I could not see yours. Add them to the footer if the old site had them.
- **Your email address is shown as text on the page** (and in a mail link), so it can be picked up by automated address collectors. That is normal for a public contact address. If spam becomes a problem, use a contact form service instead.
- **Brand marks** (Instagram, YouTube, WhatsApp) use the official paths from the Simple Icons project (CC0).
