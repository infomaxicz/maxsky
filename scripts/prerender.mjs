// scripts/prerender.mjs
// Beží PO `vite build`. Pre každú routu vygeneruje vlastné statické HTML,
// aby crawler (a prvé vykreslenie) videli route-specific <title>/meta/OG
// + viditeľný SEO obsah. React sa po načítaní namontuje na #root a statický
// obsah nahradí reálnou appkou.
//
// Meta texty držíme 1:1 s `cs` (predvolený jazyk) prekladmi v src/App.jsx
// (translations + per-page SEO useEffect). Pri zmene textov v App.jsx
// aktualizuj aj tento súbor.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const ORIGIN = "https://maxisky.eu";
const OG_IMAGE = `${ORIGIN}/og-image.jpg`;

// interná navigácia (4 odkazy na routy) – vloží sa do statického obsahu
const NAV = [
  { path: "/", label: "Letenky" },
  { path: "/auto", label: "Auto a karavan" },
  { path: "/ubytovani", label: "Ubytování" },
  { path: "/zajezdy", label: "Zájezdy / Last minute" },
];

// routy + meta (title/description = 1:1 s translations.cs.seo_*)
const ROUTES = [
  {
    out: "index.html",
    path: "/",
    title: "MaxiSky – levné letenky, porovnání stovek aerolinek",
    description:
      "Porovnejte stovky aerolinek najednou a najděte nejlevnější letenku. Bez skrytých poplatků, ceny v eurech.",
    h1: "Vaše cesta začíná tady.",
    paras: [
      "Porovnejte stovky aerolinek najednou a rezervujte letenku za nejlepší cenu. Bez skrytých poplatků, ceny v eurech.",
      "Jedno hledání porovná klasické i nízkonákladové dopravce a najde nejlevnější kombinaci. Férovou cenu vidíte předem – žádné skryté poplatky na konci rezervace.",
      "Nakupujete u ověřených prodejců letenek a naše porovnání vás nestojí nic navíc.",
    ],
  },
  {
    out: "auto/index.html",
    path: "/auto/",
    title: "Půjčovna aut a karavanů – MaxiSky",
    description:
      "Porovnejte půjčovny aut od stovek poskytovatelů na jednom místě. Nejlepší ceny, storno zdarma.",
    h1: "Auto a karavan",
    paras: [
      "Porovnejte půjčovny aut od stovek poskytovatelů na jednom místě. Nejlepší ceny a u většiny rezervací storno zdarma.",
      "Vyberte místo vyzvednutí a termín, projděte stovky nabídek a rezervujte online. Přes 500 půjčoven ve 145 zemích.",
      "Auto i karavan za skvělé ceny – najděte si ten svůj na cesty.",
    ],
  },
  {
    out: "ubytovani/index.html",
    path: "/ubytovani/",
    title: "Ubytování a hotely za nejlepší ceny – MaxiSky",
    description:
      "Miliony ubytování po celém světě s ověřenými recenzemi. Skvělé ceny a storno zdarma u mnoha hotelů.",
    h1: "Ubytování s Agodou",
    paras: [
      "Vyhledejte a rezervujte ubytování po celém světě přes Agodu – hotely, apartmány i resorty za výhodné ceny.",
      "Miliony ubytování s ověřenými recenzemi od skutečných hostů. U mnoha hotelů storno zdarma.",
      "Zadejte destinaci a termín, porovnejte hotely a rezervujte výhodně.",
    ],
  },
  {
    out: "zajezdy/index.html",
    path: "/zajezdy/",
    title: "Zájezdy a Last minute – porovnání 120+ CK – MaxiSky",
    description:
      "Porovnejte zájezdy a last minute od více než 120 cestovních kanceláří. Stejné ceny jako u CK.",
    h1: "Zájezdy a Last minute na jednom místě",
    paras: [
      "Vyberte si dovolenou snů z nabídky více než 120 cestovních kanceláří – přehledně na jednom místě.",
      "Last minute, first minute i exotika za stejné ceny jako přímo u cestovky. Žádné poplatky navíc.",
      "Ověřené recenze a pojištění proti úpadku CK – nakupujete bezpečně.",
    ],
  },
];

const escAttr = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escText = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// nájde/nahradí <meta ... content="..."> alebo ho vloží pred </head>
function upsertMeta(html, attr, key, content) {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escAttr(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escText(title)}</title>`);
}

function setCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escAttr(href)}" />`;
  if (/<link rel="canonical"[^>]*>/i.test(html)) {
    return html.replace(/<link rel="canonical"[^>]*>/i, tag);
  }
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

// statický SEO obsah do #root (React ho pri načítaní nahradí)
function rootContent(route) {
  const paras = route.paras.map((p) => `      <p style="color:#94A4B6;line-height:1.6;margin:0 0 12px">${escText(p)}</p>`).join("\n");
  const nav = NAV.map((n) => `<a href="${escAttr(n.path)}" style="color:#3B82F6;text-decoration:none;font-weight:600">${escText(n.label)}</a>`).join("\n        ");
  return `<main style="max-width:1140px;margin:0 auto;padding:40px 22px;font-family:system-ui,-apple-system,sans-serif;color:#fff;background:#15202C;min-height:100vh">
      <h1 style="font-size:34px;font-weight:800;letter-spacing:-1px;margin:0 0 20px">${escText(route.h1)}</h1>
${paras}
      <nav aria-label="Sekce webu" style="display:flex;flex-wrap:wrap;gap:18px;margin-top:28px">
        ${nav}
      </nav>
    </main>`;
}

function injectRoot(html, route) {
  return html.replace(
    /<div id="root">[\s\S]*?<\/div>/i,
    `<div id="root">${rootContent(route)}</div>`
  );
}

async function main() {
  const template = await readFile(join(DIST, "index.html"), "utf8");

  for (const r of ROUTES) {
    const url = ORIGIN + r.path;
    let html = template;
    html = setTitle(html, r.title);
    html = upsertMeta(html, "name", "description", r.description);
    html = upsertMeta(html, "property", "og:type", "website");
    html = upsertMeta(html, "property", "og:title", r.title);
    html = upsertMeta(html, "property", "og:description", r.description);
    html = upsertMeta(html, "property", "og:url", url);
    html = upsertMeta(html, "property", "og:image", OG_IMAGE);
    html = upsertMeta(html, "name", "twitter:title", r.title);
    html = upsertMeta(html, "name", "twitter:description", r.description);
    html = setCanonical(html, url);
    html = injectRoot(html, r);

    const outPath = join(DIST, r.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    console.log(`prerendered ${r.path.padEnd(12)} → dist/${r.out}`);
  }
}

main().catch((err) => {
  console.error("prerender failed:", err);
  process.exit(1);
});
