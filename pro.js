// "Lavora con noi": aziende e professionisti in proprio si iscrivono e ricevono richieste (come i rider di Glovo).

const WIZ_VUOTO = () => ({ passo: -1, dati: { tipo: null, categorie: [], strada: false, raggio: 25, giorni: [1, 2, 3, 4, 5], dalle: "08:00", alle: "18:00", fuoriOrario: true, cert: [], doc: {}, foto: [], piano: "pro" } });
let wiz = carica("wizard", null) || WIZ_VUOTO();
const salvaWiz = () => salva("wizard", wiz);
const PASSI = ["Come lavori", "Chi sei", "Servizi", "Zona", "Orari", "Documenti", "Piano"];
const GIORNI = ["L", "M", "M", "G", "V", "S", "D"];
const statoMio = () => admin.decisi.me || "attesa";

ROTTE.artigiano = {
  tab: "artigiano", titolo: "Lavora con noi",
  html() { return mioProfilo ? dashboard() : wiz.passo < 0 ? intro() : passoWizard(); },
  dopo() { mioProfilo ? dopoDashboard() : wiz.passo < 0 ? dopoIntro() : dopoWizard(); },
};

// ---------- presentazione ----------
function intro() {
  return `
    <div class="dark-top"><span>Per aziende e professionisti delle Marche</span><b>Più clienti, zero pubblicità.</b>
      <span>Ricevi richieste dalla tua zona. Accetti solo quelle che vuoi.</span></div>
    <div class="step3" style="margin-top:6px">
      <div style="--i:0"><span class="n">${ic("building-2")}</span><p style="margin:0"><b>Sei un'azienda?</b><span>Metti in campo la tua squadra e i tuoi mezzi</span></p></div>
      <div style="--i:1"><span class="n">${ic("user-round")}</span><p style="margin:0"><b>Lavori in proprio?</b><span>Accendi la disponibilità quando sei libero, come un rider</span></p></div>
      <div style="--i:2"><span class="n">${ic("siren")}</span><p style="margin:0"><b>Urgenze pagate di più</b><span>Casa o strada, +30% fuori orario</span></p></div>
      <div style="--i:3"><span class="n">${ic("percent")}</span><p style="margin:0"><b>Nessuna percentuale sui lavori</b><span>Iscrizione gratis, Pro a ${PREZZO_PRO} €/mese</span></p></div>
    </div>
    <button class="btn press" id="parti">Iscriviti in 3 minuti ${ic("arrow-right")}</button>`;
}
function dopoIntro() { $("#parti").onclick = () => { wiz.passo = 0; salvaWiz(); render(); }; }

// ---------- passi dell'iscrizione ----------
function passoWizard() {
  const d = wiz.dati, p = wiz.passo, az = d.tipo === "azienda";
  const titoli = ["Come lavori?", az ? "La tua azienda" : "Parlaci di te", "Che servizi offri?", "Dove lavori?", "Quando lavori?", "Documenti e certificazioni", "Scegli il piano"];
  const testa = `<div class="prog">${PASSI.map((_, i) => `<i class="${i <= p ? "on" : ""}"></i>`).join("")}</div>
    <div class="muted small">Passo ${p + 1} di ${PASSI.length}</div><h1 style="margin-top:2px">${titoli[p]}</h1>`;
  let corpo = "";
  if (p === 0) corpo = `
    <div class="big-choice">
      <button class="luogo casa press ${d.tipo === "azienda" ? "on" : ""}" data-tipo="azienda" style="--i:0;${d.tipo === "azienda" ? "border-color:var(--p1)" : ""}"><span class="ico">${ic("building-2")}</span><span><b>Sono un'azienda</b>
        <span class="d">Srl, Snc, ditta con dipendenti e mezzi. Ricevi più richieste insieme.</span></span></button>
      <button class="luogo strada press" data-tipo="indipendente" style="--i:1;${d.tipo === "indipendente" ? "border-color:var(--p1)" : ""}"><span class="ico">${ic("user-round")}</span><span><b>Lavoro in proprio</b>
        <span class="d">Artigiano o tecnico con partita IVA. Lavori quando sei disponibile.</span></span></button>
    </div>`;
  if (p === 1) corpo = az ? `
    <label class="f">Ragione sociale</label><input class="in" id="w_nome" value="${esc(d.nome)}" placeholder="Es. Rossi Impianti Srl">
    <label class="f">Titolare o referente</label><input class="in" id="w_ref" value="${esc(d.ref)}" placeholder="Nome e cognome" autocomplete="name">
    <label class="f">Partita IVA</label><input class="in" id="w_piva" value="${esc(d.piva)}" inputmode="numeric" maxlength="11" placeholder="11 cifre">
    <div class="row" style="gap:10px"><div style="flex:1"><label class="f">Addetti</label><input class="in" id="w_addetti" value="${esc(d.addetti)}" inputmode="numeric" placeholder="Es. 6"></div>
      <div style="flex:1"><label class="f">Mezzi</label><input class="in" id="w_mezzi" value="${esc(d.mezzi)}" inputmode="numeric" placeholder="Es. 3"></div></div>
    <label class="f">Presentate l'azienda</label><textarea class="in" id="w_bio" placeholder="Da quanti anni lavorate, in cosa siete specializzati…">${esc(d.bio)}</textarea>` : `
    <label class="f">Nome e cognome</label><input class="in" id="w_nome" value="${esc(d.nome)}" placeholder="Mario Rossi" autocomplete="name">
    <label class="f">Partita IVA</label><input class="in" id="w_piva" value="${esc(d.piva)}" inputmode="numeric" maxlength="11" placeholder="11 cifre">
    <label class="f">Anni di esperienza</label><input class="in" id="w_anni" value="${esc(d.anni)}" inputmode="numeric" placeholder="Es. 12">
    <label class="f">Presentati in due righe</label><textarea class="in" id="w_bio" placeholder="Cosa fai meglio, come lavori…">${esc(d.bio)}</textarea>`;
  if (p === 2) corpo = `
    <p class="muted" style="margin-top:-6px">Puoi sceglierne fino a 3.</p>
    ${GRUPPI.map(g => `<div class="eyebrow">${g.nome}</div>
      <div class="chips wrap">${CATEGORIE.filter(c => c.gruppo === g.id).map(c => `<button class="chip ${d.categorie.includes(c.id) ? "on" : ""}" data-wc="${c.id}">${em(c)}${c.nome}</button>`).join("")}</div>`).join("")}
    <div class="box switch" style="margin-top:18px"><div><b>Intervengo anche su strada</b><div class="muted small">Auto ferme, forature, batterie, aperture auto</div></div>
      <button class="tog ${d.strada ? "on" : ""}" id="w_strada" aria-label="Interventi su strada"></button></div>`;
  if (p === 3) {
    const base = d.citta || zona.citta;
    const coperte = TUTTE_CITTA.filter(c => km(...COORD[base], ...COORD[c.citta]) <= d.raggio);
    corpo = `
      <label class="f">Dove hai la sede?</label>
      <select class="in" id="w_citta">${TUTTE_CITTA.map(c => `<option ${c.citta === base ? "selected" : ""}>${c.citta}</option>`).join("")}</select>
      <label class="f">Fino a quanti km vi spostate? <b style="color:var(--p1)" id="w_rl">${d.raggio} km</b></label>
      <input type="range" min="5" max="80" step="5" value="${d.raggio}" id="w_raggio">
      <div class="box"><b>Riceverai richieste da ${coperte.length} comuni</b>
        <div class="chips wrap" style="margin-top:10px">${coperte.map(c => `<span class="chip on" style="animation:pop .3s var(--spring) both">${c.citta}</span>`).join("")}</div></div>`;
  }
  if (p === 4) corpo = `
    <label class="f">Giorni di lavoro</label>
    <div class="days">${GIORNI.map((g, i) => `<button class="press ${d.giorni.includes(i + 1) ? "on" : ""}" data-g="${i + 1}">${g}</button>`).join("")}</div>
    <div class="row" style="gap:10px"><div style="flex:1"><label class="f">Dalle</label><input class="in" type="time" id="w_dalle" value="${d.dalle}"></div>
      <div style="flex:1"><label class="f">Alle</label><input class="in" type="time" id="w_alle" value="${d.alle}"></div></div>
    <div class="box switch"><div><b>Accetto urgenze fuori orario</b><div class="muted small">Sere, notti e festivi: +30%</div></div>
      <button class="tog ${d.fuoriOrario ? "on" : ""}" id="w_fo" aria-label="Urgenze fuori orario"></button></div>`;
  if (p === 5) {
    const up = (k, t, sub) => `<label class="upload press" style="text-align:left;justify-content:flex-start;gap:12px;margin-bottom:8px">
      <span style="color:${d.doc[k] ? "var(--ok)" : "var(--muted)"}">${ic(d.doc[k] ? "circle-check" : "file-text")}</span><span style="flex:1"><b style="color:var(--ink)">${t}</b><br><span class="small">${d.doc[k] ? esc(d.doc[k]) : sub}</span></span>
      <span style="color:var(--p1);font-weight:600">${d.doc[k] ? "Cambia" : "Carica"}</span><input type="file" accept="image/*,application/pdf" data-doc="${k}"></label>`;
    corpo = `
      <p class="muted" style="margin-top:-6px">Servono per il bollino verificato. Li vediamo solo noi.</p>
      ${up("id", "Documento d'identità" + (az ? " del titolare" : ""), "Carta d'identità o patente")}
      ${up("visura", az ? "Visura camerale" : "Certificato di attribuzione P.IVA", "PDF o foto")}
      ${up("rc", "Assicurazione RC", "Consigliata: ti fa salire in classifica")}
      ${d.strada ? up("mezzo", "Libretto del mezzo di soccorso", "Per interventi su strada") : ""}
      <label class="f">Abilitazioni e certificazioni</label>
      ${CERTIFICAZIONI.map(c => `<button class="check ${d.cert.includes(c) ? "on" : ""}" data-cert="${esc(c)}"><span class="bx">${ic("check")}</span>${c}</button>`).join("")}
      <label class="f">Foto dei lavori <span class="muted">(fino a 6)</span></label>
      <label class="upload press">${ic("image-plus")}<b>Aggiungi foto</b></label>
      <input type="file" accept="image/*" multiple id="w_foto" hidden>
      <div class="thumbs" id="w_thumbs">${d.foto.map(f => `<img src="${f}" alt="">`).join("")}</div>`;
  }
  if (p === 6) corpo = `
    <div class="piani">
      <button class="piano press ${d.piano === "base" ? "on" : ""}" data-pp="base"><b>Base</b><div class="p">Gratis</div>
        <ul><li>Profilo e recensioni</li><li>5 contatti al mese</li></ul></button>
      <button class="piano press ${d.piano === "pro" ? "on" : ""}" data-pp="pro"><b>Pro</b><div class="p">${PREZZO_PRO} €<span class="small">/mese</span></div>
        <ul><li>Contatti illimitati</li><li>Richieste SOS</li><li>In cima ai consigliati</li></ul></button>
    </div>
    <div class="box small" style="display:flex;gap:10px">${ic("gift")}<span><b>3 mesi di Pro gratis</b> per chi si iscrive durante il lancio nelle Marche. Disdici quando vuoi.</span></div>
    <div class="riepilogo">
      <div><span>${az ? "Azienda" : "Nome"}</span><b>${esc(d.nome)}</b></div>
      <div><span>Servizi</span><b>${d.categorie.map(c => cat(c).nome).join(", ")}</b></div>
      <div><span>Zona</span><b>${esc(d.citta || zona.citta)} + ${d.raggio} km</b></div>
      <div><span>Su strada</span><b>${d.strada ? "Sì" : "No"}</b></div>
      <div><span>Documenti</span><b>${Object.keys(d.doc).length} caricati</b></div>
    </div>`;
  return testa + `<div>${corpo}</div>
    <div class="row" style="margin-top:22px">
      <button class="btn sec press" id="w_indietro" style="flex:.4" aria-label="Indietro">${ic("arrow-left")}</button>
      <button class="btn press" id="w_avanti">${p === PASSI.length - 1 ? "Invia la domanda" : "Continua"}</button>
    </div>`;
}

function dopoWizard() {
  const d = wiz.dati, p = wiz.passo;
  const leggi = () => {
    if (p === 1) ["nome", "ref", "piva", "anni", "addetti", "mezzi", "bio"].forEach(k => { const el = $("#w_" + k); if (el) d[k] = el.value.trim(); });
    if (p === 4) { d.dalle = $("#w_dalle").value; d.alle = $("#w_alle").value; }
    salvaWiz();
  };
  $$("[data-tipo]").forEach(b => b.onclick = () => { d.tipo = b.dataset.tipo; wiz.passo = 1; salvaWiz(); render(); window.scrollTo(0, 0); });
  $$("[data-wc]").forEach(b => b.onclick = () => {
    const id = b.dataset.wc;
    if (d.categorie.includes(id)) d.categorie = d.categorie.filter(x => x !== id);
    else if (d.categorie.length >= 3) return toast("Massimo 3 servizi");
    else { d.categorie.push(id); if (cat(id).gruppo === "auto" && !d.strada) { d.strada = true; $("#w_strada")?.classList.add("on"); } }
    b.classList.toggle("on"); salvaWiz();
  });
  if ($("#w_strada")) $("#w_strada").onclick = e => { d.strada = !d.strada; e.currentTarget.classList.toggle("on"); salvaWiz(); };
  if (p === 3) {
    $("#w_citta").onchange = e => { d.citta = e.target.value; salvaWiz(); render(); };
    $("#w_raggio").oninput = e => { $("#w_rl").textContent = e.target.value + " km"; };
    $("#w_raggio").onchange = e => { d.raggio = +e.target.value; salvaWiz(); render(); };
  }
  $$("[data-g]").forEach(b => b.onclick = () => {
    const g = +b.dataset.g;
    d.giorni = d.giorni.includes(g) ? d.giorni.filter(x => x !== g) : [...d.giorni, g];
    b.classList.toggle("on"); salvaWiz();
  });
  if ($("#w_fo")) $("#w_fo").onclick = e => { d.fuoriOrario = !d.fuoriOrario; e.currentTarget.classList.toggle("on"); salvaWiz(); };
  $$("[data-doc]").forEach(inp => inp.onchange = () => { if (inp.files[0]) { d.doc[inp.dataset.doc] = inp.files[0].name; salvaWiz(); render(); toast("Documento caricato"); } });
  $$("[data-cert]").forEach(b => b.onclick = () => {
    const c = b.dataset.cert;
    d.cert = d.cert.includes(c) ? d.cert.filter(x => x !== c) : [...d.cert, c];
    b.classList.toggle("on"); salvaWiz();
  });
  if ($("#w_foto")) {
    $("#w_foto").previousElementSibling.onclick = () => $("#w_foto").click();
    $("#w_foto").onchange = async e => {
      for (const f of [...e.target.files]) { const m = await miniatura(f, 240); if (m) d.foto.push(m); }
      d.foto = d.foto.slice(-6); salvaWiz();
      $("#w_thumbs").innerHTML = d.foto.map(f => `<img src="${f}" alt="">`).join("");
    };
  }
  $$("[data-pp]").forEach(b => b.onclick = () => { d.piano = b.dataset.pp; salvaWiz(); render(); });

  $("#w_indietro").onclick = () => { leggi(); wiz.passo--; salvaWiz(); render(); window.scrollTo(0, 0); };
  $("#w_avanti").onclick = () => {
    leggi();
    if (p === 0 && !d.tipo) return toast("Scegli come lavori");
    if (p === 1 && !d.nome) return toast(d.tipo === "azienda" ? "Inserisci la ragione sociale" : "Inserisci nome e cognome");
    if (p === 1 && d.piva && !/^\d{11}$/.test(d.piva)) return toast("La partita IVA ha 11 cifre");
    if (p === 2 && !d.categorie.length) return toast("Scegli almeno un servizio");
    if (p === 4 && !d.giorni.length) return toast("Scegli almeno un giorno");
    if (p < PASSI.length - 1) { wiz.passo++; salvaWiz(); render(); window.scrollTo(0, 0); return; }
    mioProfilo = { ...d, citta: d.citta || zona.citta, categoria: d.categorie[0], urgenze: d.fuoriOrario, lavori: 0, gestite: [], iscritto: Date.now() };
    salva("artigiano", mioProfilo);
    delete admin.decisi.me; salva("admin", admin);
    inviata();
  };
}
function inviata() {
  app.innerHTML = `<div class="box center" style="margin-top:20px;padding:26px 18px">
    <div class="done">${ic("check")}</div>
    <h1 style="margin:0 0 6px">Domanda inviata</h1>
    <p class="muted">Controlliamo i documenti entro 24–48 ore. Appena approvati inizierete a ricevere richieste.</p>
    <button class="btn press" onclick="render()">Vai al pannello</button></div>`;
}

// ---------- pannello di chi lavora ----------
const RICHIESTE_IN_ARRIVO = [
  { id: 1, urg: true, strada: true, testo: "Gomma bucata, auto ferma in corsia di emergenza", dove: "4 km", quando: "Adesso", nome: "Paola F." },
  { id: 2, urg: true, testo: "Perdita sotto il lavello, acqua sul pavimento", dove: "3 km", quando: "Entro 1 ora", nome: "Anna M." },
  { id: 3, urg: false, testo: "Sostituzione rubinetto bagno e sifone", dove: "7 km", quando: "Questa settimana", nome: "Franco P." },
];
function dashboard() {
  const m = mioProfilo, st = statoMio(), az = m.tipo === "azienda";
  const statoHtml = { attesa: '<span class="stato attesa">In verifica</span>', ok: '<span class="stato completata">Approvato</span>', no: '<span class="stato rifiutata">Da completare</span>' }[st];
  const attivo = st === "ok";
  const lista = RICHIESTE_IN_ARRIVO.filter(r => !m.gestite.includes(r.id) && (!r.strada || m.strada));
  return `
    <div class="dark-top"><span>${ic(az ? "building-2" : "user-round")} ${az ? "Azienda" : "Professionista"} · ${m.categorie.map(x => cat(x).nome).join(", ")}</span>
      <b>${esc(az ? m.nome : "Ciao " + m.nome.split(" ")[0])}</b>
      <span>${ic("map-pin")} ${esc(m.citta)} + ${m.raggio} km${m.strada ? " · anche su strada" : ""}</span> &nbsp; ${statoHtml}</div>
    ${st === "attesa" ? `<div class="box small" style="display:flex;gap:10px">${ic("hourglass")}<span>Stiamo controllando i documenti. Per vedere cosa succede dopo, apri il <a href="#/admin"><b>pannello admin</b></a> e approva la domanda.</span></div>` : ""}
    ${st === "no" ? `<div class="box small" style="display:flex;gap:10px">${ic("triangle-alert")}<span>Mancano alcuni documenti. Ricaricali per ottenere il bollino verificato.</span></div>` : ""}
    <div class="box switch"><div><b>${m.urgenze ? "Disponibile adesso" : "Non disponibile"}</b><div class="muted small">${az ? "La squadra riceve le richieste SOS in zona" : "Accendi quando sei libero, come un rider"}</div></div>
      <button class="tog ${m.urgenze ? "on" : ""}" id="tog" aria-label="Disponibile"></button></div>
    <h2>Questo mese</h2>
    <div class="kpi k3">
      <div style="--i:0"><b>${attivo ? 53 : 0}</b>visite al profilo</div>
      <div style="--i:1"><b>${attivo ? 6 + m.lavori : 0}</b>contatti</div>
      <div style="--i:2"><b>${m.lavori}</b>lavori presi</div>
    </div>
    <h2>Richieste in arrivo</h2>
    ${!attivo ? vuoto("lock", "Le richieste arrivano dopo l'approvazione.")
      : lista.map((r, i) => `<div class="req" style="--i:${i}">
        <div class="top"><b>${ic(r.strada ? "car" : r.urg ? "siren" : "clipboard-list")}${r.strada ? "SOS su strada" : r.urg ? "SOS in casa" : "Nuovo lavoro"}</b><span class="muted small">${r.dove}</span></div>
        <p class="small" style="margin:6px 0">“${r.testo}”</p>
        <div class="muted small">${r.nome} · ${r.quando}${r.urg ? " · +30% fuori orario" : ""}</div>
        <div class="row" style="margin-top:10px"><button class="btn ghost" data-no="${r.id}">Rifiuta</button>
        <button class="btn ${r.urg ? "sos" : ""} press" data-si="${r.id}">Accetta</button></div></div>`).join("")
        || vuoto("inbox", "Hai gestito tutto. Ti avvisiamo appena arriva qualcosa.")}
    <h2>Il tuo piano</h2>
    <div class="piani">
      <button class="piano press ${m.piano === "base" ? "on" : ""}" data-piano="base"><b>Base</b><div class="p">Gratis</div><ul><li>5 contatti al mese</li></ul></button>
      <button class="piano press ${m.piano === "pro" ? "on" : ""}" data-piano="pro"><b>Pro</b><div class="p">${PREZZO_PRO} €</div><ul><li>Illimitati + SOS</li></ul></button>
    </div>
    <div style="height:16px"></div>
    <button class="btn ghost" id="aesci">Cancella profilo demo</button>`;
}
function dopoDashboard() {
  const salvaP = () => { salva("artigiano", mioProfilo); render(); };
  $("#tog").onclick = () => { mioProfilo.urgenze = !mioProfilo.urgenze; salvaP(); };
  $$("[data-si]").forEach(b => b.onclick = () => {
    const r = RICHIESTE_IN_ARRIVO.find(x => x.id === +b.dataset.si);
    if (r.urg && mioProfilo.piano !== "pro") return toast("Le richieste SOS sono nel piano Pro");
    mioProfilo.gestite.push(r.id); mioProfilo.lavori++;
    toast("Accettata: il cliente riceve il tuo contatto"); salvaP();
  });
  $$("[data-no]").forEach(b => b.onclick = () => { mioProfilo.gestite.push(+b.dataset.no); salvaP(); });
  $$("[data-piano]").forEach(b => b.onclick = () => { mioProfilo.piano = b.dataset.piano; toast(b.dataset.piano === "pro" ? "Piano Pro attivo (demo)" : "Piano Base"); salvaP(); });
  $("#aesci").onclick = () => {
    mioProfilo = null; salva("artigiano", null); delete admin.decisi.me; salva("admin", admin);
    wiz = WIZ_VUOTO(); salvaWiz(); render();
  };
}
