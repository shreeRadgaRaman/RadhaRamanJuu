#!/usr/bin/env node
/**
 * Site tooling (no dependencies except sharp, only for reading photo metadata).
 *
 *   npm run domain -- https://your-domain.com     Put your real domain into every file that needs it.
 *   npm run check                                 Pre-launch check: placeholders + technical integrity.
 *   npm run check -- --strict                     Same, but exits with an error while placeholders remain.
 */
import { readFile, writeFile, readdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLACEHOLDER_DOMAIN = 'https://REPLACE_DOMAIN';
const DOMAIN_FILES = ['index.html', 'robots.txt', 'sitemap.xml'];
const PAGES = ['index.html', '404.html'];
const MARK = 'RRJ-PLACEHOLDER-IMAGE';

const read = (f) => readFile(path.join(ROOT, f), 'utf8');
const exists = (f) => access(path.join(ROOT, f)).then(() => true, () => false);

/* ------------------------------------------------------------------ domain */
async function setDomain(input) {
  let origin;
  let basePath;
  try {
    const u = new URL(input);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
    origin = u.origin;
    basePath = u.pathname.replace(/\/+$/, '');   // "" for a domain, "/RadhaRamanJuu" for a GitHub Pages project site
  } catch {
    console.error('Give the full address, e.g.  npm run domain -- https://www.example.com\n(a sub-folder is fine: https://name.github.io/RepoName/)');
    process.exit(1);
  }
  const site = origin + basePath;                 // no trailing slash; the page adds "/" where needed
  const today = new Date().toISOString().slice(0, 10);

  // Re-runnable: also replace whatever address is already in place (not only the placeholder).
  const home = await read('index.html');
  const current = home.match(/rel="canonical" href="([^"]+?)\/?"/)?.[1];
  const old = [PLACEHOLDER_DOMAIN, current && !current.includes('REPLACE_') ? current : null].filter(Boolean);

  for (const file of DOMAIN_FILES) {
    let text = await read(file);
    const had = old.some((o) => text.includes(o));
    for (const o of old) if (o !== site) text = text.replaceAll(o, site);
    text = text.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${today}</lastmod>`);
    await writeFile(path.join(ROOT, file), text);
    console.log(`${had ? 'updated' : 'unchanged'}  ${file}`);
  }

  // The 404 page can be reached at any depth, so it needs to know where the site starts.
  const nf = (await read('404.html')).replace(/<base href="[^"]*">/, `<base href="${basePath || ''}/">`);
  await writeFile(path.join(ROOT, '404.html'), nf);
  console.log('updated  404.html (base path)');

  console.log(`\nSite address set to ${site}/`);
  if (basePath) console.log('Note: on a GitHub Pages project site, search engines only read robots.txt from the host root, so the one in this folder is informational.');
}

/* ------------------------------------------------------------------- check */
async function check(strict) {
  const errors = [];
  const todos = [];
  const err = (m) => errors.push(m);

  for (const page of PAGES) {
    if (!(await exists(page))) { err(`${page} is missing`); continue; }
    const html = await read(page);

    /* Placeholders still to replace (with the line number, so you can find each one) */
    const lineOf = (index) => html.slice(0, index).split('\n').length;
    const todo = (msg, index) => todos.push({ msg: `${page}: ${msg}`, line: lineOf(index) });
    const FRIENDLY = {
      REPLACE_DOMAIN: 'your domain is not set. Run: npm run domain -- https://your-domain.com',
      REPLACE_CHANNEL_ID: 'WhatsApp Channel link. Replace REPLACE_CHANNEL_ID with your channel ID (until then the button is hidden)',
      REPLACE_YOUTUBE_HANDLE: 'YouTube channel link. Replace the whole address (https://www.youtube.com/@REPLACE_YOUTUBE_HANDLE) with your channel URL (until then the button is hidden)',
    };
    for (const m of html.matchAll(/REPLACE_[A-Z_]+/g)) todo(FRIENDLY[m[0]] ?? `${m[0]} still in the page`, m.index);
    for (const m of html.matchAll(/<span class="todo">\[([^\]]+)\]<\/span>/g)) todo(m[1], m.index);
    for (const m of html.matchAll(/data-replace="([^"]+)"/g)) todo(`replace ${m[1]}`, m.index);

    /* Internal anchors */
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!ids.has(m[1])) err(`${page}: link to #${m[1]} has no matching id`);

    /* Local files referenced */
    const refs = new Set();
    const withoutBase = html.replace(/<base\b[^>]*>/g, '');   // a <base> is a path prefix, not a file
    for (const m of withoutBase.matchAll(/\s(?:src|href)="([^"#?]+)"/g)) refs.add(m[1]);
    for (const m of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) for (const part of m[1].split(',')) refs.add(part.trim().split(/\s+/)[0]);
    for (const ref of refs) {
      if (/^(https?:|mailto:|tel:|data:)/.test(ref)) continue;
      const rel = ref.startsWith('/') ? ref.slice(1) : ref;
      if (!(await exists(rel))) err(`${page}: file not found → ${ref}`);
    }

    /* Images */
    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      const tag = m[0];
      if (!/\salt="/.test(tag)) err(`${page}: <img> without alt → ${tag.slice(0, 70)}…`);
      if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) err(`${page}: <img> without width/height (causes layout shift) → ${tag.slice(0, 70)}…`);
    }

    /* External links */
    for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
      if (!/rel="[^"]*noopener[^"]*noreferrer|rel="[^"]*noreferrer[^"]*noopener/.test(m[0])) err(`${page}: target="_blank" link missing rel="noopener noreferrer"`);
    }

    /* Structured data parses */
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(m[1]); } catch (e) { err(`${page}: structured data is not valid JSON (${e.message})`); }
    }

    /* Page basics (home page) */
    if (page === 'index.html') {
      for (const [label, re] of [['<title>', /<title>[^<]{10,}/], ['meta description', /name="description" content="[^"]{50,160}"/], ['canonical link', /rel="canonical"/],
        ['og:image', /property="og:image"/], ['twitter:card', /name="twitter:card"/], ['exactly one <h1>', /^(?:(?!<h1)[\s\S])*<h1[\s\S]*$/]]) {
        if (!re.test(html)) err(`index.html: missing or malformed ${label}`);
      }
      if ((html.match(/<h1\b/g) ?? []).length !== 1) err('index.html: there must be exactly one <h1>');
    }

    /* CSP: the inline boot script must match its hash */
    const csp = html.match(/Content-Security-Policy" content="([^"]+)"/)?.[1] ?? '';
    for (const m of html.matchAll(/<script>([^<]+)<\/script>/g)) {
      const hash = `sha256-${createHash('sha256').update(m[1]).digest('base64')}`;
      if (!csp.includes(hash)) err(`${page}: inline script changed. Update the CSP hash to '${hash}'`);
    }
  }

  /* CSS url() targets */
  for (const css of ['css/tokens.css', 'css/styles.css']) {
    const text = (await read(css)).replace(/url\("data:[^"]*"\)/g, '');   // inline SVG data URIs aren't files
    for (const m of text.matchAll(/url\("?([^")]+)"?\)/g)) {
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(css), m[1]));
      if (!(await exists(target))) err(`${css}: file not found → ${m[1]}`);
    }
  }

  /* 404 page knows where the site starts */
  {
    const canon = (await read('index.html')).match(/rel="canonical" href="([^"]+)"/)?.[1];
    const base = (await read('404.html')).match(/<base href="([^"]*)">/)?.[1];
    if (canon && !canon.includes('REPLACE_')) {
      const expected = new URL(canon).pathname;
      if (base !== expected) err(`404.html: <base href="${base}"> should be "${expected}". Run: npm run domain -- ${canon}`);
    }
  }

  /* Robots + sitemap agree with the canonical domain */
  const home = await read('index.html');
  const canonical = home.match(/rel="canonical" href="([^"]+)"/)?.[1];
  for (const f of ['robots.txt', 'sitemap.xml']) {
    const t = await read(f);
    if (canonical && !canonical.includes('REPLACE_') && !t.includes(new URL(canonical).origin)) err(`${f}: does not use the same domain as the canonical link (${canonical})`);
  }

  /* Placeholder photographs still in use */
  const { default: sharp } = await import('sharp').catch(() => ({ default: null }));
  if (sharp) {
    const candidates = [...(await readdir(path.join(ROOT, 'source-images'))).map((f) => `source-images/${f}`), 'assets/img/og-image.jpg'];
    const stale = [];
    for (const f of candidates) {
      if (!/\.(jpe?g|png|webp)$/i.test(f) || !(await exists(f))) continue;
      const { exif } = await sharp(path.join(ROOT, f)).metadata();
      if (!exif?.includes(MARK)) continue;
      if (f.includes('og-image')) todos.push({ msg: 'assets/img/og-image.jpg: still the placeholder social-share card. Replace it with a 1200×630 image' });
      else stale.push(path.basename(f, path.extname(f)));
    }
    if (stale.length) todos.push({ msg: `source-images/: ${stale.length} placeholder photographs still in use (${stale.join(', ')}). Replace each with your photograph under the same name, then run: npm run images` });
  } else {
    console.log('(sharp is not installed, so placeholder photographs were not checked. Run: npm install)\n');
  }

  /* Report */
  if (errors.length) {
    console.log(`PROBLEMS (${errors.length}). These should be fixed before launch:`);
    errors.forEach((e) => console.log(`  ✗ ${e}`));
    console.log('');
  } else {
    console.log('✓ Technical checks passed: links, files, images, structured data, security policy.\n');
  }
  if (todos.length) {
    const grouped = new Map();
    for (const { msg, line } of todos) grouped.set(msg, [...(grouped.get(msg) ?? []), line].filter(Boolean));
    console.log(`STILL TO REPLACE (${grouped.size} items):`);
    for (const [msg, lines] of grouped) {
      const where = lines.length ? `   → line${lines.length > 1 ? 's' : ''} ${[...new Set(lines)].join(', ')}` : '';
      console.log(`  • ${msg}${where}`);
    }
    console.log('');
  } else {
    console.log('✓ No placeholders left.\n');
  }
  process.exit(errors.length || (strict && todos.length) ? 1 : 0);
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'domain') await setDomain(arg);
else if (cmd === 'check') await check(process.argv.includes('--strict'));
else { console.log('Usage:\n  node tools/site.mjs domain https://your-domain.com\n  node tools/site.mjs check [--strict]'); process.exit(1); }
