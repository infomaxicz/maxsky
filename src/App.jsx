import React, { useState, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// Skysell — maxisky.eu landing
// Tmavá námornícka + zelená (zladené s White Label fly.maxisky.eu).
// Formulár presmeruje na fly.maxisky.eu/flights/?origin_iata=…
// Marker je vo White Labeli zabudovaný → provízia ide automaticky.
// ─────────────────────────────────────────────────────────────

const WL = "https://fly.maxisky.eu/flights/";

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
  { from: "PRG", to: "LON", label: "Praha → Londýn" },
  { from: "PRG", to: "BCN", label: "Praha → Barcelona" },
  { from: "BTS", to: "LON", label: "Bratislava → Londýn" },
  { from: "VIE", to: "FCO", label: "Viedeň → Rím" },
  { from: "VIE", to: "CDG", label: "Viedeň → Paríž" },
];

const DESTS = [
  { city: "Londýn", code: "LON", g: "linear-gradient(150deg,#2b3a52,#46618c)" },
  { city: "Barcelona", code: "BCN", g: "linear-gradient(150deg,#3a4a3f,#5f8c6a)" },
  { city: "Rím", code: "FCO", g: "linear-gradient(150deg,#4a3f3a,#8c6f5f)" },
  { city: "Paríž", code: "CDG", g: "linear-gradient(150deg,#3a3f4a,#5f6a8c)" },
];

const FAQ = [
  { q: "Ako MaxiSky funguje?", a: "Porovnáme ponuky 300+ aerolínií a predajcov a presmerujeme ťa na tú najvýhodnejšiu. Rezerváciu dokončíš priamo u predajcu." },
  { q: "Platím MaxiSky nejaký poplatok?", a: "Nie. Naša služba je pre teba úplne zadarmo — platíš len cenu letenky u predajcu." },
  { q: "V akej mene sú ceny?", a: "Ceny zobrazujeme v eurách (€)." },
  { q: "Ako zaplatím a kde dostanem letenku?", a: "Platbu aj letenku vybavuje predajca, ku ktorému ťa presmerujeme. Letenku ti pošle e-mailom." },
  { q: "Dajú sa hľadať aj spiatočné lety?", a: "Áno — jednosmerné aj spiatočné lety." },
];

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
.nav-link { font-size:14px; color:var(--mist); font-weight:600; text-decoration:none;
  padding:8px 14px; border-radius:9px; border:1px solid var(--line2); transition:.15s; }
.nav-link:hover { color:var(--white); border-color:var(--green); }

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
  const formRef = useRef(null);

  const swap = () => { setFrom(to); setTo(from); };

  const search = () => {
    if (!from.trim() || !to.trim()) { setHint("Zadaj odkiaľ aj kam letíš."); return; }
    if (!depart) { setHint("Vyber dátum odletu."); return; }
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

  return (
    <div className="mx">
      <style>{STYLES}</style>

      {/* nav */}
      <nav className="nav">
        <div className="logo"><span className="pin"><span className="plane">✈</span></span><span className="word">Maxi<span className="hl">S</span>ky</span></div>
        <span className="nav-sp" />
        <span className="nav-meta"><b>SK</b> · <b>EUR</b></span>
        <a className="nav-link" href={WL}>Ubytovanie</a>
      </nav>

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
          <span className="eyebrow">✦ Lacné letenky · 300+ aeroliniek</span>
          <h1 className="h1">Vaša cesta<br />začína <span className="accent">tu.</span></h1>
          <p className="lead">Porovnaj stovky aeroliniek naraz a rezervuj letenku za najlepšiu cenu. Bez skrytých poplatkov, v eurách.</p>
        </div>
      </header>

      {/* search */}
      <section className="panel" ref={formRef}>
        <div className="panel-card">
          <div className="trip">
            <button className={oneWay ? "" : "on"} onClick={() => setOneWay(false)}>Spiatočne</button>
            <button className={oneWay ? "on" : ""} onClick={() => setOneWay(true)}>Jednosmerne</button>
          </div>

          <div className="row">
            <div className="fld">
              <label>Odkiaľ</label>
              <input className="code" value={from} maxLength={3}
                onChange={(e) => setFrom(e.target.value)} placeholder="ZAG" />
            </div>
            <button className="swap" onClick={swap} aria-label="Vymeniť">⇄</button>
            <div className="fld">
              <label>Kam</label>
              <input className="code" value={to} maxLength={3}
                onChange={(e) => setTo(e.target.value)} placeholder="LON" />
            </div>
          </div>

          <div className={"row " + (oneWay ? "two" : "three")}>
            <div className="fld">
              <label>Odlet</label>
              <input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} />
            </div>
            {!oneWay && (
              <div className="fld">
                <label>Návrat</label>
                <input type="date" value={ret} onChange={(e) => setRet(e.target.value)} />
              </div>
            )}
            <div className="fld">
              <label>Cestujúci</label>
              <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                <option value={1}>1 dospelý</option>
                <option value={2}>2 dospelí</option>
                <option value={3}>3 dospelí</option>
                <option value={4}>4 dospelí</option>
              </select>
            </div>
          </div>

          <button className="go" onClick={search}>Hľadať lety →</button>
          <div className="hint">{hint}</div>

          <div className="chips">
            <span className="lbl">Obľúbené:</span>
            {POPULAR.map((p) => (
              <button key={p.label} className="chip" onClick={() => pick(p.from, p.to)}>{p.label}</button>
            ))}
          </div>
        </div>
      </section>

      {/* prečo MaxiSky — pás dôvery */}
      <section className="why" aria-label="Prečo MaxiSky">
        <div className="why-it">
          <div className="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5S18 3 16.5 4.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>
          </div>
          <h3>300+ aerolínií</h3>
          <p>Porovnávame stovky dopravcov naraz</p>
        </div>
        <div className="why-it">
          <div className="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M15.5 9.3A4 4 0 0 0 9 12a4 4 0 0 0 6.5 2.7"/>
              <path d="M7 11h5"/><path d="M7 13.2h4"/>
            </svg>
          </div>
          <h3>Bez skrytých poplatkov</h3>
          <p>Cena, ktorú vidíš, je cena, ktorú platíš</p>
        </div>
        <div className="why-it">
          <div className="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <h3>Bezpečná rezervácia</h3>
          <p>Nakupuješ u overených predajcov</p>
        </div>
        <div className="why-it">
          <div className="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M13 2 3 14h8l-1 8 11-13h-8l1-7z"/>
            </svg>
          </div>
          <h3>Rýchlo a zdarma</h3>
          <p>Naša služba ťa nestojí nič navyše</p>
        </div>
      </section>

      {/* value props */}
      <section className="vals">
        <div className="val">
          <div className="ic">◎</div>
          <h3>300+ aeroliniek naraz</h3>
          <p>Jedno hľadanie porovná klasické aj nízkonákladové spoločnosti a nájde najlacnejšiu kombináciu.</p>
        </div>
        <div className="val">
          <div className="ic">€</div>
          <h3>Ceny v eurách, bez prirážok</h3>
          <p>Vidíš férovú cenu vopred. Žiadne skryté poplatky na konci rezervácie.</p>
        </div>
        <div className="val">
          <div className="ic">⚡</div>
          <h3>Rezervácia za pár minút</h3>
          <p>Vyber let a dokonči rezerváciu priamo u overeného predajcu. Rýchlo a bezpečne.</p>
        </div>
      </section>

      {/* destinations */}
      <section className="dst-wrap">
        <div className="sec-h">
          <h2>Obľúbené destinácie</h2>
          <span>Klikni a vyhľadaj lety</span>
        </div>
        <div className="dst-grid">
          {DESTS.map((d) => (
            <button key={d.code} className="dst" onClick={() => pick("BTS", d.code)}>
              <div className="img" style={{
                backgroundImage: `linear-gradient(rgba(21,32,44,0.15), rgba(21,32,44,0.85)), url('/destinations/${d.code}.jpg'), ${d.g}`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}>
                <span className="code">{d.code}</span>
              </div>
              <div className="meta">
                <span className="city">{d.city}</span>
                <span className="arr">→</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* časté otázky — akordeón */}
      <section className="faq">
        <div className="sec-h">
          <h2>Časté otázky</h2>
          <span>Všetko, čo potrebuješ vedieť</span>
        </div>
        <div className="faq-list">
          {FAQ.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q} className={"faq-it" + (open ? " open" : "")}>
                <button className="faq-q" aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}>
                  <span>{item.q}</span>
                  <span className="sign" aria-hidden="true">+</span>
                </button>
                <div className="faq-a">
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* pätička */}
      <footer className="site-ft">
        <div className="site-ft-in">
          <div className="brand">
            <div className="logo"><span className="pin"><span className="plane">✈</span></span><span className="word">Maxi<span className="hl">S</span>ky</span></div>
            <p>Lacné letenky pre tvoje cesty.</p>
          </div>
          <nav className="site-ft-links" aria-label="Pätička">
            <a href="#">O nás</a>
            <a href="#">Časté otázky</a>
            <a href="#">Ochrana súkromia</a>
            <a href="#">Kontakt</a>
          </nav>
        </div>
        <div className="site-ft-bot">
          <div>
            <p>© 2026 MaxiSky · Porovnávač leteniek</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
