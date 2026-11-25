// Menu laterale (icona profilo in alto a destra): account, indirizzi, veicoli, preferiti, storico,
// pagamenti, come funziona, garanzia, aiuto, invita un amico, impostazioni, info, azzera demo.

let utente = carica("utente", { nome: "", tel: "", email: "", foto: null });
let indirizzi = carica("indirizzi", []);
let veicoli = carica("veicoli", []);
let preferiti = carica("preferiti", []);
let carte = carica("carte", []);
let impost = carica("impost", { sos: true, chat: true, offerte: false, lingua: "it", codice: "" });
const VERSIONE = "0.9 · demo";
const nuovoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const ETICHETTE = { casa: ["house", "Casa"], lavoro: ["briefcase", "Lavoro"], altro: ["map-pin", "Altro"] };
const MEZZI = { auto: ["car", "Auto"], moto: ["bike", "Moto"], furgone: ["truck", "Furgone"] };
const testoIndirizzo = x => `${x.via}, ${x.citta}`;
const testoVeicolo = v => `${v.modello} · ${v.targa}`;

// ---------- avatar dell'utente ----------
function avatarUtente(cls = "") {
  if (utente.foto) return `<span class="me-av ${cls}" style="background-image:url(${utente.foto})"></span>`;
  const ini = utente.nome.split(" ").filter(Boolean).map(p => p[0]).slice(0, 2).join("").toUpperCase();
  return `<span class="me-av ${cls}">${ini || ic("user-round")}</span>`;
}
function aggiornaMenuBtn() { $("#menuBtn").innerHTML = avatarUtente(); }

// ---------- il pannello ----------
const VOCI = [
  ["Il mio account", [
    ["profilo", "user-round", "Profilo"],
    ["indirizzi", "map-pinned", "I miei indirizzi", () => indirizzi.length],
    ["veicoli", "car", "I miei veicoli", () => veicoli.length],
    ["preferiti", "heart", "Preferiti", () => preferiti.length],
    ["storico", "receipt-text", "Storico e ricevute"],
    ["pagamenti", "credit-card", "Pagamenti"],
  ]],
  ["Fiducia e aiuto", [
    ["come", "lightbulb", "Come funziona"],
    ["garanzia", "shield-check", "Garanzia Pronto Mestieri"],
    ["aiuto", "life-buoy", "Aiuto e assistenza"],
    ["invita", "gift", "Invita un amico", () => "5 €"],
  ]],
  ["Impostazioni", [
    ["impostazioni", "settings", "Zona, notifiche e lingua"],
  ]],
  ["Altro", [
    ["#/artigiano", "briefcase", "Lavora con noi"],
    ["#/admin", "lock", "Pannello admin (demo)"],
    ["info", "file-text", "Termini e privacy"],
  ]],
];
document.body.insertAdjacentHTML("beforeend", `<div class="drawer-bg" id="drawerBg"></div><aside class="drawer" id="drawer" aria-label="Menu"></aside>`);

function apriMenu() {
  let i = 0;
  $("#drawer").innerHTML = `
    <div class="dr-head">
      <button class="dr-x press" id="drX" aria-label="Chiudi il menu">${ic("x")}</button>
      <a class="dr-me" href="#/profilo" style="--i:${i++}">${avatarUtente("big")}
        <div><b>${utente.nome ? esc(utente.nome) : "Ciao!"}</b><span>${utente.nome ? "Vedi e modifica il profilo" : "Completa il tuo profilo"}</span></div>${ic("chevron-right")}</a>
    </div>
    ${VOCI.map(([titolo, voci]) => `<div class="dr-sez" style="--i:${i++}">${titolo}</div>
      <div class="dr-box" style="--i:${i++}">${voci.map(([k, icona, nome, conta]) => {
        const n = conta?.();
        return `<a class="dr-row" href="${k.startsWith("#") ? k : "#/" + k}"><span class="dr-ic">${ic(icona)}</span><span class="dr-t">${nome}</span>${n ? `<span class="dr-n">${n}</span>` : ""}${ic("chevron-right")}</a>`;
      }).join("")}</div>`).join("")}
    <button class="dr-row dr-reset press" id="drReset" style="--i:${i++}">${ic("rotate-ccw")}Azzera la demo</button>
    <p class="dr-ver">Pronto Mestieri · versione ${VERSIONE}</p>`;
  $("#drawer").scrollTop = 0;
  requestAnimationFrame(() => { $("#drawer").classList.add("on"); $("#drawerBg").classList.add("on"); });
  $("#drX").onclick = chiudiMenu;
  $("#drReset").onclick = () => { chiudiMenu(); setTimeout(azzeraDemo, 250); };
  $$("#drawer a").forEach(a => a.addEventListener("click", e => {
    if (a.getAttribute("href") === location.hash) e.preventDefault();   // sei già lì: chiudi e basta
    chiudiMenu();
  }));
}
function chiudiMenu() { $("#drawer").classList.remove("on"); $("#drawerBg").classList.remove("on"); }
$("#drawerBg").onclick = chiudiMenu;
$("#menuBtn").onclick = apriMenu;
window.addEventListener("hashchange", chiudiMenu);
document.addEventListener("keydown", e => { if (e.key === "Escape") chiudiMenu(); });
aggiornaMenuBtn();

function azzeraDemo() {
  apriFoglio(`<h3>Azzerare la demo?</h3>
    <p class="muted">Cancelliamo richieste, chat, profilo, indirizzi, veicoli, preferiti e iscrizione. L'app riparte da zero, come la prima volta. Non si può annullare.</p>
    <button class="btn sos press" id="azOk">${ic("rotate-ccw")}Sì, azzera tutto</button>
    <button class="btn ghost" id="azNo">Annulla</button>`,
  el => {
    $("#azNo", el).onclick = chiudiFoglio;
    $("#azOk", el).onclick = () => {
      Object.keys(localStorage).filter(k => k.startsWith("pm_")).forEach(k => localStorage.removeItem(k));
      try { sessionStorage.removeItem("pm_splash"); } catch {}
      history.replaceState(null, "", location.pathname + location.search + "#/");
      location.reload();
    };
  });
}

// ---------- profilo ----------
ROTTE.profilo = {
  tab: "menu", titolo: "Il tuo profilo",
  html() {
    return `
      <div class="me-top"><label class="me-foto">${avatarUtente("xl")}<span class="me-cam">${ic("camera")}</span><input type="file" accept="image/*" id="pFoto" hidden></label>
        <p class="muted small">Tocca la foto per cambiarla</p></div>
      <label class="f">Nome e cognome</label><input class="in" id="pNome" value="${esc(utente.nome)}" placeholder="Es. Giulia Bianchi" autocomplete="name">
      <label class="f">Telefono</label><input class="in" id="pTel" value="${esc(utente.tel)}" placeholder="Es. 333 123 4567" inputmode="tel" autocomplete="tel">
      <p class="muted small nota">${ic("lock")}Chi interviene non vede il tuo numero: le chiamate passano dall'app.</p>
      <label class="f">Email</label><input class="in" id="pMail" value="${esc(utente.email)}" placeholder="nome@email.it" inputmode="email" autocomplete="email">
      <div class="box me-link">
        <a class="listino" href="#/indirizzi"><span>${ic("map-pinned")}Indirizzi salvati</span><b>${indirizzi.length} ${ic("chevron-right")}</b></a>
        <a class="listino" href="#/veicoli"><span>${ic("car")}Veicoli</span><b>${veicoli.length} ${ic("chevron-right")}</b></a>
        <a class="listino" href="#/preferiti"><span>${ic("heart")}Preferiti</span><b>${preferiti.length} ${ic("chevron-right")}</b></a>
      </div>
      <div style="height:18px"></div>
      <button class="btn press" id="pSalva">${ic("check")}Salva il profilo</button>`;
  },
  dopo() {
    $("#pFoto").onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      const m = await miniatura(f, 220); if (!m) return toast("Non riesco a leggere questa foto");
      utente.foto = m; salva("utente", utente);
      $(".me-foto .me-av").outerHTML = avatarUtente("xl"); aggiornaMenuBtn(); toast("Foto aggiornata");
    };
    $("#pSalva").onclick = () => {
      const nome = $("#pNome").value.trim(), tel = $("#pTel").value.trim(), mail = $("#pMail").value.trim();
      if (!nome) return toast("Scrivi il tuo nome");
      if (tel && !/^\+?[\d\s]{8,15}$/.test(tel)) return toast("Controlla il numero di telefono");
      if (mail && !/^\S+@\S+\.\S+$/.test(mail)) return toast("Controlla l'indirizzo email");
      Object.assign(utente, { nome, tel, email: mail }); salva("utente", utente); aggiornaMenuBtn();
      toast(`Profilo salvato. Ciao ${nome.split(" ")[0]}!`); tornaIndietro();
    };
  },
};

// ---------- indirizzi ----------
ROTTE.indirizzi = {
  tab: "menu", titolo: "I miei indirizzi",
  html() {
    return `<p class="muted intro">Salvali una volta sola: quando chiedi un intervento basta un tocco.</p>
      ${indirizzi.length ? indirizzi.map((x, i) => `<div class="voce" style="--i:${i}">
          <span class="v-ic">${ic(ETICHETTE[x.tipo][0])}</span>
          <div class="v-tx"><b>${ETICHETTE[x.tipo][1]}</b><span>${esc(testoIndirizzo(x))}</span>${x.note ? `<span>${esc(x.note)}</span>` : ""}</div>
          <button class="v-del press" data-del="${x.id}" aria-label="Elimina">${ic("trash-2")}</button></div>`).join("")
        : vuoto("map-pinned", "<b>Nessun indirizzo salvato</b><br>Aggiungi casa o lavoro: all'SOS li trovi già pronti.")}
      <button class="btn sec press" id="add">${ic("plus")}Aggiungi indirizzo</button>`;
  },
  dopo() {
    $$("[data-del]").forEach(b => b.onclick = () => conferma("Eliminare questo indirizzo?", () => {
      indirizzi = indirizzi.filter(x => x.id !== b.dataset.del); salva("indirizzi", indirizzi); render(); toast("Indirizzo eliminato");
    }));
    $("#add").onclick = () => formIndirizzo(() => render());
  },
};
function formIndirizzo(poi) {
  let tipo = !indirizzi.some(x => x.tipo === "casa") ? "casa" : !indirizzi.some(x => x.tipo === "lavoro") ? "lavoro" : "altro";
  apriFoglio(`<h3>Nuovo indirizzo</h3>
    <div class="seg">${Object.entries(ETICHETTE).map(([k, [i, n]]) => `<button class="${k === tipo ? "on" : ""}" data-et="${k}">${ic(i)}${n}</button>`).join("")}</div>
    <label class="f">Via e numero civico</label><input class="in" id="aVia" placeholder="Es. Via Roma 12" autocomplete="street-address">
    <label class="f">Comune</label><select class="in" id="aCitta">${TUTTE_CITTA.map(c => `<option ${c.citta === zona.citta ? "selected" : ""}>${c.citta}</option>`).join("")}</select>
    <label class="f">Note per chi arriva <span class="muted">(facoltativo)</span></label><input class="in" id="aNote" placeholder="Es. scala B, citofono Rossi">
    <div style="height:16px"></div><button class="btn press" id="aOk">${ic("check")}Salva indirizzo</button>`,
  el => {
    $$("[data-et]", el).forEach(b => b.onclick = () => { tipo = b.dataset.et; $$("[data-et]", el).forEach(x => x.classList.toggle("on", x === b)); });
    $("#aOk", el).onclick = () => {
      const via = $("#aVia", el).value.trim();
      if (via.length < 4) return toast("Scrivi via e numero civico");
      const nuovo = { id: nuovoId(), tipo, via, citta: $("#aCitta", el).value, note: $("#aNote", el).value.trim() };
      indirizzi.push(nuovo); salva("indirizzi", indirizzi); chiudiFoglio(); toast("Indirizzo salvato"); poi?.(nuovo);
    };
  });
}

// ---------- veicoli ----------
ROTTE.veicoli = {
  tab: "menu", titolo: "I miei veicoli",
  html() {
    return `<p class="muted intro">Se resti a piedi, il soccorso sa già che mezzo cercare e cosa portare.</p>
      ${veicoli.length ? veicoli.map((v, i) => `<div class="voce" style="--i:${i}">
          <span class="v-ic">${ic(MEZZI[v.tipo][0])}</span>
          <div class="v-tx"><b>${esc(v.modello)}</b><span><span class="targa">${esc(v.targa)}</span>${v.colore ? " · " + esc(v.colore) : ""}</span></div>
          <button class="v-del press" data-del="${v.id}" aria-label="Elimina">${ic("trash-2")}</button></div>`).join("")
        : vuoto("car", "<b>Nessun veicolo salvato</b><br>Aggiungi la tua auto: in caso di guasto è già tutto pronto.")}
      <button class="btn sec press" id="add">${ic("plus")}Aggiungi veicolo</button>`;
  },
  dopo() {
    $$("[data-del]").forEach(b => b.onclick = () => conferma("Eliminare questo veicolo?", () => {
      veicoli = veicoli.filter(x => x.id !== b.dataset.del); salva("veicoli", veicoli); render(); toast("Veicolo eliminato");
    }));
    $("#add").onclick = () => formVeicolo(() => render());
  },
};
function formVeicolo(poi) {
  let tipo = "auto";
  apriFoglio(`<h3>Nuovo veicolo</h3>
    <div class="seg">${Object.entries(MEZZI).map(([k, [i, n]]) => `<button class="${k === tipo ? "on" : ""}" data-mz="${k}">${ic(i)}${n}</button>`).join("")}</div>
    <label class="f">Marca e modello</label><input class="in" id="vMod" placeholder="Es. Fiat Panda">
    <div class="row" style="gap:10px"><div style="flex:1"><label class="f">Targa</label><input class="in" id="vTarga" placeholder="AB123CD" maxlength="9" style="text-transform:uppercase"></div>
      <div style="flex:1"><label class="f">Colore <span class="muted">(facolt.)</span></label><input class="in" id="vCol" placeholder="Es. bianca"></div></div>
    <div style="height:16px"></div><button class="btn press" id="vOk">${ic("check")}Salva veicolo</button>`,
  el => {
    $$("[data-mz]", el).forEach(b => b.onclick = () => { tipo = b.dataset.mz; $$("[data-mz]", el).forEach(x => x.classList.toggle("on", x === b)); });
    $("#vOk", el).onclick = () => {
      const modello = $("#vMod", el).value.trim(), targa = $("#vTarga", el).value.replace(/\s/g, "").toUpperCase();
      if (modello.length < 2) return toast("Scrivi marca e modello");
      if (!/^[A-Z0-9]{5,8}$/.test(targa)) return toast("Controlla la targa");
      const nuovo = { id: nuovoId(), tipo, modello, targa, colore: $("#vCol", el).value.trim() };
      veicoli.push(nuovo); salva("veicoli", veicoli); chiudiFoglio(); toast("Veicolo salvato"); poi?.(nuovo);
    };
  });
}

function conferma(testo, si) {
  apriFoglio(`<h3>${testo}</h3><div class="row" style="gap:8px;margin-top:8px">
    <button class="btn ghost" id="cNo">Annulla</button><button class="btn sos press" id="cSi">${ic("trash-2")}Elimina</button></div>`,
  el => { $("#cNo", el).onclick = chiudiFoglio; $("#cSi", el).onclick = () => { chiudiFoglio(); si(); }; });
}

// ---------- preferiti ----------
function preferito(id) { return preferiti.includes(+id); }
function cambiaPreferito(id) {
  id = +id;
  preferiti = preferito(id) ? preferiti.filter(x => x !== id) : [id, ...preferiti];
  salva("preferiti", preferiti);
  return preferito(id);
}
ROTTE.preferiti = {
  tab: "menu", titolo: "Preferiti",
  html() {
    const lista = preferiti.map(pro).filter(Boolean).map(a => ({ ...a, dist: distanza(a) }));
    return lista.length
      ? `<p class="muted intro">Le aziende e i professionisti che hai salvato.</p>${lista.map(cardPro).join("")}`
      : vuoto("heart", "<b>Nessun preferito</b><br>Tocca il cuore sul profilo di un'azienda<br>per ritrovarla qui al volo.") + `<a class="btn sec press" href="#/categorie">${ic("search")}Cerca un professionista</a>`;
  },
};

// ---------- storico e ricevute ----------
ROTTE.storico = {
  tab: "menu", titolo: "Storico e ricevute",
  html() {
    const fatti = richieste.filter(r => r.stato === "completata");
    const inCorso = richieste.filter(r => r.stato !== "completata" && r.tipo === "urgenza").length;
    const speso = fatti.reduce((s, r) => s + (r.pagato || 0), 0);
    return `
      <div class="dark-top"><span>Pagato in app</span><b>${euro(speso)}</b><span>${fatti.length} ${fatti.length === 1 ? "intervento completato" : "interventi completati"}</span></div>
      ${inCorso ? `<a class="box small riga-link" href="#/richieste">${ic("navigation")}<span>Hai ${inCorso} ${inCorso === 1 ? "richiesta" : "richieste"} in corso</span>${ic("chevron-right")}</a>` : ""}
      ${fatti.length ? fatti.map((r, i) => {
        const a = r.proId && pro(r.proId), c = cat(r.categoria);
        const d = new Date(r.data).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
        return `<button class="voce press" data-ric="${r.id}" style="--i:${i}">
          <span class="v-ic">${em(c)}</span>
          <div class="v-tx"><b>${esc(r.problema || c.nome)}</b><span>${d}${a ? " · " + esc(a.nome) : ""}</span>
            ${r.recensione ? `<span class="stelle">${STELLA.repeat(r.recensione.voto)}</span>` : ""}</div>
          <b class="v-prezzo">${r.pagato ? euro(r.pagato) : "—"}</b></button>`;
      }).join("") : vuoto("receipt-text", "<b>Nessun intervento concluso</b><br>Quando un lavoro è finito, qui trovi<br>la ricevuta e la tua recensione.")}`;
  },
  dopo() { $$("[data-ric]").forEach(b => b.onclick = () => ricevuta(b.dataset.ric)); },
};
function ricevuta(id) {
  const r = richieste.find(x => x.id === id), a = r.proId && pro(r.proId), c = cat(r.categoria);
  const d = new Date(r.data).toLocaleString("it-IT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  apriFoglio(`<div class="center"><div class="done" style="margin:0 auto 10px">${ic("receipt-text")}</div><h3 style="margin-bottom:2px">Ricevuta</h3>
      <p class="muted small" style="margin:0 0 12px">N. PM-${r.id.toUpperCase()} · ${d}</p></div>
    <div class="box ricevuta">
      <div class="listino"><span>Intervento</span><b>${esc(r.problema || c.nome)}</b></div>
      ${a ? `<div class="listino"><span>Eseguito da</span><b>${esc(a.nome)}</b></div>` : ""}
      ${r.indirizzo ? `<div class="listino"><span>Dove</span><b>${esc(r.indirizzo)}</b></div>` : r.luogo === "strada" ? `<div class="listino"><span>Dove</span><b>Su strada</b></div>` : ""}
      ${r.veicolo ? `<div class="listino"><span>Veicolo</span><b>${esc(r.veicolo)}</b></div>` : ""}
      ${r.prezzo ? `<div class="listino"><span>Prezzo indicativo del lavoro</span><b>${r.prezzo}</b></div>` : ""}
      <div class="listino"><span>Servizio pagato in app</span><b>${r.pagato ? euro(r.pagato) : "Nessuno"}</b></div>
    </div>
    <p class="muted small">Il lavoro lo paghi direttamente a chi interviene, che ti rilascia la sua fattura.</p>
    <button class="btn sec press" id="pdf">${ic("download")}Scarica PDF</button>
    ${!r.recensione && a ? `<div style="height:8px"></div><button class="btn press" id="rec">${ic("star")}Lascia una recensione</button>` : ""}`,
  el => {
    $("#pdf", el).onclick = () => toast("Nella versione vera arriva il PDF via email");
    if ($("#rec", el)) $("#rec", el).onclick = () => { chiudiFoglio(); setTimeout(() => apriRecensione(id), 300); };
  });
}

// ---------- pagamenti ----------
ROTTE.pagamenti = {
  tab: "menu", titolo: "Pagamenti",
  html() {
    return `
      <div class="box small riga-info">${ic("info")}<span>In app paghi solo il <b>servizio SOS (${euro(SUPPLEMENTO_URGENZA)})</b>, e solo se qualcuno arriva. Il lavoro lo paghi a chi lo fa, al prezzo che ti conferma prima di iniziare.</span></div>
      <h2>Le tue carte</h2>
      ${carte.length ? carte.map((k, i) => `<div class="carta" style="--i:${i}">
          <div class="riga2"><b>${k.circuito}</b>${i === 0 ? '<span class="pill">Predefinita</span>' : `<button class="pill btn-pill" data-pref="${k.id}">Rendi predefinita</button>`}</div>
          <div class="num">•••• •••• •••• ${k.ultime}</div>
          <div class="riga2"><span>${esc(utente.nome || "Titolare")}</span><span>Scade ${k.scad}</span><button class="pill btn-pill" data-tog="${k.id}" aria-label="Rimuovi">${ic("trash-2")}</button></div>
        </div>`).join("") : vuoto("credit-card", "<b>Nessuna carta salvata</b><br>La chiediamo solo quando serve.")}
      <button class="btn sec press" id="addCarta">${ic("plus")}Aggiungi una carta di prova</button>
      <h2>Altri metodi</h2>
      <div class="box">
        <div class="listino"><span>${ic("smartphone")}Apple Pay / Google Pay</span><b class="muted">nella versione vera</b></div>
        <div class="listino"><span>${ic("banknote")}Contanti a chi interviene</span><b style="color:var(--ok)">Sì, per il lavoro</b></div>
      </div>`;
  },
  dopo() {
    $("#addCarta").onclick = () => {
      const circ = ["Visa", "Mastercard", "Visa"][carte.length % 3];
      carte.push({ id: nuovoId(), circuito: circ, ultime: String(1000 + Math.floor(Math.random() * 9000)), scad: "0" + (3 + carte.length % 6) + "/29" });
      salva("carte", carte); render(); toast("Carta di prova aggiunta");
    };
    $$("[data-pref]").forEach(b => b.onclick = () => { const k = carte.find(x => x.id === b.dataset.pref); carte = [k, ...carte.filter(x => x !== k)]; salva("carte", carte); render(); toast(`${k.circuito} •••• ${k.ultime} ora è predefinita`); });
    $$("[data-tog]").forEach(b => b.onclick = () => conferma("Rimuovere questa carta?", () => { carte = carte.filter(x => x.id !== b.dataset.tog); salva("carte", carte); render(); toast("Carta rimossa"); }));
  },
};

// ---------- come funziona ----------
const SLIDE = [
  ["message-circle-warning", "Dici cosa è successo", "Perdita d'acqua, porta bloccata, gomma bucata… Bastano due tocchi, anche una foto se vuoi."],
  ["sparkles", "Ti proponiamo il migliore", "Guardiamo chi è libero e vicino, le recensioni e i documenti. Vedi tempo d'arrivo e prezzo indicativo prima di confermare."],
  ["navigation", "Lo segui mentre arriva", "Sulla mappa vedi dove si trova. Puoi scrivergli o chiamarlo senza dare il tuo numero."],
  ["star", "Paghi il giusto e lasci il voto", "Il prezzo te lo conferma prima di iniziare. Alla fine lasci la recensione: così i migliori salgono in classifica."],
];
ROTTE.come = {
  tab: "menu", titolo: "Come funziona",
  html() {
    return `
      <div class="slides" id="slides">${SLIDE.map(([i, t, p], n) => `<div class="slide"><div class="card">
        <div class="big-ic">${ic(i)}</div><span class="n">Passo ${n + 1} di ${SLIDE.length}</span><h2>${t}</h2><p>${p}</p></div></div>`).join("")}</div>
      <div class="dots" id="dots">${SLIDE.map((_, n) => `<i class="${n ? "" : "on"}"></i>`).join("")}</div>
      <button class="btn press" id="avanti">Avanti ${ic("arrow-right")}</button>
      <div class="box small riga-info" style="margin-top:14px">${ic("briefcase")}<span>Sei un'azienda o lavori in proprio? <a href="#/artigiano"><b>Scopri come ricevere richieste</b></a></span></div>`;
  },
  dopo() {
    const s = $("#slides"), dots = $$("#dots i");
    const attuale = () => Math.round(s.scrollLeft / s.clientWidth);
    const segna = () => {
      const n = attuale();
      dots.forEach((d, i) => d.classList.toggle("on", i === n));
      $("#avanti").innerHTML = n === SLIDE.length - 1 ? `Prova adesso ${ic("arrow-right")}` : `Avanti ${ic("arrow-right")}`;
    };
    s.addEventListener("scroll", () => { clearTimeout(s._t); s._t = setTimeout(segna, 60); }, { passive: true });
    dots.forEach((d, i) => d.onclick = () => s.scrollTo({ left: i * s.clientWidth, behavior: "smooth" }));
    $("#avanti").onclick = () => {
      const n = attuale();
      if (n >= SLIDE.length - 1) location.hash = "#/";
      else s.scrollTo({ left: (n + 1) * s.clientWidth, behavior: "smooth" });
    };
  },
};

// ---------- garanzia ----------
ROTTE.garanzia = {
  tab: "menu", titolo: "Garanzia",
  html() {
    const punti = [
      ["badge-check", "Solo professionisti verificati", "Controlliamo documento, partita IVA e assicurazione prima di farli lavorare."],
      ["receipt-text", "Prezzo confermato prima", "Chi interviene ti dice il prezzo prima di iniziare. Niente sorprese alla fine."],
      ["rotate-ccw", "Lavoro rifatto gratis", "Se entro 30 giorni il problema si ripresenta, mandiamo qualcuno senza costi di uscita."],
      ["shield-check", "Danni coperti", "Se durante il lavoro si rompe qualcosa, la copertura arriva fino a 1.000 €."],
      ["headset", "Assistenza vera", "Una persona ti risponde in chat entro 10 minuti, anche la sera."],
    ];
    return `
      <div class="dark-top"><span>Garanzia Pronto Mestieri</span><b>Se qualcosa va storto, ci pensiamo noi.</b><span>Vale per ogni intervento prenotato in app.</span></div>
      ${punti.map(([i, t, p], n) => `<div class="voce" style="--i:${n}"><span class="v-ic ok">${ic(i)}</span><div class="v-tx"><b>${t}</b><span>${p}</span></div></div>`).join("")}
      <p class="muted small center" style="margin-top:14px">Condizioni dimostrative del prototipo.</p>
      <a class="btn sec press" href="#/aiuto">${ic("life-buoy")}Apri una segnalazione</a>`;
  },
};

// ---------- aiuto ----------
const FAQ = [
  ["Quanto costa usare l'app?", `Cercare e scrivere è gratis. Per l'SOS paghi ${euro(SUPPLEMENTO_URGENZA)} solo se qualcuno accetta e arriva. Il lavoro lo paghi a chi lo fa.`],
  ["Come scegliete il professionista?", "Guardiamo distanza, disponibilità in quel momento, recensioni, documenti e quanti lavori ha fatto bene. Vedi sempre anche le alternative."],
  ["E se il prezzo finale è diverso?", "Chi interviene deve confermarti il prezzo prima di iniziare. Se cambia senza motivo, segnalacelo: interviene la Garanzia."],
  ["Posso annullare una richiesta SOS?", "Sì, finché nessuno ha accettato non paghi nulla. Dopo, puoi annullare dalla pagina di tracciamento."],
  ["Chi vede il mio numero?", "Nessuno. Chiamate e messaggi passano dall'app."],
  ["Lavoro in proprio, posso iscrivermi?", "Sì: dalla scheda «Lavora» ti iscrivi in pochi minuti e accendi la disponibilità quando sei libero."],
];
ROTTE.aiuto = {
  tab: "menu", titolo: "Aiuto e assistenza",
  html() {
    return `
      <a class="sos-112" href="tel:112">${ic("siren")}<span><b>Feriti o pericolo?</b><br>Chiama subito il 112</span>${ic("phone")}</a>
      <h2>Domande frequenti</h2>
      <div class="faq">${FAQ.map(([d, r]) => `<div class="grp"><button class="press">${d}<span class="ar">${ic("chevron-right")}</span></button>
        <div class="list"><div><p>${r}</p></div></div></div>`).join("")}</div>
      <h2>Serve altro?</h2>
      <button class="btn press" id="scrivi">${ic("message-circle")}Scrivi all'assistenza</button>
      <p class="muted small center">Ti risponde una persona, di solito entro 10 minuti.</p>`;
  },
  dopo() {
    $$(".faq .grp > button").forEach(b => b.onclick = () => {
      const g = b.parentElement, apri = !g.classList.contains("open");
      $$(".faq .grp.open").forEach(x => x.classList.remove("open"));
      g.classList.toggle("open", apri);
    });
    $("#scrivi").onclick = () => {
      const recenti = richieste.slice(0, 4);
      apriFoglio(`<h3>Scrivi all'assistenza</h3>
        <label class="f">Di cosa si tratta?</label>
        <select class="in" id="hTema"><option>Un intervento</option><option>Pagamenti e ricevute</option><option>Il mio account</option><option>Altro</option></select>
        ${recenti.length ? `<label class="f">Quale richiesta? <span class="muted">(facoltativo)</span></label><select class="in" id="hRic"><option value="">Nessuna in particolare</option>${recenti.map(r => `<option>${esc(r.problema || cat(r.categoria).nome)}</option>`).join("")}</select>` : ""}
        <label class="f">Raccontaci</label><textarea class="in" id="hTxt" style="min-height:90px" placeholder="Scrivi qui cosa è successo"></textarea>
        <div style="height:14px"></div><button class="btn press" id="hOk">${ic("send")}Invia</button>`,
      el => $("#hOk", el).onclick = () => {
        if ($("#hTxt", el).value.trim().length < 5) return toast("Scrivi due righe su cosa è successo");
        chiudiFoglio(); toast("Inviato: ti rispondiamo entro 10 minuti");
      });
    };
  },
};

// ---------- invita un amico ----------
ROTTE.invita = {
  tab: "menu", titolo: "Invita un amico",
  html() {
    if (!impost.codice) { impost.codice = "MARCHE-" + Math.random().toString(36).slice(2, 6).toUpperCase(); salva("impost", impost); }
    return `
      <div class="center" style="margin-top:8px"><div class="big-ic regalo">${ic("gift")}</div>
        <h1 style="margin:14px 0 6px">5 € a te, 5 € a un amico</h1>
        <p class="muted" style="margin:0">Quando un amico usa il tuo codice al primo SOS, ricevete 5 € di sconto tutti e due.</p></div>
      <div class="codice" id="codice">${impost.codice}</div>
      <div class="row" style="gap:8px"><button class="btn sec press" id="copia">${ic("copy")}Copia</button><button class="btn press" id="condividi">${ic("share-2")}Condividi</button></div>
      <div class="kpi k3" style="margin-top:18px"><div><b>0</b>amici invitati</div><div><b>0</b>hanno usato l'app</div><div><b>0 €</b>credito</div></div>`;
  },
  dopo() {
    const msg = `Ti regalo 5 € su Pronto Mestieri, l'app per trovare subito idraulici, elettricisti e soccorso stradale nelle Marche. Usa il codice ${impost.codice}`;
    const copia = async () => { try { await navigator.clipboard.writeText(msg); toast("Messaggio copiato: incollalo dove vuoi"); } catch { toast("Codice: " + impost.codice); } };
    $("#copia").onclick = copia;
    $("#condividi").onclick = async () => {
      if (navigator.share) { try { await navigator.share({ title: "Pronto Mestieri", text: msg }); } catch {} }
      else copia();
    };
  },
};

// ---------- impostazioni ----------
ROTTE.impostazioni = {
  tab: "menu", titolo: "Impostazioni",
  html() {
    const t = (k, nome, sub) => `<div class="switch riga-imp"><div><b>${nome}</b><div class="muted small">${sub}</div></div><button class="tog ${impost[k] ? "on" : ""}" data-imp="${k}" aria-label="${nome}"></button></div>`;
    return `
      <h2 style="margin-top:8px">Zona</h2>
      <button class="box riga-link press" id="zona" style="width:100%;border:0;text-align:left">${ic("map-pin")}<span>Cerchi aiuto a <b>${esc(zona.citta)}</b></span><span class="muted small">Cambia</span></button>
      <h2>Notifiche</h2>
      <div class="box">
        ${t("sos", "SOS e arrivi", "Quando qualcuno accetta e quando sta per arrivare")}
        ${t("chat", "Messaggi", "Risposte di aziende e professionisti")}
        ${t("offerte", "Novità e offerte", "Al massimo una volta al mese")}
      </div>
      <h2>Lingua</h2>
      <div class="chips wrap"><button class="chip ${impost.lingua === "it" ? "on" : ""}" data-lg="it">🇮🇹 Italiano</button><button class="chip ${impost.lingua === "en" ? "on" : ""}" data-lg="en">🇬🇧 English</button></div>
      <h2>Demo</h2>
      <button class="btn ghost" id="azzera" style="color:var(--sos1)">${ic("rotate-ccw")}Azzera la demo</button>`;
  },
  dopo() {
    $("#zona").onclick = () => scegliZona(false);
    $$("[data-imp]").forEach(b => b.onclick = () => {
      const k = b.dataset.imp; impost[k] = !impost[k]; salva("impost", impost); b.classList.toggle("on", impost[k]);
      toast(impost[k] ? "Notifiche attivate" : "Notifiche disattivate");
    });
    $$("[data-lg]").forEach(b => b.onclick = () => {
      if (b.dataset.lg === "en") return toast("English coming soon: per ora l'app è in italiano");
      impost.lingua = "it"; salva("impost", impost);
    });
    $("#azzera").onclick = azzeraDemo;
  },
};

// ---------- termini e privacy ----------
ROTTE.info = {
  tab: "menu", titolo: "Termini e privacy",
  html() {
    return `
      <div class="box"><h3>${ic("file-text")}In breve</h3>
        <p class="small testo">Pronto Mestieri mette in contatto chi ha un problema con aziende e professionisti verificati della zona. Il contratto per il lavoro è tra te e chi interviene; noi garantiamo la piattaforma, i controlli e l'assistenza.</p></div>
      <div class="box"><h3>${ic("lock")}I tuoi dati</h3>
        <p class="small testo">Usiamo nome, posizione e foto solo per gestire le tue richieste. Il numero di telefono non viene mai mostrato. Puoi cancellare tutto quando vuoi.</p></div>
      <div class="box"><h3>${ic("flask-conical")}Questo è un prototipo</h3>
        <p class="small testo">Aziende, recensioni e pagamenti sono di esempio. I dati che inserisci restano solo su questo dispositivo.</p>
        <div class="listino"><span>Versione</span><b>${VERSIONE}</b></div></div>`;
  },
};
