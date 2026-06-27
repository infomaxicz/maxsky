import React, { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// Skysell — maxisky.eu landing
// Tmavá námornícka + zelená (zladené s White Label fly.maxisky.eu).
// Formulár presmeruje na fly.maxisky.eu/flights/?origin_iata=…
// Marker je vo White Labeli zabudovaný → provízia ide automaticky.
// ─────────────────────────────────────────────────────────────

const WL = "https://fly.maxisky.eu/flights/";
const AGODA_URL = "https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1967819&hl=cs-cz";
const INVIA_URL = "https://www.invia.cz/?b_https=1&aid=9227602";
const INVIA_LASTMINUTE = "https://www.invia.cz/dovolena/last-minute/?b_https=1&aid=9227602";
const INVIA_BANNER = "https://affil.invia.cz/direct/core/tool_dynamic-banner/show-banner/id/9227602-6a3fbdae8f2bb/";
const INVIA_FIRSTMINUTE = "https://www.invia.cz/dovolena/first-minute/?b_https=1&aid=9227602";
const INVIA_FORM = "https://affil.invia.cz/direct/core/tool_search-form/render-form/nl_product_id/1/template/300x250/aid/9227602/";

function buildWlUrl({ from, to, depart, ret, adults }) {
  const params = new URLSearchParams({
    origin_iata: from.trim().toUpperCase(),
    destination_iata: to.trim().toUpperCase(),
    depart_date: depart,
    adults: String(adults),
    children: "0",
    infants: "0",
    trip_class: "0",
    locale: "en",
    currency: "eur",
  });
  if (ret) params.set("return_date", ret);
  return WL + "?" + params.toString();
}

const POPULAR = [
  { from: "PRG", to: "LON", key: "pop_prg_lon" },
  { from: "PRG", to: "BCN", key: "pop_prg_bcn" },
  { from: "BTS", to: "LON", key: "pop_bts_lon" },
  { from: "VIE", to: "FCO", key: "pop_vie_fco" },
  { from: "VIE", to: "CDG", key: "pop_vie_cdg" },
];

const DESTS = [
  { code: "LON", g: "linear-gradient(150deg,#2b3a52,#46618c)" },
  { code: "BCN", g: "linear-gradient(150deg,#3a4a3f,#5f8c6a)" },
  { code: "FCO", g: "linear-gradient(150deg,#4a3f3a,#8c6f5f)" },
  { code: "CDG", g: "linear-gradient(150deg,#3a3f4a,#5f6a8c)" },
];

const AUTO_CITIES = [
  { labelKey: "auto_city_any", url: "https://www.discovercars.com/?a_aid=maxisky" },
  { label: "Praha", url: "https://www.discovercars.com/cz/czech-republic/prague/prg?a_aid=maxisky" },
  { label: "Bratislava", url: "https://www.discovercars.com/cz/slovakia/bratislava/bts?a_aid=maxisky" },
  { label: "Vídeň", url: "https://www.discovercars.com/cz/austria/vienna/vie?a_aid=maxisky" },
  { label: "Split", url: "https://www.discovercars.com/cz/croatia/split/spu?a_aid=maxisky" },
  { label: "Barcelona", url: "https://www.discovercars.com/cz/spain/barcelona/bcn?a_aid=maxisky" },
  { label: "Řím", url: "https://www.discovercars.com/cz/italy/rome/fco?a_aid=maxisky" },
  { label: "Londýn", url: "https://www.discovercars.com/cz/united-kingdom/london/lhr?a_aid=maxisky" },
];

const FAQ_KEYS = [0, 1, 2, 3, 4];

const LANGS = [
  { code: "cs", short: "CZ", labelKey: "lang_cs" },
  { code: "sk", short: "SK", labelKey: "lang_sk" },
  { code: "en", short: "EN", labelKey: "lang_en" },
];

// ── i18n ───────────────────────────────────────────────────────
const translations = {
  cs: {
    lang_cs: "Čeština", lang_sk: "Slovenčina", lang_en: "English",
    nav_flights: "Letenky", nav_stay: "Ubytování",
    nav_auto: "Auto a karavan",
    auto_title: "Auto a karavan",
    auto_sub: "Porovnejte půjčovny aut od stovek poskytovatelů na jednom místě.",
    auto_btn: "Najít auto",
    auto_pick: "Místo vyzvednutí", auto_city_any: "Jakékoli město",
    auto_note: "Datum a čas vyberete na další stránce u DiscoverCars.",
    dc_banner_btn: "Hledat auto na DiscoverCars",
    auto_iframe_note: "Vyhledávání běží přes DiscoverCars. Pokud se nenačte, použijte výběr města níže.",
    stay_badge: "Rezervujte ubytování",
    stay_title: "Ubytování s Agodou",
    stay_desc: "Vyhledejte a rezervujte ubytování po celém světě přes Agodu – hotely, apartmány i resorty za výhodné ceny.",
    stay_brand_sub: "Hotely a ubytování po celém světě",
    stay_why_title: "Proč Agoda",
    stay_b1: "Miliony ubytování po celém světě",
    stay_b2: "Výhodné ceny, akce a slevy",
    stay_b3: "Bezplatné storno u mnoha ubytování",
    stay_b4: "Ověřené recenze od skutečných hostů",
    stay_cta: "Hledat ubytování na Agoda",
    stay_note: "Otevře se web Agoda v nové kartě.",
    nav_tours: "Zájezdy / Last minute",
    tours_badge: "Připravujeme",
    tours_title: "Zájezdy a Last minute s Invia",
    tours_desc: "Připravujeme spolupráci s Invia – porovnání zájezdů a last minute od více než 120 cestovních kanceláří na jednom místě. Než to spustíme, můžete hledat přímo u nich.",
    tours_brand_sub: "Zájezdy a last minute od 120+ CK",
    tours_why_title: "Proč Invia",
    tours_b1: "Více než 120 cestovních kanceláří na jednom místě",
    tours_b2: "Last minute i first minute za skvělé ceny",
    tours_b3: "Stejné ceny jako přímo u cestovní kanceláře",
    tours_b4: "Ověřené recenze a pojištění proti úpadku CK",
    tours_cta_lm: "Hledat Last minute", tours_cta_fm: "First minute", tours_cta_all: "Procházet všechny zájezdy",
    tours_form_title: "Vyhledat zájezd", tours_offers_title: "Akční nabídky",
    tours_note: "Otevře se web Invia v nové kartě.",
    hero_eyebrow: "Levné letenky · 300+ aerolinek",
    hero_title_pre: "Vaše cesta", hero_title_mid: "začíná", hero_title_accent: "tady.",
    hero_lead: "Porovnejte stovky aerolinek najednou a rezervujte letenku za nejlepší cenu. Bez skrytých poplatků, v eurech.",
    trip_round: "Zpáteční", trip_oneway: "Jednosměrné",
    f_from: "Odkud", f_to: "Kam", f_depart: "Odlet", f_return: "Návrat", f_pax: "Cestující",
    swap_aria: "Prohodit",
    adults_1: "1 dospělý", adults_2: "2 dospělí", adults_3: "3 dospělí", adults_4: "4 dospělí",
    search_btn: "Hledat lety →",
    hint_fromto: "Zadejte odkud i kam letíte.", hint_depart: "Vyberte datum odletu.",
    chips_label: "Oblíbené:",
    pop_prg_lon: "Praha → Londýn", pop_prg_bcn: "Praha → Barcelona", pop_bts_lon: "Bratislava → Londýn",
    pop_vie_fco: "Vídeň → Řím", pop_vie_cdg: "Vídeň → Paříž",
    why_aria: "Proč MaxiSky",
    why1_h: "300+ aerolinek", why1_p: "Porovnáváme stovky dopravců najednou",
    why2_h: "Bez skrytých poplatků", why2_p: "Cena, kterou vidíš, je cena, kterou platíš",
    why3_h: "Bezpečná rezervace", why3_p: "Nakupuješ u ověřených prodejců",
    why4_h: "Rychle a zdarma", why4_p: "Naše služba tě nestojí nic navíc",
    val1_h: "300+ aerolinek najednou", val1_p: "Jedno hledání porovná klasické i nízkonákladové společnosti a najde nejlevnější kombinaci.",
    val2_h: "Ceny v eurech, bez přirážek", val2_p: "Vidíš férovou cenu předem. Žádné skryté poplatky na konci rezervace.",
    val3_h: "Rezervace za pár minut", val3_p: "Vyber let a dokonči rezervaci přímo u ověřeného prodejce. Rychle a bezpečně.",
    dst_h: "Oblíbené destinace", dst_sub: "Klikni a vyhledej lety",
    dest_LON: "Londýn", dest_BCN: "Barcelona", dest_FCO: "Řím", dest_CDG: "Paříž",
    faq_h: "Časté dotazy", faq_sub: "Vše, co potřebuješ vědět",
    faq_q_0: "Jak MaxiSky funguje?",
    faq_a_0: "Porovnáme nabídky 300+ aerolinek a prodejců a přesměrujeme tě na tu nejvýhodnější. Rezervaci dokončíš přímo u prodejce.",
    faq_q_1: "Platím MaxiSky nějaký poplatek?",
    faq_a_1: "Ne. Naše služba je pro tebe úplně zdarma — platíš jen cenu letenky u prodejce.",
    faq_q_2: "V jaké měně jsou ceny?",
    faq_a_2: "Ceny zobrazujeme v eurech (€).",
    faq_q_3: "Jak zaplatím a kde dostanu letenku?",
    faq_a_3: "Platbu i letenku vyřizuje prodejce, ke kterému tě přesměrujeme. Letenku ti pošle e-mailem.",
    faq_q_4: "Dají se hledat i zpáteční lety?",
    faq_a_4: "Ano — jednosměrné i zpáteční lety.",
    ft_slogan: "Levné letenky pro tvé cesty.",
    ft_terms: "Obchodní podmínky", ft_privacy: "Ochrana osobních údajů", ft_cookies: "Zásady cookies",
    ft_cars: "Půjčovna aut — DiscoverCars",
    ft_copy: "© 2026 MaxiSky · Porovnávač letenek",
  },
  sk: {
    lang_cs: "Čeština", lang_sk: "Slovenčina", lang_en: "English",
    nav_flights: "Letenky", nav_stay: "Ubytovanie",
    nav_auto: "Auto a karavan",
    auto_title: "Auto a karavan",
    auto_sub: "Porovnaj požičovne áut od stoviek poskytovateľov na jednom mieste.",
    auto_btn: "Nájsť auto",
    auto_pick: "Miesto vyzdvihnutia", auto_city_any: "Akékoľvek mesto",
    auto_note: "Dátum a čas vyberieš na ďalšej stránke u DiscoverCars.",
    dc_banner_btn: "Hľadať auto na DiscoverCars",
    auto_iframe_note: "Vyhľadávanie beží cez DiscoverCars. Ak sa nenačíta, použite výber mesta nižšie.",
    stay_badge: "Rezervujte ubytovanie",
    stay_title: "Ubytovanie s Agodou",
    stay_desc: "Vyhľadajte a zarezervujte ubytovanie po celom svete cez Agodu – hotely, apartmány aj rezorty za výhodné ceny.",
    stay_brand_sub: "Hotely a ubytovanie po celom svete",
    stay_why_title: "Prečo Agoda",
    stay_b1: "Milióny ubytovaní po celom svete",
    stay_b2: "Výhodné ceny, akcie a zľavy",
    stay_b3: "Bezplatné storno pri mnohých ubytovaniach",
    stay_b4: "Overené recenzie od skutočných hostí",
    stay_cta: "Hľadať ubytovanie na Agoda",
    stay_note: "Otvorí sa web Agoda v novej karte.",
    nav_tours: "Zájazdy / Last minute",
    tours_badge: "Pripravujeme",
    tours_title: "Zájazdy a Last minute s Invia",
    tours_desc: "Pripravujeme spoluprácu s Invia – porovnanie zájazdov a last minute od viac než 120 cestovných kancelárií na jednom mieste. Kým to spustíme, môžete hľadať priamo u nich.",
    tours_brand_sub: "Zájazdy a last minute od 120+ CK",
    tours_why_title: "Prečo Invia",
    tours_b1: "Viac než 120 cestovných kancelárií na jednom mieste",
    tours_b2: "Last minute aj first minute za skvelé ceny",
    tours_b3: "Rovnaké ceny ako priamo u cestovnej kancelárie",
    tours_b4: "Overené recenzie a poistenie proti úpadku CK",
    tours_cta_lm: "Hľadať Last minute", tours_cta_fm: "First minute", tours_cta_all: "Prehliadať všetky zájazdy",
    tours_form_title: "Vyhľadať zájazd", tours_offers_title: "Akčné ponuky",
    tours_note: "Otvorí sa web Invia v novej karte.",
    hero_eyebrow: "Lacné letenky · 300+ aeroliniek",
    hero_title_pre: "Vaša cesta", hero_title_mid: "začína", hero_title_accent: "tu.",
    hero_lead: "Porovnaj stovky aeroliniek naraz a rezervuj letenku za najlepšiu cenu. Bez skrytých poplatkov, v eurách.",
    trip_round: "Spiatočne", trip_oneway: "Jednosmerne",
    f_from: "Odkiaľ", f_to: "Kam", f_depart: "Odlet", f_return: "Návrat", f_pax: "Cestujúci",
    swap_aria: "Vymeniť",
    adults_1: "1 dospelý", adults_2: "2 dospelí", adults_3: "3 dospelí", adults_4: "4 dospelí",
    search_btn: "Hľadať lety →",
    hint_fromto: "Zadaj odkiaľ aj kam letíš.", hint_depart: "Vyber dátum odletu.",
    chips_label: "Obľúbené:",
    pop_prg_lon: "Praha → Londýn", pop_prg_bcn: "Praha → Barcelona", pop_bts_lon: "Bratislava → Londýn",
    pop_vie_fco: "Viedeň → Rím", pop_vie_cdg: "Viedeň → Paríž",
    why_aria: "Prečo MaxiSky",
    why1_h: "300+ aerolínií", why1_p: "Porovnávame stovky dopravcov naraz",
    why2_h: "Bez skrytých poplatkov", why2_p: "Cena, ktorú vidíš, je cena, ktorú platíš",
    why3_h: "Bezpečná rezervácia", why3_p: "Nakupuješ u overených predajcov",
    why4_h: "Rýchlo a zdarma", why4_p: "Naša služba ťa nestojí nič navyše",
    val1_h: "300+ aeroliniek naraz", val1_p: "Jedno hľadanie porovná klasické aj nízkonákladové spoločnosti a nájde najlacnejšiu kombináciu.",
    val2_h: "Ceny v eurách, bez prirážok", val2_p: "Vidíš férovú cenu vopred. Žiadne skryté poplatky na konci rezervácie.",
    val3_h: "Rezervácia za pár minút", val3_p: "Vyber let a dokonči rezerváciu priamo u overeného predajcu. Rýchlo a bezpečne.",
    dst_h: "Obľúbené destinácie", dst_sub: "Klikni a vyhľadaj lety",
    dest_LON: "Londýn", dest_BCN: "Barcelona", dest_FCO: "Rím", dest_CDG: "Paríž",
    faq_h: "Časté otázky", faq_sub: "Všetko, čo potrebuješ vedieť",
    faq_q_0: "Ako MaxiSky funguje?",
    faq_a_0: "Porovnáme ponuky 300+ aerolínií a predajcov a presmerujeme ťa na tú najvýhodnejšiu. Rezerváciu dokončíš priamo u predajcu.",
    faq_q_1: "Platím MaxiSky nejaký poplatok?",
    faq_a_1: "Nie. Naša služba je pre teba úplne zadarmo — platíš len cenu letenky u predajcu.",
    faq_q_2: "V akej mene sú ceny?",
    faq_a_2: "Ceny zobrazujeme v eurách (€).",
    faq_q_3: "Ako zaplatím a kde dostanem letenku?",
    faq_a_3: "Platbu aj letenku vybavuje predajca, ku ktorému ťa presmerujeme. Letenku ti pošle e-mailom.",
    faq_q_4: "Dajú sa hľadať aj spiatočné lety?",
    faq_a_4: "Áno — jednosmerné aj spiatočné lety.",
    ft_slogan: "Lacné letenky pre tvoje cesty.",
    ft_terms: "Obchodné podmienky", ft_privacy: "Ochrana osobných údajov", ft_cookies: "Zásady cookies",
    ft_cars: "Požičovňa áut — DiscoverCars",
    ft_copy: "© 2026 MaxiSky · Porovnávač leteniek",
  },
  en: {
    lang_cs: "Čeština", lang_sk: "Slovenčina", lang_en: "English",
    nav_flights: "Flights", nav_stay: "Stays",
    nav_auto: "Car & campervan",
    auto_title: "Car & campervan",
    auto_sub: "Compare car rental from hundreds of providers in one place.",
    auto_btn: "Find a car",
    auto_pick: "Pick-up location", auto_city_any: "Any city",
    auto_note: "You'll pick dates on the next page at DiscoverCars.",
    dc_banner_btn: "Search cars on DiscoverCars",
    auto_iframe_note: "Search runs via DiscoverCars. If it doesn't load, use the city picker below.",
    stay_badge: "Book your stay",
    stay_title: "Stays with Agoda",
    stay_desc: "Search and book stays worldwide via Agoda – hotels, apartments and resorts at great prices.",
    stay_brand_sub: "Hotels & stays worldwide",
    stay_why_title: "Why Agoda",
    stay_b1: "Millions of stays worldwide",
    stay_b2: "Great prices, deals and discounts",
    stay_b3: "Free cancellation on many properties",
    stay_b4: "Verified reviews from real guests",
    stay_cta: "Search stays on Agoda",
    stay_note: "Opens Agoda in a new tab.",
    nav_tours: "Tours / Last minute",
    tours_badge: "Coming soon",
    tours_title: "Tours & Last minute with Invia",
    tours_desc: "We're preparing a partnership with Invia – compare tours and last-minute deals from 120+ travel agencies in one place. Until then, you can search directly on their site.",
    tours_brand_sub: "Tours & last minute from 120+ agencies",
    tours_why_title: "Why Invia",
    tours_b1: "120+ travel agencies in one place",
    tours_b2: "Last minute and first minute at great prices",
    tours_b3: "Same prices as booking directly with the agency",
    tours_b4: "Verified reviews and insolvency protection",
    tours_cta_lm: "Search Last minute", tours_cta_fm: "First minute", tours_cta_all: "Browse all tours",
    tours_form_title: "Search a tour", tours_offers_title: "Featured deals",
    tours_note: "Opens Invia in a new tab.",
    hero_eyebrow: "Cheap flights · 300+ airlines",
    hero_title_pre: "Your journey", hero_title_mid: "starts", hero_title_accent: "here.",
    hero_lead: "Compare hundreds of airlines at once and book your flight at the best price. No hidden fees, in euros.",
    trip_round: "Round trip", trip_oneway: "One way",
    f_from: "From", f_to: "To", f_depart: "Departure", f_return: "Return", f_pax: "Passengers",
    swap_aria: "Swap",
    adults_1: "1 adult", adults_2: "2 adults", adults_3: "3 adults", adults_4: "4 adults",
    search_btn: "Search flights →",
    hint_fromto: "Enter where you're flying from and to.", hint_depart: "Select a departure date.",
    chips_label: "Popular:",
    pop_prg_lon: "Prague → London", pop_prg_bcn: "Prague → Barcelona", pop_bts_lon: "Bratislava → London",
    pop_vie_fco: "Vienna → Rome", pop_vie_cdg: "Vienna → Paris",
    why_aria: "Why MaxiSky",
    why1_h: "300+ airlines", why1_p: "We compare hundreds of carriers at once",
    why2_h: "No hidden fees", why2_p: "The price you see is the price you pay",
    why3_h: "Secure booking", why3_p: "You buy from verified sellers",
    why4_h: "Fast and free", why4_p: "Our service costs you nothing extra",
    val1_h: "300+ airlines at once", val1_p: "A single search compares full-service and low-cost carriers and finds the cheapest combination.",
    val2_h: "Prices in euros, no surcharges", val2_p: "You see a fair price upfront. No hidden fees at the end of booking.",
    val3_h: "Book in a few minutes", val3_p: "Pick a flight and complete the booking directly with a verified seller. Fast and secure.",
    dst_h: "Popular destinations", dst_sub: "Click to search flights",
    dest_LON: "London", dest_BCN: "Barcelona", dest_FCO: "Rome", dest_CDG: "Paris",
    faq_h: "FAQ", faq_sub: "Everything you need to know",
    faq_q_0: "How does MaxiSky work?",
    faq_a_0: "We compare offers from 300+ airlines and sellers and redirect you to the best one. You complete the booking directly with the seller.",
    faq_q_1: "Do I pay MaxiSky any fee?",
    faq_a_1: "No. Our service is completely free for you — you only pay the ticket price at the seller.",
    faq_q_2: "What currency are the prices in?",
    faq_a_2: "We show prices in euros (€).",
    faq_q_3: "How do I pay and where do I get my ticket?",
    faq_a_3: "Payment and the ticket are handled by the seller we redirect you to. They will email you the ticket.",
    faq_q_4: "Can I search round-trip flights too?",
    faq_a_4: "Yes — both one-way and round-trip flights.",
    ft_slogan: "Cheap flights for your travels.",
    ft_terms: "Terms & Conditions", ft_privacy: "Privacy Policy", ft_cookies: "Cookie Policy",
    ft_cars: "Car rental — DiscoverCars",
    ft_copy: "© 2026 MaxiSky · Flight comparison",
  },
};

function getInitialLang() {
  try {
    const saved = localStorage.getItem("maxisky_lang");
    if (saved && translations[saved]) return saved;
  } catch (e) { /* localStorage unavailable */ }
  return "cs";
}

function getInitialPage() {
  try {
    const h = (window.location.hash || "").replace("#", "");
    if (h === "auto" || h === "stay" || h === "tours") return h;
  } catch (e) { /* no location */ }
  return "flights";
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@600&display=swap');

.mx { --navy:#15202C; --navy2:#1C2A3A; --navy3:#22344A; --green:#3B82F6;
  --green-d:#2563EB; --white:#FFFFFF; --mist:#94A4B6; --field:#FFFFFF;
  --ink:#15202C; --line:rgba(255,255,255,.10); --line2:rgba(255,255,255,.16);
  font-family:'Inter',system-ui,sans-serif; color:var(--white);
  background:var(--navy); min-height:100%; box-sizing:border-box; overflow-x:hidden; }
.mx *, .mx *::before, .mx *::after { box-sizing:border-box; }
.mx button { font-family:inherit; cursor:pointer; }
.disp { font-family:'Sora',sans-serif; }
.mono { font-family:'JetBrains Mono',monospace; }

/* ── nav ── */
.nav { max-width:1140px; margin:0 auto; padding:20px 22px;
  display:flex; align-items:center; gap:18px; }
.logo { display:flex; align-items:center; gap:10px; font-family:'Sora';
  font-weight:700; font-size:21px; letter-spacing:-.4px; }
.logo .pin { width:30px; height:30px; border-radius:9px; display:grid; place-items:center;
  background:var(--green); color:var(--navy); font-size:16px;
  box-shadow:0 4px 14px rgba(79,203,110,.35); }
.logo .pin .plane { display:inline-block; transform:rotate(-45deg); }
.logo .word { letter-spacing:-.4px; }
.logo .word .hl { color:var(--green); }
.nav-sp { flex:1; }
.nav-meta { font-size:13px; color:var(--mist); font-weight:600; letter-spacing:.3px; }
.nav-meta b { color:var(--white); }
.nav-link {
  background: transparent !important;
  color: #ffffff !important;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.nav-link:hover {
  background: rgba(255,255,255,.10) !important;
}
.nav-link.on {
  background: transparent !important;
  border: 1px solid rgba(255,255,255,.65) !important;
}
.lang { position:relative; }
.lang-btn { font-size:13px; color:var(--mist); font-weight:600; letter-spacing:.3px;
  background:transparent; border:1px solid var(--line2); border-radius:9px; padding:8px 12px;
  display:flex; align-items:center; gap:7px; transition:.15s; }
.lang-btn b { color:var(--white); }
.lang-btn:hover { border-color:var(--green); }
.lang-btn .caret { font-size:9px; line-height:1; color:var(--mist); transition:transform .15s; }
.lang-btn.open .caret { transform:rotate(180deg); }
.lang-menu { position:absolute; top:calc(100% + 6px); right:0; z-index:30;
  background:var(--navy2); border:1px solid var(--line2); border-radius:11px; padding:6px;
  min-width:152px; box-shadow:0 16px 38px rgba(0,0,0,.42);
  display:flex; flex-direction:column; gap:2px; }
.lang-menu button { text-align:left; font-size:13.5px; font-weight:600; color:var(--mist);
  background:transparent; border:none; border-radius:8px; padding:9px 12px; transition:.15s; }
.lang-menu button:hover { color:var(--white); background:rgba(255,255,255,.06); }
.lang-menu button.on { color:var(--white); background:rgba(59,130,246,.16); }

/* ── hero ── */
.hero { position:relative; max-width:1140px; margin:0 auto; padding:38px 22px 8px; }
.arc { position:absolute; inset:0; width:100%; height:100%; pointer-events:none;
  opacity:.55; z-index:0; }
.arc path { stroke:var(--green); stroke-width:2; fill:none; stroke-dasharray:5 9;
  stroke-linecap:round; }
.arc .plane { fill:var(--green); }
@keyframes draw { from { stroke-dashoffset:1400; } to { stroke-dashoffset:0; } }
.arc .trace { stroke-dasharray:1400; stroke-dashoffset:1400; animation:draw 2.2s ease forwards; }

.hero-in { position:relative; z-index:1; max-width:680px; }
.eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:12px; font-weight:600;
  letter-spacing:.6px; text-transform:uppercase; color:var(--green);
  background:rgba(79,203,110,.10); border:1px solid rgba(79,203,110,.28);
  padding:6px 12px; border-radius:999px; margin-bottom:20px; }
.h1 { font-family:'Sora'; font-weight:800; font-size:clamp(34px,5.4vw,56px); line-height:1.04;
  letter-spacing:-1.4px; margin:0 0 16px; color:var(--white); }
.h1 .accent { color:var(--green); }
.lead { font-size:17px; line-height:1.5; color:var(--mist); margin:0 0 30px; max-width:540px; }

/* ── search panel ── */
.panel { position:relative; z-index:1; max-width:1140px; margin:8px auto 0; padding:0 22px; }
.panel-card { background:rgba(28,42,58,.72); backdrop-filter:blur(8px);
  border:1px solid var(--line2); border-radius:20px; padding:18px;
  box-shadow:0 24px 60px rgba(0,0,0,.34); }
.trip { display:flex; gap:8px; margin-bottom:14px; }
.trip button { font-size:13px; font-weight:600; color:var(--mist); background:transparent;
  border:1px solid var(--line2); border-radius:999px; padding:7px 14px; transition:.15s; }
.trip button.on { color:#fff; background:var(--green); border-color:var(--green); }

.row { display:grid; grid-template-columns:1fr 44px 1fr; gap:10px; margin-bottom:10px; }
.row.two { grid-template-columns:1fr 1fr; }
.row.three { grid-template-columns:1.4fr 1fr auto; }
.fld { background:var(--field); border-radius:13px; padding:10px 14px; position:relative;
  border:1.5px solid transparent; transition:border-color .15s; }
.fld:focus-within { border-color:var(--green); }
.fld label { display:block; font-size:10.5px; font-weight:600; letter-spacing:.5px;
  text-transform:uppercase; color:#8893A1; margin-bottom:2px; }
.fld input, .fld select { width:100%; border:none; outline:none; background:transparent;
  color:var(--ink); font-size:16px; font-weight:600; font-family:inherit; padding:0; }
.fld input.code { font-family:'JetBrains Mono'; letter-spacing:1px; text-transform:uppercase; }
.fld input::placeholder { color:#B8C0CA; font-weight:500; }
.swap { align-self:center; width:44px; height:44px; border-radius:50%; flex-shrink:0;
  background:var(--navy3); color:var(--green); border:1px solid var(--line2);
  display:grid; place-items:center; font-size:17px; transition:.15s; }
.swap:hover { background:var(--green); color:#fff; transform:rotate(180deg); }

.go { width:100%; padding:16px; border-radius:14px; border:none; background:var(--green);
  color:#fff; font-family:'Sora'; font-weight:700; font-size:17px; letter-spacing:-.2px;
  margin-top:6px; transition:.15s; display:flex; align-items:center; justify-content:center; gap:9px; }
.go:hover { background:var(--green-d); transform:translateY(-1px); }
.go:focus-visible { outline:3px solid #fff; outline-offset:2px; }
.hint { color:#E98C8C; font-size:12.5px; font-weight:600; margin:10px 2px 0; min-height:1px; }

/* ── chips ── */
.chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; align-items:center; }
.chips .lbl { font-size:12px; color:var(--mist); font-weight:600; margin-right:2px; }
.chip { font-size:12.5px; font-weight:600; color:#CAD4DF; background:rgba(255,255,255,.05);
  border:1px solid var(--line2); border-radius:999px; padding:7px 13px; transition:.15s; cursor:pointer; }
.chip:hover { color:#fff; background:var(--green); border-color:var(--green); }

/* ── auto a karavan ── */
.auto { max-width:1140px; margin:54px auto 0; padding:0 22px; }
.auto-h { font-family:'Sora'; font-weight:700; font-size:26px; letter-spacing:-.6px;
  margin:0 0 8px; color:var(--white); }
.auto-sub { font-size:15px; color:var(--mist); margin:0 0 20px; line-height:1.5; max-width:600px; }
.auto-card { background:var(--navy2); border:1px solid var(--line); border-radius:20px;
  padding:30px 26px; }
.auto-frame { padding:14px; margin-bottom:14px; }
.auto-label { display:block; font-size:10.5px; font-weight:600; letter-spacing:.5px;
  text-transform:uppercase; color:var(--mist); margin:0 0 8px; }
.auto-row { display:flex; flex-wrap:wrap; align-items:stretch; gap:10px; }
.auto-select { flex:1; min-width:220px; background:var(--navy3); color:var(--white);
  border:1px solid var(--line2); border-radius:13px; padding:13px 14px;
  font-family:inherit; font-size:15px; font-weight:600; outline:none; transition:border-color .15s; }
.auto-select:focus { border-color:var(--green); }
.auto-primary { display:inline-flex; align-items:center; justify-content:center;
  padding:14px 26px; border-radius:13px; background:var(--green); color:#fff; border:none;
  font-family:'Sora'; font-weight:700; font-size:16px; letter-spacing:-.2px;
  text-decoration:none; transition:.15s; }
.auto-primary:hover { background:var(--green-d); transform:translateY(-1px); }
.auto-note { font-size:12.5px; color:var(--mist); margin:14px 0 0; }

/* ── ubytovanie (stay) ── */
.stay-badge { display:inline-block; font-size:11px; font-weight:700; letter-spacing:.8px;
  text-transform:uppercase; color:var(--green); background:rgba(59,130,246,.12);
  border:1px solid rgba(59,130,246,.28); padding:6px 12px; border-radius:999px; margin-bottom:16px; }
.stay-preview { margin:22px 0 24px; border:1px solid var(--line2); border-radius:16px;
  overflow:hidden; background:var(--navy3); box-shadow:0 16px 40px rgba(0,0,0,.30); }
.stay-preview-bar { display:flex; align-items:baseline; gap:12px; flex-wrap:wrap;
  padding:16px 20px; border-bottom:1px solid var(--line2); background:var(--navy2); }
.stay-logo { font-family:'Sora'; font-weight:800; font-size:24px; letter-spacing:-.5px; color:#1d62f0; }
.stay-brand-sub { font-size:12.5px; color:var(--mist); font-weight:500; }
.stay-preview-body { display:grid; place-items:center; min-height:200px; padding:30px 20px;
  text-align:center; color:#5b6b7e; font-family:'Sora'; font-weight:600; font-size:15px;
  background:linear-gradient(150deg,#e8eef6,#cdd9ea); }
.stay-why-title { font-family:'Sora'; font-weight:700; font-size:17px; letter-spacing:-.3px;
  color:var(--white); margin:0 0 14px; }
.stay-why { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:0 0 24px; }
.stay-why-item { display:flex; align-items:flex-start; gap:11px;
  background:var(--navy3); border:1px solid var(--line); border-radius:13px; padding:14px 16px;
  color:var(--white); font-size:14px; line-height:1.4; }
.stay-why-item svg { width:20px; height:20px; flex-shrink:0; color:var(--green); margin-top:1px; }
.stay-cta { display:inline-flex; align-items:center; justify-content:center;
  padding:14px 26px; border-radius:13px; background:var(--green); color:#fff;
  font-family:'Sora'; font-weight:700; font-size:16px; letter-spacing:-.2px;
  text-decoration:none; transition:.15s; }
.stay-cta:hover { background:var(--green-d); transform:translateY(-1px); }
.tours-cats { display:flex; flex-wrap:wrap; gap:10px; margin:18px 0; }
.tours-cats .stay-cta { flex:1; min-width:180px; }
.tours-form-box { background:var(--navy2); border:1px solid var(--line); border-radius:16px;
  padding:22px 20px; margin:0 0 22px; }
.tours-form-box .stay-why-title { margin:0 0 16px; }
.tours-offers { margin:0 0 24px; }
.tours-offers .stay-why-title { margin:0 0 14px; }

/* ── value strip ── */
.vals { max-width:1140px; margin:54px auto 0; padding:0 22px;
  display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.val { background:var(--navy2); border:1px solid var(--line); border-radius:16px; padding:20px; }
.val .ic { width:40px; height:40px; border-radius:11px; display:grid; place-items:center;
  background:rgba(79,203,110,.12); color:var(--green); font-size:19px; margin-bottom:12px; }
.val h3 { font-family:'Sora'; font-weight:600; font-size:16px; margin:0 0 5px; }
.val p { font-size:13.5px; color:var(--mist); margin:0; line-height:1.45; }

/* ── destinations ── */
.dst-wrap { max-width:1140px; margin:60px auto 0; padding:0 22px; }
.sec-h { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:18px; }
.sec-h h2 { font-family:'Sora'; font-weight:700; font-size:24px; letter-spacing:-.6px; margin:0; color:var(--white); }
.sec-h span { font-size:13px; color:var(--mist); }
.dst-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.dst { border-radius:16px; overflow:hidden; border:1px solid var(--line2); text-align:left;
  padding:0; background:var(--navy2); transition:.16s; }
.dst:hover { transform:translateY(-3px); box-shadow:0 16px 36px rgba(0,0,0,.34); }
.dst .img { height:120px; position:relative; }
.dst .img .code { position:absolute; top:10px; right:12px; font-family:'JetBrains Mono';
  font-size:11px; font-weight:600; color:#fff; background:rgba(0,0,0,.28);
  padding:3px 8px; border-radius:6px; }
.dst .meta { padding:13px 15px; display:flex; align-items:center; justify-content:space-between; }
.dst .meta .city { font-family:'Sora'; font-weight:600; font-size:15px; color:#fff; }
.dst .meta .arr { color:var(--green); font-size:16px; }

/* ── why (pás dôvery) ── */
.why { max-width:1140px; margin:46px auto 0; padding:0 22px;
  display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.why-it { background:var(--navy2); border:1px solid var(--line); border-radius:16px;
  padding:22px 18px; text-align:left; }
.why-it .ic { width:46px; height:46px; border-radius:50%; display:grid; place-items:center;
  background:rgba(59,130,246,.12); color:var(--green); margin-bottom:14px; }
.why-it .ic svg { width:23px; height:23px; }
.why-it h3 { font-family:'Sora'; font-weight:700; font-size:15px; margin:0 0 5px; color:var(--white); }
.why-it p { font-size:13px; color:var(--mist); margin:0; line-height:1.45; }

/* ── faq (akordeón) ── */
.faq { max-width:780px; margin:64px auto 0; padding:0 22px; }
.faq-list { display:flex; flex-direction:column; gap:12px; margin-top:18px; }
.faq-it { background:var(--navy2); border:1px solid var(--line); border-radius:16px; overflow:hidden; }
.faq-it.open { border-color:var(--line2); }
.faq-q { width:100%; background:transparent; border:none; text-align:left; color:var(--white);
  font-family:'Sora'; font-weight:600; font-size:15.5px; line-height:1.35;
  padding:18px 20px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
.faq-q .sign { color:var(--green); font-size:23px; line-height:1; flex-shrink:0;
  transition:transform .2s ease; }
.faq-it.open .faq-q .sign { transform:rotate(45deg); }
.faq-a { max-height:0; overflow:hidden; transition:max-height .25s ease, padding .25s ease; padding:0 20px; }
.faq-it.open .faq-a { max-height:260px; padding:0 20px 18px; }
.faq-a p { font-size:14px; color:var(--mist); margin:0; line-height:1.55; }

/* ── site footer (pätička) ── */
.site-ft { background:var(--navy2); border-top:1px solid var(--line); margin-top:70px; }
.site-ft-in { max-width:1140px; margin:0 auto; padding:46px 22px 26px;
  display:flex; justify-content:space-between; gap:34px; flex-wrap:wrap; }
.site-ft .brand .logo { font-size:19px; margin-bottom:11px; }
.site-ft .brand p { font-size:13.5px; color:var(--mist); margin:0; max-width:280px; }
.site-ft-links { display:flex; flex-direction:column; gap:11px; }
.site-ft-links a { color:var(--mist); font-size:13.5px; font-weight:500; text-decoration:none; transition:.15s; }
.site-ft-links a:hover { color:var(--white); }
.site-ft-bot { border-top:1px solid var(--line); }
.site-ft-bot div { max-width:1140px; margin:0 auto; padding:18px 22px 38px; }
.site-ft-bot p { font-size:12.5px; color:var(--mist); margin:0; }

@media (max-width:780px){
  .vals { grid-template-columns:1fr; }
  .dst-grid { grid-template-columns:1fr 1fr; }
  .why { grid-template-columns:1fr 1fr; }
  .stay-why { grid-template-columns:1fr; }
  .tours-cats { flex-direction:column; }
  .tours-cats a { width:100%; }
  .row, .row.two, .row.three { grid-template-columns:1fr; }
  .swap { justify-self:center; transform:rotate(90deg); }
  .swap:hover { transform:rotate(270deg); }
  .site-ft-in { flex-direction:column; gap:26px; }
}
@media (prefers-reduced-motion: reduce){
  .mx *{ transition:none !important; }
  .arc .trace{ animation:none; stroke-dashoffset:0; }
}
`;

export default function App() {
  const [oneWay, setOneWay] = useState(false);
  const [from, setFrom] = useState("BTS");
  const [to, setTo] = useState("LON");
  const [depart, setDepart] = useState("2026-07-14");
  const [ret, setRet] = useState("2026-07-21");
  const [adults, setAdults] = useState(1);
  const [hint, setHint] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [lang, setLang] = useState(getInitialLang);
  const [langOpen, setLangOpen] = useState(false);
  const [autoCity, setAutoCity] = useState(AUTO_CITIES[0].url);
  const [page, setPage] = useState(getInitialPage);
  const formRef = useRef(null);
  const langRef = useRef(null);

  const t = (key) =>
    (translations[lang] && translations[lang][key]) || translations.cs[key] || key;

  const changeLang = (l) => {
    setLang(l);
    try { localStorage.setItem("maxisky_lang", l); } catch (e) { /* ignore */ }
    setLangOpen(false);
  };

  // klik mimo prepínača jazyka ho zatvorí
  useEffect(() => {
    if (!langOpen) return;
    const onDoc = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [langOpen]);

  const currentShort = (LANGS.find((l) => l.code === lang) || LANGS[0]).short;

  // page <-> URL hash synchronizácia
  useEffect(() => {
    try {
      window.location.hash = page === "flights" ? "" : page;
    } catch (e) { /* ignore */ }
  }, [page]);

  useEffect(() => {
    const onHash = () => setPage(getInitialPage());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const swap = () => { setFrom(to); setTo(from); };

  const search = () => {
    if (!from.trim() || !to.trim()) { setHint(t("hint_fromto")); return; }
    if (!depart) { setHint(t("hint_depart")); return; }
    setHint("");
    const url = buildWlUrl({ from, to, depart, ret: oneWay ? "" : ret, adults });
    window.location.href = url;
  };

  const pick = (f, t) => {
    setFrom(f);
    setTo(t);
    setHint("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Karta destinácie: nastaví IBA cieľ (Kam), origin nechá na zákazníka.
  const pickDest = (code) => {
    setTo(code);
    setHint("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="mx">
      <style>{STYLES}</style>

      {/* nav */}
      <nav className="nav">
        <button className="logo" type="button" onClick={() => setPage("flights")}
          style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>
          <img src="/logo.svg" alt="MaxiSky" style={{ height: 40, width: "auto", display: "block" }} />
        </button>
        <span className="nav-sp" />
        <button className={"nav-link" + (page === "flights" ? " on" : "")} type="button"
          onClick={() => setPage("flights")}>{t("nav_flights")}</button>
        <button className={"nav-link" + (page === "auto" ? " on" : "")} type="button"
          onClick={() => setPage("auto")}>{t("nav_auto")}</button>
        <button className={"nav-link" + (page === "stay" ? " on" : "")} type="button"
          onClick={() => setPage("stay")}>{t("nav_stay")}</button>
        <button className={"nav-link" + (page === "tours" ? " on" : "")} type="button"
          onClick={() => setPage("tours")}>{t("nav_tours")}</button>
        <div className="lang" ref={langRef}>
          <button className={"lang-btn" + (langOpen ? " open" : "")} aria-haspopup="true"
            aria-expanded={langOpen} onClick={() => setLangOpen((o) => !o)}>
            <span><b>{currentShort}</b> · <b>EUR</b></span>
            <span className="caret" aria-hidden="true">▾</span>
          </button>
          {langOpen && (
            <div className="lang-menu" role="menu">
              {LANGS.map((l) => (
                <button key={l.code} role="menuitem"
                  className={l.code === lang ? "on" : ""}
                  onClick={() => changeLang(l.code)}>
                  {t(l.labelKey)}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {page === "flights" && (
      <>
      {/* hero */}
      <header className="hero">
        <svg className="arc" viewBox="0 0 1140 360" preserveAspectRatio="none" aria-hidden="true">
          <path className="trace" d="M60,300 Q570,40 1090,150" />
          <circle className="plane" cx="60" cy="300" r="4" />
          <g transform="translate(1078,150) rotate(28)">
            <path className="plane" d="M0,-7 L14,0 L0,7 L4,0 Z" />
          </g>
        </svg>
        <div className="hero-in">
          <span className="eyebrow">✦ {t("hero_eyebrow")}</span>
          <h1 className="h1">{t("hero_title_pre")}<br />{t("hero_title_mid")} <span className="accent">{t("hero_title_accent")}</span></h1>
          <p className="lead">{t("hero_lead")}</p>
        </div>
      </header>

      {/* search */}
      <section className="panel" ref={formRef}>
        <div className="panel-card">
          <div className="trip">
            <button className={oneWay ? "" : "on"} onClick={() => setOneWay(false)}>{t("trip_round")}</button>
            <button className={oneWay ? "on" : ""} onClick={() => setOneWay(true)}>{t("trip_oneway")}</button>
          </div>

          <div className="row">
            <div className="fld">
              <label>{t("f_from")}</label>
              <input className="code" value={from} maxLength={3}
                onChange={(e) => setFrom(e.target.value)} placeholder="ZAG" />
            </div>
            <button className="swap" onClick={swap} aria-label={t("swap_aria")}>⇄</button>
            <div className="fld">
              <label>{t("f_to")}</label>
              <input className="code" value={to} maxLength={3}
                onChange={(e) => setTo(e.target.value)} placeholder="LON" />
            </div>
          </div>

          <div className={"row " + (oneWay ? "two" : "three")}>
            <div className="fld">
              <label>{t("f_depart")}</label>
              <input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} />
            </div>
            {!oneWay && (
              <div className="fld">
                <label>{t("f_return")}</label>
                <input type="date" value={ret} onChange={(e) => setRet(e.target.value)} />
              </div>
            )}
            <div className="fld">
              <label>{t("f_pax")}</label>
              <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                <option value={1}>{t("adults_1")}</option>
                <option value={2}>{t("adults_2")}</option>
                <option value={3}>{t("adults_3")}</option>
                <option value={4}>{t("adults_4")}</option>
              </select>
            </div>
          </div>

          <button className="go" onClick={search}>{t("search_btn")}</button>
          <div className="hint">{hint}</div>

          <div className="chips">
            <span className="lbl">{t("chips_label")}</span>
            {POPULAR.map((p) => (
              <button key={p.key} className="chip" onClick={() => pick(p.from, p.to)}>{t(p.key)}</button>
            ))}
          </div>
        </div>
      </section>

      {/* prečo MaxiSky — pás dôvery */}
      <section className="why" aria-label={t("why_aria")}>
        <div className="why-it">
          <div className="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5S18 3 16.5 4.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>
          </div>
          <h3>{t("why1_h")}</h3>
          <p>{t("why1_p")}</p>
        </div>
        <div className="why-it">
          <div className="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M15.5 9.3A4 4 0 0 0 9 12a4 4 0 0 0 6.5 2.7"/>
              <path d="M7 11h5"/><path d="M7 13.2h4"/>
            </svg>
          </div>
          <h3>{t("why2_h")}</h3>
          <p>{t("why2_p")}</p>
        </div>
        <div className="why-it">
          <div className="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <h3>{t("why3_h")}</h3>
          <p>{t("why3_p")}</p>
        </div>
        <div className="why-it">
          <div className="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M13 2 3 14h8l-1 8 11-13h-8l1-7z"/>
            </svg>
          </div>
          <h3>{t("why4_h")}</h3>
          <p>{t("why4_p")}</p>
        </div>
      </section>

      {/* value props */}
      <section className="vals">
        <div className="val">
          <div className="ic">◎</div>
          <h3>{t("val1_h")}</h3>
          <p>{t("val1_p")}</p>
        </div>
        <div className="val">
          <div className="ic">€</div>
          <h3>{t("val2_h")}</h3>
          <p>{t("val2_p")}</p>
        </div>
        <div className="val">
          <div className="ic">⚡</div>
          <h3>{t("val3_h")}</h3>
          <p>{t("val3_p")}</p>
        </div>
      </section>

      {/* destinations */}
      <section className="dst-wrap">
        <div className="sec-h">
          <h2>{t("dst_h")}</h2>
          <span>{t("dst_sub")}</span>
        </div>
        <div className="dst-grid">
          {DESTS.map((d) => (
            <button key={d.code} className="dst" type="button"
              role="button" tabIndex={0} style={{ cursor: "pointer" }}
              onClick={() => pickDest(d.code)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickDest(d.code); }
              }}>
              <div className="img" style={{
                backgroundImage: `linear-gradient(rgba(21,32,44,0.15), rgba(21,32,44,0.85)), url('/destinations/${d.code}.jpg'), ${d.g}`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}>
                <span className="code">{d.code}</span>
              </div>
              <div className="meta">
                <span className="city">{t("dest_" + d.code)}</span>
                <span className="arr">→</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* časté otázky — akordeón */}
      <section className="faq">
        <div className="sec-h">
          <h2>{t("faq_h")}</h2>
          <span>{t("faq_sub")}</span>
        </div>
        <div className="faq-list">
          {FAQ_KEYS.map((i) => {
            const open = openFaq === i;
            return (
              <div key={i} className={"faq-it" + (open ? " open" : "")}>
                <button className="faq-q" aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}>
                  <span>{t("faq_q_" + i)}</span>
                  <span className="sign" aria-hidden="true">+</span>
                </button>
                <div className="faq-a">
                  <p>{t("faq_a_" + i)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      </>
      )}

      {/* podstránka AUTO */}
      {page === "auto" && (
      <section className="auto" id="auto">
        <h2 className="auto-h">{t("auto_title")}</h2>
        <p className="auto-sub">{t("auto_sub")}</p>
        <div className="auto-card auto-frame">
          <iframe src="https://www.discovercars.com/?a_aid=maxisky" title="DiscoverCars"
            loading="lazy"
            style={{ width: "100%", height: 560, border: 0, borderRadius: 16, display: "block" }} />
          <p className="auto-note">{t("auto_iframe_note")}</p>
        </div>
        <div className="auto-card">
          <label className="auto-label" htmlFor="dcCity">{t("auto_pick")}</label>
          <div className="auto-row">
            <select id="dcCity" className="auto-select" value={autoCity}
              onChange={(e) => setAutoCity(e.target.value)}>
              {AUTO_CITIES.map((c) => (
                <option key={c.url} value={c.url}>{c.labelKey ? t(c.labelKey) : c.label}</option>
              ))}
            </select>
            <button className="auto-primary" type="button"
              onClick={() => window.open(autoCity, "_blank", "noopener")}>{t("auto_btn")}</button>
          </div>
          <p className="auto-note">{t("auto_note")}</p>
        </div>
      </section>
      )}

      {/* podstránka UBYTOVANIE */}
      {page === "stay" && (
      <section className="auto">
        <div className="auto-card">
          <span className="stay-badge">{t("stay_badge")}</span>
          <h2 className="auto-h">{t("stay_title")}</h2>
          <p className="auto-sub">{t("stay_desc")}</p>

          <div className="stay-preview">
            <div className="stay-preview-bar">
              <span className="stay-logo">agoda</span>
              <span className="stay-brand-sub">{t("stay_brand_sub")}</span>
            </div>
            <a href={AGODA_URL} target="_blank" rel="sponsored noopener">
              <img src="/agoda-destinations.png" alt="Agoda"
                style={{ width: "100%", display: "block", borderRadius: "12px" }} loading="lazy" />
            </a>
          </div>

          <h3 className="stay-why-title">{t("stay_why_title")}</h3>
          <div className="stay-why">
            {["stay_b1", "stay_b2", "stay_b3", "stay_b4"].map((k) => (
              <div key={k} className="stay-why-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>{t(k)}</span>
              </div>
            ))}
          </div>

          <a className="stay-cta" href={AGODA_URL} target="_blank" rel="sponsored noopener">{t("stay_cta")}</a>
          <p className="auto-note">{t("stay_note")}</p>
        </div>
      </section>
      )}

      {/* podstránka CESTOVKY / LAST MINUTE */}
      {page === "tours" && (
      <section className="auto">
        <div className="auto-card">
          <span className="stay-badge">{t("tours_badge")}</span>
          <h2 className="auto-h">{t("tours_title")}</h2>
          <p className="auto-sub">{t("tours_desc")}</p>

          <div className="tours-cats">
            <a className="stay-cta" href={INVIA_LASTMINUTE} target="_blank" rel="sponsored noopener">{t("tours_cta_lm")}</a>
            <a className="stay-cta" href={INVIA_FIRSTMINUTE} target="_blank" rel="sponsored noopener">{t("tours_cta_fm")}</a>
            <a className="stay-cta" href={INVIA_URL} target="_blank" rel="sponsored noopener">{t("tours_cta_all")}</a>
          </div>

          <div className="tours-form-box">
            <h3 className="stay-why-title">{t("tours_form_title")}</h3>
            <iframe src={INVIA_FORM} title="Invia vyhledávání" width="300" height="250" scrolling="no" frameBorder="0"
              style={{ border: "none", overflow: "hidden", display: "block", margin: "0 auto", maxWidth: "100%" }} />
          </div>

          <div className="tours-offers">
            <h3 className="stay-why-title">{t("tours_offers_title")}</h3>
            <iframe src={INVIA_BANNER} title="Invia" width="955" height="100" scrolling="no" frameBorder="0"
              style={{ width: "100%", maxWidth: "955px", height: "100px", border: "none", overflow: "hidden", display: "block", margin: "0 auto" }} />
          </div>

          <h3 className="stay-why-title">{t("tours_why_title")}</h3>
          <div className="stay-why">
            {["tours_b1", "tours_b2", "tours_b3", "tours_b4"].map((k) => (
              <div key={k} className="stay-why-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>{t(k)}</span>
              </div>
            ))}
          </div>

          <p className="auto-note">{t("tours_note")}</p>
        </div>
      </section>
      )}

      {/* pätička */}
      <footer className="site-ft">
        <div className="site-ft-in">
          <div className="brand">
            <div className="logo"><span className="pin"><span className="plane">✈</span></span><span className="word">Maxi<span className="hl">S</span>ky</span></div>
            <p>{t("ft_slogan")}</p>
          </div>
          <nav className="site-ft-links" aria-label={t("faq_h")}>
            <a href="/terms.html" target="_blank" rel="noopener">{t("ft_terms")}</a>
            <a href="/privacy.html" target="_blank" rel="noopener">{t("ft_privacy")}</a>
            <a href="/cookies.html" target="_blank" rel="noopener">{t("ft_cookies")}</a>
            <a href="https://www.discovercars.com/?a_aid=maxisky" target="_blank" rel="sponsored noopener">{t("ft_cars")}</a>
          </nav>
        </div>
        <div className="site-ft-bot">
          <div>
            <p>{t("ft_copy")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
