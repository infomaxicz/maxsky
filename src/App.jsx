import React, { useState } from "react";

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
  border:1px solid var(--line2); border-radius:999px; padding:7px 13px; transition:.15s; }
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
.sec-h h2 { font-family:'Sora'; font-weight:700; font-size:24px; letter-spacing:-.6px; margin:0; }
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
.dst .meta .city { font-family:'Sora'; font-weight:600; font-size:15px; }
.dst .meta .arr { color:var(--green); font-size:16px; }

/* ── footer ── */
.ft { max-width:1140px; margin:66px auto 0; padding:26px 22px 40px;
  border-top:1px solid var(--line); display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.ft .logo { font-size:17px; }
.ft-sp { flex:1; }
.ft p { font-size:12.5px; color:var(--mist); margin:0; }
.ft a { color:var(--mist); font-size:12.5px; text-decoration:none; }
.ft a:hover { color:var(--white); }

@media (max-width:780px){
  .vals { grid-template-columns:1fr; }
  .dst-grid { grid-template-columns:1fr 1fr; }
  .row, .row.two, .row.three { grid-template-columns:1fr; }
  .swap { justify-self:center; transform:rotate(90deg); }
  .swap:hover { transform:rotate(270deg); }
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

  const swap = () => { setFrom(to); setTo(from); };

  const search = () => {
    if (!from.trim() || !to.trim()) { setHint("Zadaj odkiaľ aj kam letíš."); return; }
    if (!depart) { setHint("Vyber dátum odletu."); return; }
    setHint("");
    const url = buildWlUrl({ from, to, depart, ret: oneWay ? "" : ret, adults });
    window.location.href = url;
  };

  const pick = (f, t) => { setFrom(f); setTo(t); setHint(""); };

  return (
    <div className="mx">
      <style>{STYLES}</style>

      {/* nav */}
      <nav className="nav">
        <div className="logo"><span className="pin">✈</span><span className="word">Maxi<span className="hl">S</span>ky</span></div>
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
      <section className="panel">
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
              <div className="img" style={{ background: d.g }}>
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

      {/* footer */}
      <footer className="ft">
        <div className="logo"><span className="pin">✈</span><span className="word">Maxi<span className="hl">S</span>ky</span></div>
        <span className="ft-sp" />
        <p>Vyhľadávanie leteniek · powered by Travelpayouts</p>
      </footer>
    </div>
  );
}
