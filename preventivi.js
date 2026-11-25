// "Chiedi 3 preventivi": per chi non ha un'emergenza ma un lavoro da programmare.
// Descrivi il lavoro una volta, lo mandiamo alle 3 aziende migliori della zona, rispondono con prezzo e data.

let prev = { cat: null, testo: "", quando: "presto", ind: "", foto: [] };
const QUANDO = { presto: "Appena possibile", "2sett": "Entro 2 settimane", mese: "Entro un mese", flessibile: "Sono flessibile" };
const SUGGERITI = ["imbianchino", "muratore", "idraulico", "elettricista", "clima", "giardiniere"];
const GIORNI_SETT = ["Domani", "Giovedì", "Lunedì prossimo", "Venerdì", "Tra 10 giorni"];

function preparaOfferte(categoria) {
  const migliori = inZona(ARTIGIANI.filter(a => a.categoria === categoria)).sort((a, b) => punteggio(b) - punteggio(a)).slice(0, 3);
  const ora = Date.now();
  return migliori.map((a, i) => {
    const ore = 5 + (a.id % 5) * 3;
    const da = Math.round((a.tariffaOra * ore + (a.uscita || 0)) / 10) * 10;
    const frasi = [
      `Buongiorno, ${a.tipo === "azienda" ? "possiamo" : "posso"} passare a vedere e confermarle il prezzo sul posto. Materiali inclusi nel preventivo.`,
      `Lavoro che facciamo spesso. Il prezzo comprende manodopera e smaltimento, i materiali li scegliamo insieme.`,
      `Disponibile per un sopralluogo gratuito. Se mi manda qualche foto in chat le do un prezzo più preciso.`,
    ];
    return { id: a.id, da, a: Math.round(da * 1.3 / 10) * 10, quando: GIORNI_SETT[(a.id + i) % GIORNI_SETT.length], msg: frasi[i % 3], arrivo: ora + 2200 + i * 2600 };
  });
}

ROTTE.preventivo = {
  tab: "home", titolo: "Chiedi 3 preventivi",
  html(id) { return id ? paginaOfferte(id) : moduloPreventivo(); },
  dopo(id) { id ? dopoOfferte(id) : dopoModulo(); },
  esci() { clearTimeout(ROTTE.preventivo._t); },
};

// ---------- modulo ----------
function moduloPreventivo() {
  const c = prev.cat && cat(prev.cat);
  if (!prev.ind && indirizzi.length) prev.ind = testoIndirizzo(indirizzi.find(x => x.tipo === "casa") || indirizzi[0]);
  return `
    <div class="prev-hero"><span class="pe">${ic("file-text")}</span><div><b>Un lavoro da programmare?</b>
      <span>Lo descrivi una volta sola: le 3 aziende migliori della zona ti rispondono con prezzo e data. Gratis e senza impegno.</span></div></div>
    <label class="f">Che lavoro è?</label>
    <button class="sel press" id="pCat">${c ? `${em(c)}<b>${c.nome}</b>` : `${ic("search")}<span>Scegli il mestiere</span>`}${ic("chevron-down")}</button>
    ${c ? "" : `<div class="chips wrap" style="margin-top:8px">${SUGGERITI.map(id => { const k = cat(id); return `<button class="chip" data-qc="${id}">${em(k)}${k.nome}</button>`; }).join("")}</div>`}
    <label class="f">Descrivi cosa ti serve</label>
    <textarea class="in" id="pTxt" style="min-height:96px" placeholder="${c ? esempioPer(c.id) : "Es. rifare il bagno di 6 mq, togliere la vasca e mettere la doccia"}">${esc(prev.testo)}</textarea>
    <label class="f">Quando?</label>
    <div class="chips wrap">${Object.entries(QUANDO).map(([k, t]) => `<button class="chip ${prev.quando === k ? "on" : ""}" data-qn="${k}">${t}</button>`).join("")}</div>
    <label class="f">Dove?</label>
    ${indirizzi.length ? `<div class="chips wrap" style="margin-bottom:8px">${indirizzi.map(x => `<button class="chip ${prev.ind === testoIndirizzo(x) ? "on" : ""}" data-pi="${x.id}">${ic(ETICHETTE[x.tipo][0])}${ETICHETTE[x.tipo][1]}</button>`).join("")}</div>` : ""}
    <input class="in" id="pInd" placeholder="Via e numero civico, ${esc(zona.citta)}" value="${esc(prev.ind)}" autocomplete="street-address">
    <label class="f">Foto <span class="muted">(facoltativo, aiutano a dare un prezzo giusto)</span></label>
    <label class="upload press">${ic("camera")}<b>Aggiungi foto</b><input type="file" accept="image/*" multiple id="pFoto"></label>
    <div class="thumbs" id="pThumbs">${prev.foto.map(f => `<img src="${f}" alt="">`).join("")}</div>
    <div class="garanzie-mini">
      <span>${ic("badge-check")}Solo aziende verificate</span><span>${ic("clock")}Rispondono in poche ore</span><span>${ic("hand-coins")}Gratis, senza impegno</span>
    </div>
    <div class="cta-space"></div>
    <div class="cta"><button class="btn press" id="pInvia">${ic("send")}Invia a 3 aziende</button></div>`;
}
function esempioPer(id) {
  return {
    imbianchino: "Es. tinteggiare soggiorno e due camere, circa 70 mq, pareti bianche",
    muratore: "Es. rifare il bagno di 6 mq, togliere la vasca e mettere la doccia",
    idraulico: "Es. sostituire lo scaldabagno e i rubinetti della cucina",
    elettricista: "Es. aggiungere 4 prese in soggiorno e cambiare il quadro elettrico",
    clima: "Es. installare 2 condizionatori, camera e soggiorno",
    giardiniere: "Es. potatura siepe e taglio prato, giardino di circa 200 mq",
  }[id] || "Racconta cosa va fatto, le misure e cosa ti aspetti";
}
function dopoModulo() {
  const leggi = () => { prev.testo = $("#pTxt").value; prev.ind = $("#pInd").value; };
  const scegli = id => { leggi(); prev.cat = id; chiavePrima = null; render(); };
  $("#pCat").onclick = () => { leggi(); apriFoglio(`<h3>Che lavoro è?</h3>
    ${GRUPPI.map(g => `<div class="prov">${em(g)}${g.nome}</div><div class="chips wrap">${CATEGORIE.filter(c => c.gruppo === g.id).map(c => `<button class="chip ${prev.cat === c.id ? "on" : ""}" data-u="${c.id}">${em(c)}${c.nome}</button>`).join("")}</div>`).join("")}`,
    el => $$("[data-u]", el).forEach(b => b.onclick = () => { chiudiFoglio(); scegli(b.dataset.u); })); };
  $$("[data-qc]").forEach(b => b.onclick = () => scegli(b.dataset.qc));
  $$("[data-qn]").forEach(b => b.onclick = () => { prev.quando = b.dataset.qn; $$("[data-qn]").forEach(x => x.classList.toggle("on", x === b)); });
  $$("[data-pi]").forEach(b => b.onclick = () => {
    prev.ind = testoIndirizzo(indirizzi.find(x => x.id === b.dataset.pi)); $("#pInd").value = prev.ind;
    $$("[data-pi]").forEach(x => x.classList.toggle("on", x === b));
  });
  $("#pInd").oninput = () => $$("[data-pi]").forEach(x => x.classList.remove("on"));
  $("#pFoto").onchange = async e => {
    for (const f of [...e.target.files].slice(0, 6)) { const m = await miniatura(f, 240); if (m) prev.foto.push(m); }
    prev.foto = prev.foto.slice(-6);
    $("#pThumbs").innerHTML = prev.foto.map(f => `<img src="${f}" alt="">`).join("");
  };
  $("#pInvia").onclick = () => {
    leggi();
    if (!prev.cat) { toast("Scegli che lavoro è"); return window.scrollTo({ top: 0, behavior: "smooth" }); }
    if (prev.testo.trim().length < 10) { toast("Descrivi il lavoro in due righe"); return $("#pTxt").focus(); }
    if (prev.ind.trim().length < 4) { toast("Scrivi dove va fatto il lavoro"); return $("#pInd").focus(); }
    const offerte = preparaOfferte(prev.cat);
    if (!offerte.length) return toast("Nessuna azienda di questo mestiere in zona: prova a cambiare città");
    const r = nuovaRichiesta({
      tipo: "preventivo", categoria: prev.cat, problema: "Preventivo · " + cat(prev.cat).nome, testo: prev.testo.trim(),
      quando: QUANDO[prev.quando], indirizzo: prev.ind.trim(), foto: prev.foto, offerte, stato: "proposte",
    });
    prev = { cat: null, testo: "", quando: "presto", ind: "", foto: [] };
    location.hash = "#/preventivo/" + r.id;
  };
}

// ---------- le risposte ----------
function paginaOfferte(id) {
  const r = richieste.find(x => x.id === id);
  if (!r) return vuoto("search-x", "Richiesta non trovata");
  const c = cat(r.categoria), ora = Date.now();
  const arrivate = r.offerte.filter(o => o.arrivo <= ora), scelta = r.proId;
  return `
    <div class="box prev-rias">
      <div class="best-h"><span class="pe">${em(c)}</span><div><b>${c.nome}</b><div class="muted small">${esc(r.quando)} · ${esc(r.indirizzo)}</div></div></div>
      <p class="small">“${esc(r.testo)}”</p>
      ${r.foto?.length ? `<div class="thumbs">${r.foto.map(f => `<img src="${f}" alt="">`).join("")}</div>` : ""}
    </div>
    <h2>${scelta ? "Hai scelto" : "Le risposte"} <span class="muted small">${arrivate.length} di ${r.offerte.length}</span></h2>
    ${r.offerte.map((o, i) => {
      if (o.arrivo > ora) return `<div class="offerta attesa"><div class="sk av"></div><div style="flex:1"><div class="sk l1"></div><div class="sk l2"></div></div><span class="muted small">Sta preparando il preventivo…</span></div>`;
      const a = { ...pro(o.id) }; a.dist = distanza(a);
      const mia = scelta === o.id;
      return `<div class="offerta ${scelta && !mia ? "spenta" : ""} ${mia ? "scelta" : ""}" style="--i:${i}">
        <div class="best-h">${avatar(a, "s")}<div style="flex:1;min-width:0"><div class="nome">${esc(a.nome)} ${spunta(a)}</div>
          <div class="riga">${voto(a)}<span>(${a.numRecensioni})</span><span>${ic("map-pin")}${a.dist} km</span></div></div>
          <div class="prezzo-big"><b>${o.da}–${o.a} €</b><span>${ic("calendar")}${o.quando}</span></div></div>
        <p class="small msg">“${o.msg}”</p>
        <div class="row">
          <a class="btn sec press" href="#/chat/${a.id}">${ic("message-circle")}Scrivi</a>
          ${scelta ? (mia ? `<span class="badge ora-v" style="align-self:center">${ic("check")}Scelto</span>` : "") : `<button class="btn press" data-acc="${o.id}">${ic("check")}Scegli</button>`}
        </div></div>`;
    }).join("")}
    ${scelta ? `<div class="box small riga-info">${ic("info")}<span>Abbiamo avvisato le altre aziende. Quando il lavoro è finito, chiudilo da <a href="#/richieste"><b>Richieste</b></a> e lascia la recensione.</span></div>`
      : `<p class="muted small center">Puoi scrivere a ognuno prima di scegliere. Nessun impegno finché non premi "Scegli".</p>`}`;
}
function dopoOfferte(id) {
  const r = richieste.find(x => x.id === id);
  if (!r) return;
  $("#brand").innerHTML = "<span>I tuoi preventivi</span>";
  if (r.nuovo) aggiornaRichiesta(id, { nuovo: false });
  const prossima = r.offerte.map(o => o.arrivo).filter(t => t > Date.now()).sort()[0];
  clearTimeout(ROTTE.preventivo._t);
  if (prossima) ROTTE.preventivo._t = setTimeout(() => {
    if (location.hash === "#/preventivo/" + id) { render(); toast("Nuovo preventivo arrivato"); }
  }, prossima - Date.now() + 50);
  $$("[data-acc]").forEach(b => b.onclick = () => {
    const o = r.offerte.find(x => x.id === +b.dataset.acc), a = pro(o.id);
    aggiornaRichiesta(id, { stato: "accettata", proId: o.id, prezzo: `${o.da}–${o.a} €` });
    toast(`Hai scelto ${nomeBreve(a)}: ti contatta per fissare il giorno`); render();
  });
}
