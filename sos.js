// SOS: in casa o per strada. L'app capisce chi serve, propone il migliore vicino e lo segue sulla mappa.

let sos = { luogo: null, problema: null, cat: null, foto: [], note: "", ind: "", pos: null, posInfo: "" };
const DURATA_DEMO = 40000; // nella demo il mezzo "arriva" in 40 secondi

// indirizzi e veicoli salvati nel menu: un tocco e sono compilati
const chipIndirizzi = () => indirizzi.map(x => `<button class="chip ${sos.ind === testoIndirizzo(x) ? "on" : ""}" data-ind="${x.id}">${ic(ETICHETTE[x.tipo][0])}${ETICHETTE[x.tipo][1]}</button>`).join("")
  + `<button class="chip" id="indNuovo">${ic("plus")}${indirizzi.length ? "Nuovo" : "Salva un indirizzo"}</button>`;
const chipVeicoli = () => veicoli.map(v => `<button class="chip ${sos.veicolo === v.id ? "on" : ""}" data-vei="${v.id}">${ic(MEZZI[v.tipo][0])}${esc(v.modello)}</button>`).join("")
  + `<button class="chip" id="veiNuovo">${ic("plus")}${veicoli.length ? "Altro veicolo" : "Aggiungi il tuo veicolo"}</button>`;
function collegaSalvati() {
  const ind = $("#indSos"), vei = $("#veicoliSos");
  if (ind) {
    $$("[data-ind]", ind).forEach(b => b.onclick = () => {
      const x = indirizzi.find(y => y.id === b.dataset.ind);
      sos.ind = testoIndirizzo(x); $("#ind").value = sos.ind;
      $$("[data-ind]", ind).forEach(c => c.classList.toggle("on", c === b));
    });
    $("#indNuovo").onclick = () => { sos.note = $("#note").value; formIndirizzo(x => { sos.ind = testoIndirizzo(x); $("#ind").value = sos.ind; ind.innerHTML = chipIndirizzi(); collegaSalvati(); }); };
    $("#ind").oninput = () => { sos.ind = $("#ind").value; $$("[data-ind]", ind).forEach(c => c.classList.remove("on")); };
  }
  if (vei) {
    $$("[data-vei]", vei).forEach(b => b.onclick = () => {
      sos.veicolo = sos.veicolo === b.dataset.vei ? null : b.dataset.vei;
      $$("[data-vei]", vei).forEach(c => c.classList.toggle("on", c.dataset.vei === sos.veicolo));
    });
    $("#veiNuovo").onclick = () => formVeicolo(v => { sos.veicolo = v.id; vei.innerHTML = chipVeicoli(); collegaSalvati(); });
  }
}

function problemaScelto() { return sos.luogo && PROBLEMI[sos.luogo].find(p => p.id === sos.problema); }
const nomeCorto = p => p.nome.replace(/, serve.*$/, "");

// ---------- parole con cui la gente descrive i problemi (per la ricerca) ----------
const PAROLE_PROBLEMI = {
  perdita: "acqua perde perdita tubo lavandino allagato allagamento gocciola rubinetto bagnato infiltrazione",
  corrente: "corrente luce salta salvavita blackout elettricità presa buio quadro",
  caldaia: "caldaia acqua calda riscaldamento termosifoni freddo doccia fredda boiler",
  chiuso: "chiuso fuori chiavi porta serratura bloccata blindata",
  scarico: "scarico intasato wc water bagno otturato fogna tappato",
  vetro: "vetro rotto finestra vetrina crepato",
  tapparella: "tapparella bloccata avvolgibile persiana cinghia",
  insetti: "insetti vespe topi blatte scarafaggi calabroni nido disinfestazione",
  gomma: "gomma bucata ruota foratura pneumatico forata sgonfia",
  batteria: "batteria scarica auto non parte avviamento macchina morta",
  panne: "panne guasto carro attrezzi motore fermo rotta fumo traino",
  incidente: "incidente sinistro carrozzeria urto tamponamento botta",
  chiavi: "chiavi chiuse dentro macchina auto",
  benzina: "benzina carburante finito secco gasolio diesel",
};
function cercaAiuto(q) {
  const t = q.trim().toLowerCase();
  if (t.length < 2) return { problemi: [], mestieri: [] };
  const parole = t.split(/\s+/).filter(p => p.length > 2);
  const tocca = testo => testo.includes(t) || parole.some(p => testo.split(/\s+/).some(w => w.startsWith(p.slice(0, Math.max(4, p.length - 2)))));
  const problemi = Object.entries(PROBLEMI).flatMap(([l, lista]) => lista.map(p => ({ l, p })))
    .filter(({ p }) => tocca((p.nome + " " + (PAROLE_PROBLEMI[p.id] || "")).toLowerCase()));
  const mestieri = CATEGORIE.filter(c => tocca((c.nome + " " + c.parole).toLowerCase()));
  return { problemi, mestieri };
}

// ---------- cosa fare mentre aspetti ----------
const CONSIGLI = {
  perdita: ["Chiudi il rubinetto generale dell'acqua (di solito vicino al contatore).", "Stacca la corrente se l'acqua arriva vicino a prese o elettrodomestici.", "Metti stracci e secchi e fai una foto: serve per l'assicurazione."],
  corrente: ["Guarda il quadro elettrico e prova a rialzare il salvavita.", "Se scatta subito, stacca tutte le spine e riprova.", "Non toccare fili o prese bruciate: aspetta il tecnico."],
  caldaia: ["Annota il codice di errore sul display: aiuta il tecnico.", "Controlla la pressione: di solito sta tra 1 e 1,5 bar.", "Se senti odore di gas chiudi il contatore, apri le finestre, esci e chiama il 112."],
  chiuso: ["Non forzare la porta: rischi di rovinare la serratura e spendere di più.", "Se un vicino o un parente ha una copia delle chiavi, chiamalo intanto.", "Tieni pronto un documento: il fabbro può chiederlo."],
  scarico: ["Non tirare più l'acqua.", "Se continua a salire, chiudi il rubinetto sotto il WC o il lavandino.", "Evita prodotti chimici aggressivi: rovinano le tubature."],
  vetro: ["Allontana bambini e animali dai frammenti.", "Raccogli i pezzi grandi con guanti spessi e copri il buco con cartone e nastro.", "Fai una foto per l'assicurazione."],
  tapparella: ["Non tirare la cinghia con forza: rischi di spezzarla.", "Se è a metà, prova a sollevarla piano dal basso con due mani.", "Se sai marca e misura della finestra, annotale."],
  insetti: ["Non avvicinarti al nido e tieni chiuse le finestre vicine.", "Tieni lontani bambini e animali.", "Se qualcuno allergico viene punto, chiama subito il 112."],
  gomma: ["Accendi le quattro frecce e accosta in un punto sicuro.", "Indossa il giubbotto e metti il triangolo a 50 metri (100 in autostrada).", "Aspetta dietro il guardrail, non dentro l'auto."],
  batteria: ["Spegni luci, radio e aria condizionata.", "Se sei in strada accendi le quattro frecce.", "Se hai i cavi in auto, tirali fuori: possono servire."],
  panne: ["Accendi le quattro frecce e metti il triangolo a 50 metri (100 in autostrada).", "Indossa il giubbotto prima di scendere.", "Aspetta fuori dall'auto, dietro il guardrail."],
  incidente: ["Se ci sono feriti chiama subito il 112.", "Metti in sicurezza: quattro frecce, giubbotto, triangolo.", "Fai foto ai veicoli e, se potete, compilate la constatazione amichevole."],
  chiavi: ["Controlla se un'altra portiera o il bagagliaio sono aperti.", "Se dentro c'è un bambino o un animale e fa caldo, chiama subito il 112.", "Tieni pronto un documento: il fabbro può chiederlo."],
  benzina: ["Accendi le quattro frecce e accosta dove puoi.", "Indossa il giubbotto e metti il triangolo.", "Il soccorso ti porta il carburante o ti traina al distributore."],
  casa: ["Metti in sicurezza la zona e tieni lontani bambini e animali.", "Prepara qualche foto del problema: aiuta chi arriva.", "Se c'è pericolo per le persone, chiama il 112."],
  strada: ["Accendi le quattro frecce e accosta in un punto sicuro.", "Indossa il giubbotto catarifrangente prima di scendere.", "Aspetta fuori dall'auto, dietro il guardrail."],
};
const consigliPer = (id, luogo) => CONSIGLI[id] || CONSIGLI[luogo] || CONSIGLI.casa;
function boxConsigli(id, luogo, titolo = "Intanto fai così") {
  return `<div class="consigli"><b>${ic("lightbulb")}${titolo}</b><ol>${consigliPer(id, luogo).map(c => `<li>${c}</li>`).join("")}</ol></div>`;
}

// ---------- SOS: 1) tocchi il problema  2) una sola schermata e "Trova" ----------
const tileProblema = (l, x, i) => `<button class="ptile press" data-pp="${l}.${x.id}" style="--i:${i}"><span class="pe">${em(x)}</span><span>${nomeCorto(x)}</span></button>`;
ROTTE.urgenza = {
  tab: "urgenza", titolo: "SOS",
  html(arg) {
    if (arg) { const [l, p] = arg.split("."); if (PROBLEMI[l] && PROBLEMI[l].some(x => x.id === p)) { sos.luogo = l; sos.problema = p; sos.cat = null; } history.replaceState(null, "", "#/urgenza"); }
    if (!sos.luogo) return `
      <h1 style="margin:10px 0 4px">Cosa è successo?</h1>
      <p class="muted" style="margin:0 0 6px">Tocca il tuo problema: al resto pensiamo noi.</p>
      <div class="eyebrow">🏠 In casa</div>
      <div class="pgrid">${PROBLEMI.casa.map((x, i) => tileProblema("casa", x, i)).join("")}</div>
      <div class="eyebrow">🚗 Per strada</div>
      <div class="pgrid">${PROBLEMI.strada.map((x, i) => tileProblema("strada", x, i + 8)).join("")}
        <button class="ptile altro press" id="altro"><span class="pe">${ic("plus")}</span><span>Altro problema</span></button></div>
      <a class="sos-112" href="tel:112" style="margin-top:16px">${ic("siren")}<span><b>Feriti o pericolo?</b><br>Chiama subito il 112</span>${ic("phone")}</a>`;

    // se hai salvato casa o un solo veicolo, sono già scelti
    if (sos.luogo === "casa" && !sos.ind && indirizzi.length) sos.ind = testoIndirizzo(indirizzi.find(x => x.tipo === "casa") || indirizzi[0]);
    if (sos.luogo === "strada" && !veicoli.some(v => v.id === sos.veicolo)) sos.veicolo = veicoli.length === 1 ? veicoli[0].id : null;
    const p = problemaScelto(), altra = !p && sos.cat && cat(sos.cat);
    const strada = sos.luogo === "strada";
    const consiglio = consigliPer(p?.id, sos.luogo)[0];
    return `
      <div class="scelto">
        <span class="pe">${em(p || altra)}</span>
        <div><span>${strada ? "Problema per strada" : "Problema in casa"}</span><b>${p ? p.nome : altra.nome}</b></div>
        <button class="chip" id="cambia">Cambia</button>
      </div>
      <div class="consiglio-mini">${ic("lightbulb")}<span><b>Intanto:</b> ${consiglio}</span></div>
      <div>${strada ? `
        <label class="f">Dove sei adesso?</label>
        <div class="posbox"><span class="ico">${ic("locate-fixed")}</span><div style="flex:1"><b id="posT">${sos.pos ? "Posizione rilevata" : "Cerco la tua posizione…"}</b>
          <div class="muted small" id="posS">${esc(sos.posInfo) || "Serve per mandarti il soccorso più vicino"}</div></div></div>
        <div class="minimap" id="minimap"></div>
        <p class="muted small" style="margin:6px 0 0">Se non è preciso, trascina il segnaposto sul punto giusto.</p>
        <label class="f">Con quale veicolo? <span class="muted">(facoltativo)</span></label>
        <div class="chips wrap" id="veicoliSos">${chipVeicoli()}</div>`
      : `<label class="f">Dove?</label>
        <div class="chips wrap" id="indSos" style="margin-bottom:8px">${chipIndirizzi()}</div>
        <input class="in" id="ind" placeholder="Via e numero civico, ${esc(zona.citta)}" value="${esc(sos.ind)}" autocomplete="street-address">`}</div>
      <details class="facolt" ${sos.foto.length || sos.note ? "open" : ""}>
        <summary>${ic("camera")}<span>Aggiungi una foto o due righe</span><em>facoltativo</em>${ic("chevron-down")}</summary>
        <label class="upload press">${ic("camera")}<b>Scatta o scegli una foto</b><input type="file" accept="image/*" capture="environment" multiple id="ufoto"></label>
        <div class="thumbs" id="thumbs">${sos.foto.map(f => `<img src="${f}" alt="">`).join("")}</div>
        <textarea class="in" id="note" style="margin-top:10px;min-height:70px" placeholder="${strada ? "Es. auto bianca, corsia di emergenza della SS16" : "Es. esce acqua dal tubo sotto il lavello"}">${esc(sos.note)}</textarea>
      </details>
      <div class="riepilogo">
        <div><span>Intervento stimato</span><b>${p ? p.prezzo : "te lo dice prima di iniziare"}</b></div>
        <div class="muted small"><span>Lo paghi a chi interviene, che ti conferma il prezzo prima di iniziare.</span></div>
        <div class="tot"><span>Servizio SOS <small class="muted">(solo se arriva)</small></span><span>${euro(SUPPLEMENTO_URGENZA)}</span></div>
      </div>
      <div class="cta-space"></div>
      <div class="cta cta-sos"><button class="btn sos press" id="vai">${ic("zap")}Trova chi arriva prima</button></div>`;
  },
  dopo() {
    const sceltaAltro = () => apriFoglio(`<h3>Chi ti serve?</h3>
      ${GRUPPI.map(g => `<div class="prov">${em(g)}${g.nome}</div><div class="chips wrap">${CATEGORIE.filter(c => c.gruppo === g.id).map(c => `<button class="chip" data-u="${c.id}">${em(c)}${c.nome}</button>`).join("")}</div>`).join("")}`,
      el => $$("[data-u]", el).forEach(b => b.onclick = () => {
        sos.cat = b.dataset.u; sos.problema = null; sos.luogo = cat(sos.cat).gruppo === "auto" ? "strada" : "casa";
        chiudiFoglio(); chiavePrima = null; render(); window.scrollTo(0, 0);
      }));
    if (!sos.luogo) {
      $$("[data-pp]").forEach(b => b.onclick = () => {
        const [l, id] = b.dataset.pp.split(".");
        sos.luogo = l; sos.problema = id; sos.cat = null;
        setTimeout(() => { chiavePrima = null; render(); window.scrollTo(0, 0); }, 160);   // lascia vedere il tocco
      });
      $("#altro").onclick = sceltaAltro;
      return;
    }
    const ricorda = () => { sos.note = $("#note").value; if ($("#ind")) sos.ind = $("#ind").value; };
    $("#cambia").onclick = () => { ricorda(); sos.luogo = null; sos.problema = null; sos.cat = null; chiavePrima = null; render(); window.scrollTo(0, 0); };
    $("#ufoto").onchange = async e => {
      ricorda();
      for (const f of [...e.target.files].slice(0, 4)) { const m = await miniatura(f, 240); if (m) sos.foto.push(m); }
      sos.foto = sos.foto.slice(-4);
      $("#thumbs").innerHTML = sos.foto.map(f => `<img src="${f}" alt="">`).join("");
    };
    if (sos.luogo === "strada") preparaPosizione();
    collegaSalvati();
    $("#vai").onclick = () => {
      ricorda();
      const p = problemaScelto();
      const categoria = p ? p.cat : sos.cat;
      if (sos.luogo === "casa" && sos.ind.trim().length < 4) {
        toast("Scrivi dove mandare l'aiuto"); $("#ind").focus(); return;
      }
      const pos = sos.luogo === "strada" ? (sos.pos || qui()) : qui();
      const r = nuovaRichiesta({
        tipo: "urgenza", luogo: sos.luogo, categoria, problema: p ? p.nome : cat(categoria).nome, problemaId: p?.id, prezzo: p?.prezzo,
        testo: sos.note.trim(), indirizzo: sos.luogo === "casa" ? sos.ind : "", foto: sos.foto,
        veicolo: sos.luogo === "strada" && veicoli.find(v => v.id === sos.veicolo) ? testoVeicolo(veicoli.find(v => v.id === sos.veicolo)) : "", pos, stato: "attesa", pagato: SUPPLEMENTO_URGENZA,
      });
      sos = { luogo: null, problema: null, cat: null, foto: [], note: "", ind: "", veicolo: sos.veicolo, pos: sos.pos, posInfo: sos.posInfo };
      location.hash = "#/traccia/" + r.id;
    };
  },
  esci() { chiudiMappa(ROTTE.urgenza._m); ROTTE.urgenza._m = null; },
};

async function preparaPosizione() {
  const disegna = () => {
    if (!window.L || !$("#minimap")) return;
    ROTTE.urgenza.esci();
    const m = nuovaMappa($("#minimap"), sos.pos || qui(), 15);
    m.attributionControl.setPrefix(false);
    const mk = L.marker(sos.pos || qui(), { draggable: true, icon: iconaPin('<div class="mme"></div>', 18, 18) }).addTo(m);
    mk.on("dragend", () => { const ll = mk.getLatLng(); sos.pos = [ll.lat, ll.lng]; sos.posInfo = "Posizione scelta da te sulla mappa"; $("#posT").textContent = "Posizione aggiornata"; $("#posS").textContent = sos.posInfo; });
    ROTTE.urgenza._m = m;
  };
  if (sos.pos) return disegna();
  disegna();
  const pos = await leggiPosizione();
  if (!$("#posT")) return;
  const v = pos && cittaVicina(pos);
  if (v && v.d <= 80) { sos.pos = pos; sos.posInfo = `Vicino a ${v.citta} · rilevata dal GPS`; }
  else {
    const [la, lo] = qui();
    sos.pos = [la - 0.008, lo - 0.014];
    sos.posInfo = pos ? `Sei fuori dalle Marche: per la demo usiamo ${zona.citta}` : `GPS non disponibile: per la demo usiamo ${zona.citta}`;
  }
  $("#posT").textContent = "Posizione rilevata"; $("#posS").textContent = sos.posInfo;
  disegna();
}

// ---------- ricerca, proposta del migliore, tracciamento ----------
function candidati(r) {
  let lista = inZona(ARTIGIANI.filter(a => a.categoria === r.categoria && (r.luogo === "strada" ? a.strada : a.urgenze)), r.pos);
  if (!lista.length) lista = inZona(ARTIGIANI.filter(a => a.categoria === r.categoria), r.pos);
  return lista.sort((a, b) => punteggio(b) - punteggio(a));
}
const stimaEta = a => Math.round(6 + a.dist * 1.5 + (a.disponibileOra ? 0 : 12));

ROTTE.traccia = {
  tab: "urgenza", indietro: true,
  html(id) {
    const r = richieste.find(x => x.id === id);
    if (!r) return vuoto("search-x", "Richiesta non trovata");
    const c = cat(r.categoria);
    if (r.stato === "attesa") return `
      <h1 class="center" style="margin-top:14px">Cerco il migliore per te…</h1>
      <p class="muted center" style="margin-top:-6px">${esc(r.problema)}${r.luogo === "strada" ? " · su strada" : ""}</p>
      <div class="radar" id="radar"><i class="w"></i><i class="w"></i><i class="w"></i><i class="sweep"></i><div class="c">${em(c)}</div></div>
      <p class="center" style="font-size:16px;margin:6px 0"><b id="avvisati">0</b> ${r.luogo === "strada" ? "soccorsi" : "professionisti"} disponibili controllati</p>
      <p class="muted small center">Confrontiamo distanza, disponibilità e recensioni.</p>
      ${boxConsigli(r.problemaId, r.luogo)}
      <button class="btn ghost" id="annulla">Annulla richiesta</button>`;

    if (r.stato === "proposte") {
      const [best, ...altri] = r.proposte.map(p => ({ ...pro(p.id), dist: p.dist, eta: p.eta }));
      const motivi = [best.disponibileOra && "Libero adesso", best.verificato && "Verificato", best.strada && "Interviene su strada", best.h24 && "Attivo 24h", best.tipo === "azienda" && `${best.mezzi} mezzi disponibili`].filter(Boolean);
      return `
        <p class="muted small" style="margin:10px 0 6px">${esc(r.problema)} · ${r.luogo === "strada" ? "su strada" : esc(r.citta)}</p>
        <div class="best">
          <span class="tag-best">${ic("sparkles")}Il migliore per te</span>
          <div class="best-h">${avatar(best)}
            <div style="min-width:0"><div class="nome">${esc(best.nome)} ${spunta(best)}</div>
            <div class="riga">${voto(best)}<span>(${best.numRecensioni})</span><span>· ${c.nome}</span></div></div></div>
          <div class="why">
            <div class="hl"><b>${best.eta} min</b>arriva in</div>
            <div><b>${best.dist} km</b>da te</div>
            <div><b>${r.prezzo || best.tariffaOra + " €/h"}</b>prezzo indicativo</div>
            <div><b>${best.lavori}</b>interventi fatti</div>
          </div>
          <div class="badges" style="margin:0 0 14px">${motivi.map(m => `<span class="badge ora-v">${ic("check")}${m}</span>`).join("")}</div>
          <button class="btn press" data-scegli="${best.id}">${ic(r.luogo === "strada" ? "truck" : "navigation")}Conferma · arriva in ${best.eta} min</button>
        </div>
        ${altri.length ? `<h2>Altre opzioni</h2>${altri.map((a, i) => `<button class="alt press" data-scegli="${a.id}" style="--i:${i}">${avatar(a, "s")}
          <div class="info"><div class="nm">${esc(a.nome)}</div><div class="riga" style="margin:0">${voto(a)}<span>${a.dist} km</span></div></div>
          <div class="eta-s"><b>${a.eta} min</b>arrivo</div></button>`).join("")}` : ""}
        <button class="btn ghost" id="annulla" style="margin-top:10px">Annulla, non mi serve più</button>`;
    }

    const a = { ...pro(r.proId) };
    if (r.stato === "completata") return `
      <div class="box center" style="margin-top:14px;padding:24px 16px">
        <div class="done">${ic("check")}</div>
        <h1 style="margin:0 0 4px">Intervento completato</h1>
        <p class="muted">${esc(r.problema)} · ${esc(a.nome)}</p>
        ${r.recensione ? `<p><span class="stelle">${STELLA.repeat(r.recensione.voto)}</span> grazie per la recensione</p>`
          : `<button class="btn press" data-rec="${r.id}">${ic("star")}Lascia una recensione</button>`}
      </div>`;
    return `
      <div class="track"><div id="tmap"></div><div class="eta-pill" id="etaPill">Arrivo tra ${r.eta} min</div></div>
      <div class="sheet-card">
        <div style="display:flex;gap:12px;align-items:center">${avatar(a)}
          <div style="flex:1;min-width:0"><div style="font-weight:700">${esc(a.nome)} ${spunta(a)}</div>
          <div class="riga">${voto(a)}<span>· ${cat(a.categoria).nome}</span></div></div>
          <a class="btn sec press" style="flex:none;width:auto;padding:12px" href="#/chat/${a.id}" aria-label="Scrivi">${ic("message-circle")}</a>
          <button class="btn press" style="flex:none;width:auto;padding:12px" onclick="toast('Chiamata simulata')" aria-label="Chiama">${ic("phone")}</button>
        </div>
        <ul class="passi">
          <li class="ok">Richiesta confermata</li>
          <li class="ok">${esc(nomeBreve(a))} è partito ${r.luogo === "strada" ? "verso di te" : "da " + esc(a.citta)}</li>
          <li id="p3">${r.luogo === "strada" ? "Arrivato sul posto" : "Arrivato a casa tua"}</li>
          <li>Intervento completato</li>
        </ul>
        ${boxConsigli(r.problemaId, r.luogo, "Mentre arriva")}
        <div style="height:12px"></div>
        <button class="btn press" data-fine="${r.id}">${ic("check")}L'intervento è finito</button>
      </div>`;
  },
  dopo(id) {
    const r = richieste.find(x => x.id === id);
    if (!r) return;
    $("#brand").innerHTML = "<span>Il tuo SOS</span>";
    const annulla = () => { clearTimeout(ROTTE.traccia._acc); richieste = richieste.filter(x => x.id !== id); salvaRichieste(); toast("Richiesta annullata, nessun addebito"); location.hash = "#/"; };
    if ($("#annulla")) $("#annulla").onclick = annulla;

    if (r.stato === "attesa") {
      const tutti = candidati(r);
      let n = 0;
      const t1 = setInterval(() => {
        if (!$("#radar") || n >= Math.min(tutti.length, 8)) return clearInterval(t1);
        const a = tutti[n], ang = n * 2.4 + 0.5, rad = 80 + (n % 3) * 13;
        $("#radar").insertAdjacentHTML("beforeend", `<div class="pin" style="left:${125 + Math.cos(ang) * rad - 18}px;top:${125 + Math.sin(ang) * rad - 18}px;background:${COLORI_AV[a.id % COLORI_AV.length]}">${iniziali(a.nome)}</div>`);
        n++; $("#avvisati").textContent = n;
      }, 380);
      clearTimeout(ROTTE.traccia._acc);
      ROTTE.traccia._acc = setTimeout(() => {
        const proposte = tutti.slice(0, 3).map(a => ({ id: a.id, dist: a.dist, eta: stimaEta(a) }));
        aggiornaRichiesta(id, { stato: "proposte", proposte, nuovo: true });
        if (location.hash === "#/traccia/" + id) render(); else toast("Abbiamo trovato chi può aiutarti");
      }, 3800);
      return;
    }
    if (r.stato === "proposte") {
      $$("[data-scegli]").forEach(b => b.onclick = () => {
        const p = r.proposte.find(x => x.id === +b.dataset.scegli);
        aggiornaRichiesta(id, { stato: "accettata", proId: p.id, eta: p.eta, inizio: Date.now(), nuovo: false });
        toast(`Confermato: ${nomeBreve(pro(p.id))} sta arrivando`); render();
      });
      return;
    }
    if (r.stato === "accettata") seguiMezzo(r);
    bottoniRichiesta();
  },
  esci() { clearInterval(ROTTE.traccia._t); chiudiMappa(ROTTE.traccia._m); ROTTE.traccia._m = null; },
};

function seguiMezzo(r) {
  const a = pro(r.proId);
  const da = [a.lat, a.lng], a2 = r.pos || qui();
  const punto = f => [da[0] + (a2[0] - da[0]) * f, da[1] + (a2[1] - da[1]) * f];
  const avanzamento = () => Math.min(1, (Date.now() - (r.inizio || Date.now())) / DURATA_DEMO);
  let mezzo = null;
  if (window.L && $("#tmap")) {
    const m = nuovaMappa($("#tmap"), a2, 13);
    m.attributionControl.setPrefix(false);
    L.marker(a2, { icon: iconaPin('<div class="mme"></div>', 18, 18) }).addTo(m);
    L.polyline([da, a2], { color: "#2453e6", weight: 4, opacity: .35, dashArray: "6 8" }).addTo(m);
    mezzo = L.marker(punto(avanzamento()), { icon: iconaPin(`<div class="vpin">${ic(r.luogo === "strada" ? "truck" : "car")}</div>`, 40, 40) }).addTo(m);
    m.fitBounds([da, a2], { padding: [50, 50] });
    ROTTE.traccia._m = m;
    disegnaIcone();
  }
  const aggiorna = () => {
    const f = avanzamento();
    if (mezzo) mezzo.setLatLng(punto(f));
    const min = Math.max(0, Math.round(r.eta * (1 - f)));
    if ($("#etaPill")) $("#etaPill").textContent = f >= 1 ? "È arrivato" : `Arrivo tra ${Math.max(1, min)} min`;
    if (f >= 1) { $("#p3")?.classList.add("ok"); clearInterval(ROTTE.traccia._t); }
  };
  aggiorna();
  ROTTE.traccia._t = setInterval(aggiorna, 500);
}
