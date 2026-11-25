// Pronto Mestieri — prototipo. Base comune: stato, utilità, icone, fogli, router, splash e benvenuto.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $("#app");

const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#2453e6"/>
  <path d="M15 31 32 17l17 14v16a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
  <path d="M34 26 27 37h6l-2 8 8-12h-6z" fill="#fff"/></svg>`;

// ---------- icone (libreria Lucide) ----------
const ic = (nome, cls = "") => `<i data-lucide="${nome}" class="${cls}"></i>`;
const STELLA = ic("star");
const em = x => `<span class="emo" aria-hidden="true">${x.emoji}</span>`;
function disegnaIcone() { if (window.lucide) lucide.createIcons({ attrs: { "aria-hidden": "true" } }); }
let _icT = 0;
new MutationObserver(() => { cancelAnimationFrame(_icT); _icT = requestAnimationFrame(disegnaIcone); })
  .observe(document.body, { childList: true, subtree: true });

// ---------- stato salvato nel telefono ----------
function carica(k, def) { try { return JSON.parse(localStorage.getItem("pm_" + k)) ?? def; } catch { return def; } }
function salva(k, v) { try { localStorage.setItem("pm_" + k, JSON.stringify(v)); } catch {} }

let zona = carica("zona", null);
let richieste = carica("richieste", []);
let chat = carica("chat", {});
let mioProfilo = carica("artigiano", null);
let admin = carica("admin", { decisi: {} });
const salvaRichieste = () => { salva("richieste", richieste); contaBadge(); };

// ---------- utilità ----------
const cat = id => CATEGORIE.find(c => c.id === id);
const gruppo = id => GRUPPI.find(g => g.id === id);
const pro = id => ARTIGIANI.find(a => a.id === +id);
// colore delle icone: ogni gruppo ha la sua tinta, ogni mestiere una sfumatura diversa
const TINTE = { impianti: 212, edilizia: 24, infissi: 262, arredo: 38, riparazioni: 188, casa: 158, esterni: 128, auto: 352 };
const tintaGruppo = g => TINTE[g] ?? 220;
function tinta(id) {
  const c = cat(id); if (!c) return 220;
  const fratelli = CATEGORIE.filter(x => x.gruppo === c.gruppo);
  return (tintaGruppo(c.gruppo) + (fratelli.indexOf(c) - (fratelli.length - 1) / 2) * 7 + 360) % 360;
}
const iniziali = n => n.replace(/ (Srl|Snc|Srls|& Figli)$/, "").split(" ").filter(p => p.length > 1).map(p => p[0]).slice(-2).join("").toUpperCase();
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const euro = n => "€ " + n.toFixed(2).replace(".", ",");
const nomeBreve = a => a.tipo === "azienda" ? a.nome : a.nome.split(" ")[0];
const ora = () => new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
const voto = a => `<span class="stelle">${STELLA}${a.voto.toFixed(1).replace(".", ",")}</span>`;
const spunta = a => a.verificato ? `<span class="verif" title="Verificato">${ic("badge-check")}</span>` : "";
const tipoBadge = a => a.tipo === "azienda"
  ? `<span class="badge az">${ic("building-2")}Azienda · ${a.dipendenti} addetti</span>`
  : `<span class="badge grey">${ic("user-round")}Professionista</span>`;

const COLORI_AV = ["#334155", "#1e3a8a", "#3730a3", "#0f766e", "#7c2d12", "#4c1d95", "#155e75", "#1f2937"];
function avatar(a, size = "") {
  return `<div class="avatar ${size} ${a.tipo === "azienda" ? "az" : ""}" style="--av:${COLORI_AV[a.id % COLORI_AV.length]}">${iniziali(a.nome)}${a.disponibileOra ? '<i class="dot"></i>' : ""}</div>`;
}
function km(la1, lo1, la2, lo2) {
  const dx = (lo2 - lo1) * 81, dy = (la2 - la1) * 111;
  return Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy)));
}
const qui = () => COORD[zona.citta];
function distanza(a, da = qui()) { return km(da[0], da[1], a.lat, a.lng); }
function inZona(lista, da) {
  return lista.map(a => ({ ...a, dist: distanza(a, da) })).filter(a => a.provincia === zona.prov || a.dist <= a.raggioKm);
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("on");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("on"), 2600);
}
function apriFoglio(html, dopo) {
  $("#sheet").innerHTML = `<div class="grab"></div>` + html;
  $("#sheet").scrollTop = 0;
  requestAnimationFrame(() => { $("#sheet").classList.add("on"); $("#sheetBg").classList.add("on"); });
  if (dopo) dopo($("#sheet"));
}
function chiudiFoglio() { $("#sheet").classList.remove("on"); $("#sheetBg").classList.remove("on"); }
$("#sheetBg").onclick = chiudiFoglio;

// riduce una foto scelta dal telefono a una miniatura leggera
function miniatura(file, lato = 360) {
  return new Promise(ok => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, lato / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * s; c.height = img.height * s;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      ok(c.toDataURL("image/jpeg", .7)); URL.revokeObjectURL(img.src);
    };
    img.onerror = () => ok(null);
    img.src = URL.createObjectURL(file);
  });
}

// posizione GPS: restituisce [lat, lng] oppure null
function leggiPosizione() {
  return new Promise(ok => {
    if (!navigator.geolocation) return ok(null);
    navigator.geolocation.getCurrentPosition(p => ok([p.coords.latitude, p.coords.longitude]), () => ok(null), { timeout: 8000, enableHighAccuracy: true });
  });
}
const cittaVicina = pos => TUTTE_CITTA.map(c => ({ ...c, d: km(pos[0], pos[1], ...COORD[c.citta]) })).sort((a, b) => a.d - b.d)[0];

// ---------- zona ----------
function scegliZona(alPrimoAvvio) {
  apriFoglio(`<h3>Dove ti serve?</h3>
    <button class="btn sec press" id="gps">${ic("locate-fixed")} Usa la mia posizione</button>
    ${Object.entries(PROVINCE).map(([p, cc]) => `<div class="prov">Provincia di ${p}</div>
      <div class="chips wrap">${cc.map(c => `<button class="chip ${zona && c === zona.citta ? "on" : ""}" data-c="${esc(c)}" data-p="${esc(p)}">${c}</button>`).join("")}</div>`).join("")}`,
  el => {
    const imposta = (citta, prov) => {
      zona = { citta, prov }; salva("zona", zona); chiudiFoglio(); aggiornaZona();
      if (alPrimoAvvio) $(".onb")?.remove();
      render(); toast(`Zona impostata: ${citta}`);
    };
    $$("[data-c]", el).forEach(b => b.onclick = () => imposta(b.dataset.c, b.dataset.p));
    $("#gps", el).onclick = async () => {
      $("#gps", el).textContent = "Cerco la tua posizione…";
      const pos = await leggiPosizione();
      const v = pos && cittaVicina(pos);
      if (!v || v.d > 80) { toast(pos ? "Sei fuori dalle Marche: scegli una città dalla lista" : "Posizione non disponibile, scegli dalla lista"); $("#gps", el).innerHTML = `${ic("locate-fixed")} Usa la mia posizione`; return; }
      imposta(v.citta, v.prov);
    };
  });
}
$("#zonaBtn").onclick = () => scegliZona(false);
function aggiornaZona() { $("#zonaLabel").textContent = zona ? zona.citta : "Scegli"; }

// ---------- splash e benvenuto ----------
function splash() {
  return new Promise(fine => {
    let primaVolta = false;
    try { primaVolta = !sessionStorage.getItem("pm_splash"); sessionStorage.setItem("pm_splash", "1"); } catch {}
    if (!primaVolta) return fine();
    const nome = "Pronto Mestieri";
    const s = document.createElement("div");
    s.className = "splash";
    s.innerHTML = `<i class="glow"></i><div class="sp-in"><div class="mark">${LOGO}</div>
      <h1>${[...nome].map((l, i) => `<span style="--i:${i}">${l === " " ? "&nbsp;" : l}</span>`).join("")}</h1>
      <p>Il professionista giusto, quando serve</p><div class="bar"></div></div>`;
    document.body.appendChild(s);
    setTimeout(() => { s.classList.add("via"); fine(); setTimeout(() => s.remove(), 600); }, 1900);
  });
}
function benvenuto() {
  const o = document.createElement("div");
  o.className = "onb";
  o.innerHTML = `
    <div style="width:48px;height:48px;animation:pop .6s var(--spring) both">${LOGO}</div>
    <h1>Si è rotto qualcosa?<br><span class="grad-t">Arriva il migliore vicino a te.</span></h1>
    <p class="muted">In casa o per strada, nelle Marche. Aziende e professionisti verificati.</p>
    <div class="step3">
      <div style="--i:0"><span class="n">${ic("search")}</span><p style="margin:0"><b>Dici cosa è successo</b><span>Perdita d'acqua, gomma bucata, porta bloccata…</span></p></div>
      <div style="--i:1"><span class="n">${ic("sparkles")}</span><p style="margin:0"><b>Ti proponiamo il migliore</b><span>Il più vicino, libero e con le recensioni migliori</span></p></div>
      <div style="--i:2"><span class="n">${ic("navigation")}</span><p style="margin:0"><b>Lo segui mentre arriva</b><span>Prezzo indicativo e tempo d'arrivo prima di confermare</span></p></div>
    </div>
    <button class="btn press" id="inizia" style="animation:su .6s var(--ease) .5s both">Scegli la tua città ${ic("arrow-right")}</button>`;
  document.body.appendChild(o);
  $("#inizia", o).onclick = () => scegliZona(true);
}

// ---------- router ----------
const ROTTE = {};          // ogni file aggiunge le sue schermate: ROTTE.nome = { tab, html(arg), dopo(arg), esci() }
let paginaPrima = null, chiavePrima = null;
function render() {
  if (!zona) return;
  const h = location.hash.replace(/^#\/?/, "");
  const [sez = "", arg] = h.split("/");
  const r = ROTTE[sez] || ROTTE[""];
  const chiave = sez + "/" + (arg || "");
  const stessa = chiave === chiavePrima;   // stessa pagina ridisegnata (filtro, scelta…): niente effetto "ricarica"
  const y = window.scrollY;
  if (paginaPrima?.esci) paginaPrima.esci();
  app.innerHTML = r.html(arg && decodeURIComponent(arg));
  app.classList.remove("enter");
  app.classList.toggle("fermo", stessa);
  if (!stessa) { void app.offsetWidth; app.classList.add("enter"); }
  $$(".tabbar a").forEach(a => a.classList.toggle("on", a.dataset.tab === (r.tab || "home")));
  aggiornaFreccia();
  $("#brand").innerHTML = r.titolo ? `<span>${r.titolo}</span>` : `${LOGO}<span>Pronto Mestieri</span><span class="demo-tag">DEMO</span>`;
  r.dopo?.(arg && decodeURIComponent(arg));
  paginaPrima = r; chiavePrima = chiave;
  if (stessa) window.scrollTo(0, y);
}
function contaBadge() {
  const n = richieste.filter(r => r.nuovo).length;
  const a = $('.tabbar a[data-tab="richieste"]');
  a.querySelector(".count")?.remove();
  if (n) a.insertAdjacentHTML("beforeend", `<span class="count">${n}</span>`);
}
// ---------- tocchi: ogni tasto reagisce a modo suo ----------
const TOCCABILI = ".btn,.chip,.opt,.cat,.qp,.tabbar a,.luogo,.alt,.pro,.mini,.back,.zona-btn,.tog,.piano,.check,.days button,.stars-in button,.composer .ib,.catrow,.grp>button,.foto,.searchbar,.sos,.upload,.seg button,.menu-btn,.dr-row,.dr-me,.dr-x,.voce,.cuore,.v-del,.ptile,.ris-p,.ris-prev,.b-pianifica,.b-t.b-cat,.sel";
const CON_ONDA = ".btn,.sos,.luogo,.alt,.pro,.mini,.piano,.catrow,.qp,.cat,.opt,.searchbar,.upload,.ptile,.ris-p,.ris-prev,.b-pianifica,.sel";
document.addEventListener("pointerdown", e => {
  const el = e.target.closest(TOCCABILI);
  if (!el || el.disabled) return;
  el.classList.remove("tap"); void el.offsetWidth; el.classList.add("tap");
  clearTimeout(el._tap); el._tap = setTimeout(() => el.classList.remove("tap"), 1200);
  if (el.matches(CON_ONDA)) {
    const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
    const o = document.createElement("span");
    o.className = "onda-tap";
    o.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    el.appendChild(o); setTimeout(() => o.remove(), 1100);
  }
  if (el.matches(".fab,.sos,.btn.sos")) ondaSOS(el);
  if (navigator.vibrate && navigator.userActivation?.hasBeenActive) try { navigator.vibrate(el.matches(".fab,.btn.sos,.sos") ? 18 : 6); } catch {}
}, { passive: true });

function ondaSOS(el) {
  const r = el.getBoundingClientRect();
  for (const ritardo of [0, 220]) {
    const o = document.createElement("span");
    o.className = "onda-sos";
    o.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;animation-delay:${ritardo}ms`;
    document.body.appendChild(o); setTimeout(() => o.remove(), 1400 + ritardo);
  }
}

// barra in basso: toccare la scheda in cui sei già ti riporta all'inizio
$$(".tabbar a").forEach(a => a.addEventListener("click", e => {
  const dove = a.getAttribute("href");
  const qui = location.hash || "#/";
  if (qui !== dove && !(dove === "#/urgenza" && qui.startsWith("#/urgenza"))) return;
  e.preventDefault();
  if (dove === "#/urgenza" && typeof sos !== "undefined") { sos.luogo = null; sos.problema = null; sos.cat = null; render(); }
  window.scrollTo({ top: 0, behavior: "smooth" });
}));

// ---------- freccia indietro: come in un'app vera ----------
// Ogni scheda della barra in basso è un punto di partenza: toccandola la cronologia riparte da zero.
// Dentro una scheda la freccia torna alla pagina precedente, nel punto in cui eri.
// I filtri della stessa pagina (es. mappa per mestiere) non contano come pagine nuove.
const pila = [];
let hashCorrente = norm(location.hash), tornando = false, daScheda = false, ripristinaY = null;
function norm(h) {
  h = h || "#/";
  if (h.startsWith("#/urgenza")) return "#/urgenza";      // "#/urgenza/casa.perdita" è solo una scorciatoia
  return h === "#" ? "#/" : h;
}
const sezione = h => norm(h).split("/")[1] || "";
const RADICI = ["", "mappa", "urgenza", "richieste", "artigiano"];
function genitore() {
  const [, sez, arg] = norm(location.hash).split("/");
  if (sez === "cat") return "#/categorie";
  if (sez === "pro") { const a = pro(arg); return a ? "#/cat/" + a.categoria : "#/"; }
  if (sez === "chat") return "#/pro/" + arg;
  if (sez === "traccia") return "#/richieste";
  if (sez === "admin") return "#/artigiano";
  if (sez === "preventivo") return arg ? "#/richieste" : "#/";
  if (sez === "mappa" && arg) return "#/mappa";
  return "#/";
}
function valida(h) {   // una pagina della cronologia esiste ancora?
  const [, sez, arg] = h.split("/");
  if (sez === "traccia") return richieste.some(r => r.id === arg);
  if (sez === "pro" || sez === "chat") return !!pro(arg);
  return true;
}
// indietro "interno" alla pagina: passi dell'SOS e dell'iscrizione
function indietroInterno(prova) {
  const s = sezione(location.hash);
  if (s === "urgenza" && typeof sos !== "undefined" && sos.luogo) {
    if (!prova) { sos.luogo = null; sos.problema = null; sos.cat = null; chiavePrima = null; render(); window.scrollTo(0, 0); }
    return true;
  }
  if (s === "artigiano" && typeof wiz !== "undefined" && !mioProfilo && wiz.passo >= 0) {
    if (!prova) { chiavePrima = null; $("#w_indietro") ? $("#w_indietro").click() : (wiz.passo = -1, salvaWiz(), render()); }
    return true;
  }
  return false;
}
function aggiornaFreccia() {
  const s = sezione(location.hash);
  const r = ROTTE[s] || ROTTE[""];
  const radice = RADICI.includes(s);
  $("#back").hidden = s === "" || !(r.indietro || pila.length || !radice || indietroInterno(true));
}
window.addEventListener("hashchange", () => {
  const nuovo = norm(location.hash);
  if (tornando) { /* già tolta dalla pila */ }
  else if (pila.length && pila[pila.length - 1].h === nuovo) ripristinaY = pila.pop().y;   // indietro del telefono / del browser
  else if (daScheda || nuovo === "#/") pila.length = 0;                  // scheda della barra o logo: si riparte
  else if (nuovo !== hashCorrente) {
    if (sezione(nuovo) === sezione(hashCorrente) && sezione(nuovo) === "mappa") { /* filtro: sostituisce */ }
    else { pila.push({ h: hashCorrente, y: window.scrollY }); if (pila.length > 40) pila.shift(); }
  }
  tornando = false; daScheda = false; hashCorrente = nuovo;
}, true);
$$(".tabbar a").forEach(a => a.addEventListener("click", () => { if (norm(a.getAttribute("href")) !== norm(location.hash)) daScheda = true; }, true));
// la freccia scatta appena alzi il dito (anche se il dito scivola un po'), una volta sola
let ultimoIndietro = 0;
function vaiIndietro(e) {
  e?.preventDefault?.();
  if ($("#back").hidden || Date.now() - ultimoIndietro < 400) return;
  ultimoIndietro = Date.now();
  tornaIndietro();
}
$("#back").addEventListener("pointerup", vaiIndietro);
$("#back").addEventListener("click", vaiIndietro);
$("#back").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") vaiIndietro(e); });
function tornaIndietro() {
  if (indietroInterno()) return aggiornaFreccia();
  let dest = pila.pop();
  const daTraccia = sezione(location.hash) === "traccia";
  const daOfferte = /^#\/preventivo\/./.test(location.hash);   // il modulo del preventivo è già stato inviato
  while (dest && (dest.h === norm(location.hash) || !valida(dest.h) || (daTraccia && sezione(dest.h) === "urgenza") || (daOfferte && dest.h === "#/preventivo"))) dest = pila.pop();
  const h = dest ? dest.h : genitore();
  if (h === norm(location.hash)) return window.scrollTo({ top: 0, behavior: "smooth" });
  tornando = true; ripristinaY = dest ? dest.y : 0;
  location.hash = h;
};
$("#brand").onclick = () => (location.hash = "#/");
window.addEventListener("hashchange", () => {
  chiudiFoglio(); render();
  const y = ripristinaY; ripristinaY = null;
  window.scrollTo(0, y || 0);
  if (y) requestAnimationFrame(() => window.scrollTo(0, y));   // dopo che la pagina ha preso la sua altezza
});

async function avvia() {
  aggiornaZona(); contaBadge(); disegnaIcone();
  await splash();
  if (!zona) benvenuto(); else render();
}
