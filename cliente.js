// Lato cliente: home, mestieri, lista, mappa, profilo, chat, richieste.

// ---------- pezzi riutilizzabili ----------
function cardPro(a, i = 0) {
  const c = cat(a.categoria);
  return `<a class="pro press" href="#/pro/${a.id}" style="--i:${i}">
    ${avatar(a)}
    <div class="info">
      <div class="nome">${esc(a.nome)} ${spunta(a)}</div>
      <div class="riga">${voto(a)}<span>(${a.numRecensioni})</span><span>· ${c.nome}</span></div>
      <div class="riga"><span>${ic("map-pin")}${esc(a.citta)} · ${a.dist} km</span><span>${ic("clock")}risponde in ${a.rispostaMin} min</span></div>
      <div class="badges">${tipoBadge(a)}${a.disponibileOra ? '<span class="badge ora">Libero ora</span>' : ""}${a.strada ? `<span class="badge road">${ic("car")}Su strada</span>` : a.urgenze ? `<span class="badge urg">${ic("zap")}Urgenze</span>` : ""}</div>
    </div>
    <div class="prezzo"><b>${a.tariffaOra}€</b>/ora</div>
  </a>`;
}
const tileCat = (c, i) => `<a class="cat press" href="#/cat/${c.id}" style="--i:${i}"><span class="ico">${em(c)}</span>${c.nome}</a>`;
const vuoto = (icona, testo) => `<div class="vuoto"><span class="e">${ic(icona)}</span>${testo}</div>`;

// ---------- home ----------
ROTTE[""] = {
  tab: "home",
  html() {
    const vicini = inZona(ARTIGIANI);
    const top = CATEGORIE.filter(c => c.top).sort((a, b) => a.top - b.top).slice(0, 7);
    const migliori = vicini.filter(a => a.tipo === "azienda" && a.verificato).sort((a, b) => punteggio(b) - punteggio(a)).slice(0, 8);
    const frequenti = [["casa", "perdita"], ["casa", "corrente"], ["casa", "chiuso"], ["casa", "caldaia"], ["strada", "gomma"], ["strada", "batteria"], ["strada", "panne"]]
      .map(([l, id]) => ({ l, p: PROBLEMI[l].find(x => x.id === id) }));
    const liberi = vicini.filter(a => a.disponibileOra).length;
    return `
      <h1 class="b-titolo">${utente.nome ? `Ciao ${esc(utente.nome.split(" ")[0])},` : "Ciao!"}<br>cosa è successo?</h1>
      <label class="b-t b-cerca h-cerca">${ic("search")}<input id="hq" placeholder="Es. perdita d'acqua, gomma bucata…" autocomplete="off" enterkeyhint="search"><button class="h-x" id="hx" aria-label="Cancella" hidden>${ic("x")}</button></label>
      <div id="hris"></div>
      <div id="hresto">
        <div class="sez-t"><b>Ti serve adesso?</b><span class="live"><i></i>${liberi} liberi · arrivano in ~18 min</span></div>
        <div class="pgrid home">${frequenti.map(({ l, p }, i) => `<a class="ptile press" href="#/urgenza/${l}.${p.id}" style="--i:${i}"><span class="pe">${em(p)}</span><span>${nomeCorto(p)}</span></a>`).join("")}
          <a class="ptile altro press" href="#/urgenza" style="--i:7"><span class="pe">${ic("plus")}</span><span>Altro problema</span></a></div>
        <a class="b-t b-pianifica press" href="#/preventivo">
          <span class="pe">${ic("file-text")}</span>
          <span><b>Lavoro da programmare?</b><span>Chiedi 3 preventivi gratis: lo descrivi una volta, rispondono le migliori aziende.</span></span>
          ${ic("chevron-right")}
        </a>
        <div>
          <h2>Mestieri <a href="#/categorie">Tutti ${ic("chevron-right")}</a></h2>
          <div class="cats">${top.map(tileCat).join("")}
            <a class="cat all press" href="#/categorie" style="--i:7"><span class="ico">${ic("layout-grid")}</span>Altri ${CATEGORIE.length - top.length}</a></div>
        </div>
      <div>
        <h2>Le migliori aziende vicino a te</h2>
        <div class="scroller">${migliori.map(a => `<a class="mini press" href="#/pro/${a.id}"><div class="top">${avatar(a, "s")}<div style="min-width:0">
            <div class="nm">${esc(a.nome)}</div><div class="riga" style="margin:0">${em(cat(a.categoria))}${cat(a.categoria).nome}</div></div></div>
            <div class="riga" style="margin-top:8px">${voto(a)}<span>(${a.numRecensioni})</span><span>${ic("map-pin")}${a.dist} km</span>${a.disponibileOra ? '<span class="badge ora" style="margin:0">Libero</span>' : ""}</div></a>`).join("")}</div>
      </div>
      <div class="trust">
        <div>${ic("shield-check")}<b>Verificati</b>Documenti e P.IVA controllati</div>
        <div>${ic("star")}<b>Recensioni vere</b>Solo dopo un lavoro fatto</div>
        <div>${ic("receipt-text")}<b>Prezzi chiari</b>Sai quanto spendi prima</div>
      </div>
      </div>`;
  },
  dopo() {
    // la ricerca capisce i problemi ("perde il lavandino"), non solo i nomi dei mestieri
    const q = $("#hq"), ris = $("#hris"), resto = $("#hresto"), x = $("#hx");
    const mostra = () => {
      const t = q.value.trim();
      x.hidden = !t; resto.hidden = !!t;
      if (!t) return (ris.innerHTML = "");
      const { problemi, mestieri } = cercaAiuto(t);
      ris.innerHTML = (problemi.length ? `<div class="eyebrow">Ti serve adesso</div>${problemi.slice(0, 5).map(({ l, p }) => `<a class="ris-p press" href="#/urgenza/${l}.${p.id}"><span class="pe">${em(p)}</span><span><b>${p.nome}</b><small>${l === "strada" ? "Per strada" : "In casa"} · arriva in ~18 min · ${p.prezzo}</small></span>${ic("chevron-right")}</a>`).join("")}` : "")
        + (mestieri.length ? `<div class="eyebrow">Mestieri</div><div class="grp open"><div class="list"><div>${mestieri.slice(0, 6).map(c => `<a class="catrow" href="#/cat/${c.id}"><span class="ico">${em(c)}</span>${c.nome}<span class="n">${ic("chevron-right")}</span></a>`).join("")}</div></div></div>
            <button class="ris-prev press" data-pc="${mestieri[0].id}">${ic("file-text")}<span>Lavoro da programmare? <b>Chiedi 3 preventivi: ${mestieri[0].nome.toLowerCase()}</b></span></button>` : "")
        || vuoto("search-x", "Non abbiamo capito.<br>Prova con altre parole, oppure:") + `<a class="btn sos press" href="#/urgenza">${ic("siren")}È un'emergenza</a><div style="height:8px"></div><a class="btn sec press" href="#/preventivo">${ic("file-text")}Chiedi un preventivo</a>`;
      $$("[data-pc]", ris).forEach(b => b.onclick = () => { prev.cat = b.dataset.pc; location.hash = "#/preventivo"; });
    };
    q.oninput = mostra;
    q.onkeydown = e => { if (e.key === "Enter") ris.querySelector("a,button")?.click(); };
    x.onclick = e => { e.preventDefault(); q.value = ""; mostra(); q.focus(); };
  },
};

// ---------- tutti i mestieri ----------
let gruppoAperto = 0;
ROTTE.categorie = {
  tab: "home", indietro: true, titolo: "Tutti i mestieri",
  html() {
    const vicini = inZona(ARTIGIANI);
    const n = id => vicini.filter(a => a.categoria === id).length;
    return `
      <label class="find">${ic("search")}<input id="q" placeholder="Es. perdita d'acqua, tapparella, gomme…" autocomplete="off" enterkeyhint="search"></label>
      <div id="ris"></div>
      <div id="gruppi">
        ${GRUPPI.map((g, gi) => `<div class="grp ${gi === gruppoAperto ? "open" : ""}" style="animation:su .4s var(--ease) ${gi * .04}s both">
          <button class="press"><span class="gi">${em(g)}</span>${g.nome}<span class="ar">${ic("chevron-right")}</span></button>
          <div class="list"><div>${CATEGORIE.filter(c => c.gruppo === g.id).map(c => `
            <a class="catrow" href="#/cat/${c.id}"><span class="ico">${em(c)}</span>${c.nome}<span class="n">${n(c.id)} in zona ${ic("chevron-right")}</span></a>`).join("")}
          </div></div></div>`).join("")}
      </div>`;
  },
  dopo() {
    // un gruppo alla volta: aprendone uno si chiudono gli altri e la pagina lo porta in vista
    $$(".grp > button").forEach(b => b.onclick = () => {
      const g = b.parentElement, apri = !g.classList.contains("open");
      $$(".grp.open").forEach(x => x !== g && x.classList.remove("open"));
      g.classList.toggle("open", apri);
      gruppoAperto = apri ? $$("#gruppi .grp").indexOf(g) : -1;   // tornando indietro ritrovi lo stesso gruppo aperto
      if (apri) setTimeout(() => {
        const top = window.scrollY + g.getBoundingClientRect().top - 72;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }, 380);
    });
    const q = $("#q");
    setTimeout(() => { if (window.scrollY < 10) q.focus({ preventScroll: true }); }, 350);   // tornando indietro non ti riporta in cima
    q.oninput = () => {
      const t = q.value.trim().toLowerCase();
      $("#gruppi").hidden = !!t;
      if (!t) return ($("#ris").innerHTML = "");
      const trovate = CATEGORIE.filter(c => (c.nome + " " + c.parole).toLowerCase().includes(t) ||
        t.split(/\s+/).some(p => p.length > 3 && c.parole.includes(p)));
      $("#ris").innerHTML = trovate.length
        ? `<div class="grp open"><div class="list"><div>${trovate.map(c => `<a class="catrow" href="#/cat/${c.id}">
            <span class="ico">${em(c)}</span>${c.nome}<span class="n">${gruppo(c.gruppo).nome} ${ic("chevron-right")}</span></a>`).join("")}</div></div></div>`
        : vuoto("search-x", "Nessun mestiere trovato.<br>Prova con altre parole o premi SOS.");
    };
  },
};

// ---------- lista di una categoria ----------
let filtro = { ordine: "consigliati", tipo: "tutti", soloOra: false, soloVerif: false };
ROTTE.cat = {
  tab: "home", indietro: true,
  html(id) {
    const c = cat(id);
    let lista = inZona(ARTIGIANI.filter(a => a.categoria === id));
    if (filtro.tipo !== "tutti") lista = lista.filter(a => a.tipo === filtro.tipo);
    if (filtro.soloOra) lista = lista.filter(a => a.disponibileOra);
    if (filtro.soloVerif) lista = lista.filter(a => a.verificato);
    lista.sort({
      consigliati: (a, b) => punteggio(b) - punteggio(a),
      voto: (a, b) => b.voto - a.voto || b.numRecensioni - a.numRecensioni,
      vicino: (a, b) => a.dist - b.dist,
      prezzo: (a, b) => a.tariffaOra - b.tariffaOra,
    }[filtro.ordine]);
    const chip = (k, t, on) => `<button class="chip ${on ? "on" : ""}" data-f="${k}">${t}</button>`;
    const seg = (k, t) => `<button class="${filtro.tipo === k ? "on" : ""}" data-t="${k}">${t}</button>`;
    return `
      <div class="cat-head"><span class="ico">${em(c)}</span><h1>${c.nome}</h1></div>
      <div class="seg">${seg("tutti", "Tutti")}${seg("azienda", `${ic("building-2")}Aziende`)}${seg("indipendente", `${ic("user-round")}Professionisti`)}</div>
      <div class="chips">
        ${chip("consigliati", `${ic("sparkles")}Consigliati`, filtro.ordine === "consigliati")}${chip("voto", `${ic("star")}Più votati`, filtro.ordine === "voto")}
        ${chip("vicino", `${ic("map-pin")}Più vicini`, filtro.ordine === "vicino")}${chip("prezzo", `${ic("euro")}Prezzo`, filtro.ordine === "prezzo")}
        ${chip("soloOra", "Libero ora", filtro.soloOra)}${chip("soloVerif", `${ic("badge-check")}Verificati`, filtro.soloVerif)}
        <a class="chip" href="#/mappa/${c.id}">${ic("map")}Mappa</a>
      </div>
      <div>${lista.length ? `<p class="muted small" style="margin:0 0 10px">${lista.length} risultati vicino a ${esc(zona.citta)}</p>` + lista.map(cardPro).join("")
        : vuoto("filter-x", "Nessuno con questi filtri.<br>Togline qualcuno o cambia zona.")}</div>`;
  },
  dopo() {
    $$("[data-f]").forEach(b => b.onclick = () => {
      const f = b.dataset.f;
      if (["consigliati", "voto", "vicino", "prezzo"].includes(f)) filtro.ordine = f; else filtro[f] = !filtro[f];
      render();
    });
    $$("[data-t]").forEach(b => b.onclick = () => { filtro.tipo = b.dataset.t; render(); });
    $("#brand").innerHTML = `<span>${esc(zona.citta)}</span>`;
  },
};

// ---------- mappa ----------
let mappaObj = null;
function nuovaMappa(el, centro, zoom = 12) {
  const m = L.map(el, { zoomControl: false, attributionControl: true, fadeAnimation: false, zoomAnimation: false, markerZoomAnimation: false }).setView(centro, zoom, { animate: false });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(m);
  return m;
}
function chiudiMappa(m) { if (!m) return; try { m.stop(); m.off(); m.remove(); } catch {} }
const iconaPin = (html, w, h, ax, ay) => L.divIcon({ className: "", html, iconSize: [w, h], iconAnchor: [ax ?? w / 2, ay ?? h / 2] });
ROTTE.mappa = {
  tab: "mappa",
  html(id) {
    const top = CATEGORIE.filter(c => c.top).sort((a, b) => a.top - b.top);
    const lista = id && !top.some(c => c.id === id) ? [cat(id), ...top] : top;
    return `
      <div class="chips">
        <button class="chip ${!id ? "on" : ""}" data-m="">Liberi ora</button>
        ${lista.map(c => `<button class="chip ${id === c.id ? "on" : ""}" data-m="${c.id}">${em(c)}${c.nome}</button>`).join("")}
        <a class="chip" href="#/categorie">Altri…</a>
      </div>
      <div class="mappa-wrap"><div id="mappa"></div><div class="map-card" id="mcard"></div></div>`;
  },
  dopo(id) {
    $$("[data-m]").forEach(b => b.onclick = () => location.hash = "#/mappa" + (b.dataset.m ? "/" + b.dataset.m : ""));
    const cont = $("#mappa");
    if (!window.L) { cont.innerHTML = `<div class="map-off">${vuoto("wifi-off", "La mappa ha bisogno di internet.")}</div>`; return; }
    const lista = inZona(ARTIGIANI.filter(a => id ? a.categoria === id : a.disponibileOra)).sort((a, b) => a.dist - b.dist).slice(0, 80);
    mappaObj = nuovaMappa(cont, qui(), 11);
    L.marker(qui(), { icon: iconaPin('<div class="mme"></div>', 18, 18) }).addTo(mappaObj);
    const pins = [];
    lista.forEach(a => {
      const m = L.marker([a.lat, a.lng], { icon: iconaPin(`<div class="mpin ${a.disponibileOra ? "ora" : ""}" data-id="${a.id}">${em(cat(a.categoria))}</div>`, 36, 36, 18, 36) }).addTo(mappaObj);
      m.on("click", () => {
        $$(".mpin.sel").forEach(x => x.classList.remove("sel"));
        $(`.mpin[data-id="${a.id}"]`)?.classList.add("sel");
        $("#mcard").innerHTML = cardPro(a);
        mappaObj.panTo([a.lat, a.lng]);
      });
      pins.push([a.lat, a.lng]);
    });
    if (pins.length) mappaObj.fitBounds([...pins, qui()], { padding: [40, 40], maxZoom: 12 });
    $("#mcard").innerHTML = `<div class="pro" style="justify-content:center;font-size:14px;font-weight:600">${lista.length} sulla mappa · tocca un segnaposto</div>`;
  },
  esci() { chiudiMappa(mappaObj); mappaObj = null; },
};

// ---------- profilo ----------
ROTTE.pro = {
  tab: "home", indietro: true,
  html(id) {
    const a = { ...pro(id) }; a.dist = distanza(a);
    const c = cat(a.categoria);
    const conta = [5, 4, 3, 2, 1].map(v => a.recensioni.filter(r => r.voto === v).length);
    const max = Math.max(...conta, 1);
    return `
      <div class="cover"><button class="cuore press ${preferito(a.id) ? "on" : ""}" id="cuore" aria-label="Salva nei preferiti">${ic("heart")}</button></div>
      <div class="prof">
        ${avatar(a, "big")}
        <h1>${esc(a.nome)} ${spunta(a)}</h1>
        <div class="muted">${c.nome}${a.tipo === "azienda" ? " · titolare " + esc(a.referente) : ""}</div>
        <div class="badges">${tipoBadge(a)}${a.disponibileOra ? '<span class="badge ora">Libero ora</span>' : ""}${a.strada ? `<span class="badge road">${ic("car")}Interviene su strada</span>` : ""}${a.h24 ? `<span class="badge urg">${ic("clock")}24h</span>` : ""}</div>
      </div>
      <div class="stats">
        <div><b>${voto(a)}</b>${a.numRecensioni} recensioni</div>
        <div><b>${a.lavori}</b>interventi</div>
        <div><b>${a.anniEsperienza} anni</b>di attività</div>
      </div>
      <div class="box">
        <h3>${ic("images")}Lavori fatti</h3>
        <div class="gal">${a.foto.map((f, i) => `<button class="foto press" data-foto="${i}" style="--h:${f.tono}">${em(c)}<span>${f.titolo}</span></button>`).join("")}</div>
        <p class="muted small" style="margin:8px 0 0">Nella versione vera qui ci sono le foto caricate dall'azienda.</p>
      </div>
      <div class="box">
        <h3>${ic("info")}Chi siamo</h3>
        <p class="small" style="margin:0 0 6px;color:var(--ink-2);line-height:1.5">${c.desc}</p>
        <div class="listino"><span>Orari</span><b>${a.orari}</b></div>
        <div class="listino"><span>Zona coperta</span><b>${esc(a.citta)} + ${a.raggioKm} km</b></div>
        ${a.tipo === "azienda" ? `<div class="listino"><span>Squadra</span><b>${a.dipendenti} addetti · ${a.mezzi} mezzi</b></div>` : ""}
        ${a.verificato ? `<div class="listino"><span>Verifiche</span><b>Documenti, P.IVA, assicurazione</b></div>` : ""}
      </div>
      <div class="box">
        <h3>${ic("receipt-text")}Prezzi indicativi</h3>
        <div class="listino"><span>Manodopera</span><b>${a.tariffaOra} €/ora</b></div>
        <div class="listino"><span>Uscita / sopralluogo</span><b>${a.uscita ? a.uscita + " €" : "Gratis"}</b></div>
        ${a.urgenze ? `<div class="listino"><span>Urgenza fuori orario</span><b>+30%</b></div>` : ""}
      </div>
      <div class="box">
        <h3>${ic("star")}Recensioni</h3>
        <div style="display:flex;gap:16px;align-items:center">
          <div class="center"><div style="font-size:38px;font-weight:800;letter-spacing:-.04em">${a.voto.toFixed(1).replace(".", ",")}</div><div class="muted small">${a.numRecensioni} voti</div></div>
          <div class="bars" style="flex:1">${conta.map((n, i) => `<div><span>${5 - i}</span><i style="--w:${n / max * 100}%"></i><span>${n}</span></div>`).join("")}</div>
        </div>
        ${a.recensioni.map(r => `<div class="rec"><div class="top"><span class="stelle">${STELLA.repeat(r.voto)}</span>
          <span class="muted">${r.autore} · ${r.mesiFa} ${r.mesiFa === 1 ? "mese" : "mesi"} fa</span></div><p>${r.testo}</p></div>`).join("")}
        <p class="muted small" style="margin:10px 0 0">Recensisce solo chi ha avuto un intervento confermato in app.</p>
      </div>
      <div class="cta-space"></div>
      <div class="cta">
        <a class="btn sec press" href="#/chat/${a.id}">${ic("message-circle")}Scrivi</a>
        <button class="btn press" id="call">${ic("phone")}Chiama</button>
      </div>`;
  },
  dopo(id) {
    const a = pro(id);
    $("#brand").innerHTML = "";
    $("#cuore").onclick = e => {
      const on = cambiaPreferito(a.id);
      e.currentTarget.classList.toggle("on", on);
      toast(on ? "Salvato nei preferiti" : "Tolto dai preferiti");
    };
    $$("[data-foto]").forEach(b => b.onclick = () => {
      const f = a.foto[b.dataset.foto];
      const l = document.createElement("div");
      l.className = "light";
      l.innerHTML = `<div class="foto big" style="--h:${f.tono}">${em(cat(a.categoria))}<span>${f.titolo} · ${esc(a.citta)}</span></div>`;
      l.onclick = () => l.remove();
      document.body.appendChild(l);
    });
    $("#call").onclick = () => apriFoglio(`
      <div class="center">${avatar(a, "big").replace('class="avatar', 'style="margin:0 auto 12px" class="avatar')}
      <h3>Chiamare ${esc(a.nome)}?</h3>
      <p class="muted">Il numero resta privato: la chiamata passa dall'app, così dopo l'intervento puoi lasciare la recensione.</p></div>
      <button class="btn ok press" id="ok">${ic("phone")}Chiama ora (simulato)</button>
      <button class="btn ghost" onclick="chiudiFoglio()">Annulla</button>`,
      el => $("#ok", el).onclick = () => {
        nuovaRichiesta({ tipo: "chiamata", proId: a.id, categoria: a.categoria, testo: "Contatto telefonico", stato: "accettata" });
        chiudiFoglio(); toast("Chiamata simulata · la trovi in Richieste");
      });
  },
};

// ---------- chat ----------
function risposta(a, testo) {
  const t = (testo || "").toLowerCase();
  if (!testo) return "Ricevuta la foto, grazie. Così ci facciamo un'idea: sembra una cosa che si risolve in giornata.";
  if (/cost|prezz|quanto|€|euro/.test(t)) return `L'uscita è ${a.uscita ? a.uscita + " €" : "gratuita"}, poi ${a.tariffaOra} € l'ora. Se ci mandi una foto ti facciamo un preventivo preciso.`;
  if (/quando|oggi|domani|passare|venire|ora/.test(t)) return a.disponibileOra ? "Possiamo passare già oggi pomeriggio, verso le 16 va bene?" : "Domani mattina abbiamo un buco verso le 9:30, va bene?";
  if (/foto/.test(t)) return "Certo, mandala pure dal tasto della fotocamera qui sotto.";
  if (/ok|va bene|perfetto|grazie|d'accordo/.test(t)) return "Perfetto, ti confermiamo l'appuntamento. Per qualsiasi cosa scrivici qui.";
  return "Ricevuto. Ci dici anche l'indirizzo e quando ti farebbe comodo?";
}
ROTTE.chat = {
  tab: "richieste", indietro: true,
  html(id) {
    const a = { ...pro(id) };
    if (!chat[id]) { chat[id] = [{ da: "lui", testo: `Buongiorno, ${a.tipo === "azienda" ? "qui " + a.nome : "sono " + a.nome}. Come possiamo aiutarla?`, t: ora() }]; salva("chat", chat); }
    return `
      <a class="chat-h" href="#/pro/${a.id}">${avatar(a, "s")}<div><b>${esc(a.nome)}</b>
        <div class="muted small">${a.disponibileOra ? "Online · " : ""}risponde in ~${a.rispostaMin} min</div></div></a>
      <div class="msgs" id="msgs"></div>
      <div class="composer">
        <label class="ib" title="Foto">${ic("camera")}<input type="file" accept="image/*" id="cfoto"></label>
        <input type="text" id="ctxt" placeholder="Scrivi un messaggio…" autocomplete="off" enterkeyhint="send">
        <button class="ib send press" id="csend" aria-label="Invia">${ic("send")}</button>
      </div>`;
  },
  dopo(id) {
    const a = pro(id);
    $("#brand").innerHTML = "<span>Chat</span>";
    const disegna = () => {
      const lista = chat[id];
      $("#msgs").innerHTML = (lista.length < 3 ? `<div class="quickq">${["Quanto costa l'uscita?", "Quando potete passare?", "Vi mando una foto"].map(q => `<button class="chip" data-q="${q}">${q}</button>`).join("")}</div>` : "")
        + lista.map(m => `<div class="msg ${m.da}">${m.img ? `<img src="${m.img}" alt="foto">` : ""}${m.testo ? esc(m.testo) : ""}<span class="t">${m.t}</span></div>`).join("");
      $$("[data-q]").forEach(b => b.onclick = () => invia(b.dataset.q));
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    };
    const invia = (testo, img) => {
      if (!testo && !img) return;
      chat[id].push({ da: "io", testo, img, t: ora() }); salva("chat", chat);
      if (!richieste.some(r => r.tipo === "chat" && r.proId === a.id)) nuovaRichiesta({ tipo: "chat", proId: a.id, categoria: a.categoria, testo: testo || "Foto", stato: "accettata" });
      disegna();
      setTimeout(() => {
        if (!$("#msgs")) return;
        $("#msgs").insertAdjacentHTML("beforeend", `<div class="msg lui typing"><i></i><i></i><i></i></div>`);
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 600);
      setTimeout(() => {
        chat[id].push({ da: "lui", testo: risposta(a, testo), t: ora() }); salva("chat", chat);
        if ($("#msgs") && location.hash === "#/chat/" + id) disegna(); else toast(`${a.nome} ti ha risposto`);
      }, 2200);
    };
    $("#csend").onclick = () => { invia($("#ctxt").value.trim()); $("#ctxt").value = ""; };
    $("#ctxt").onkeydown = e => { if (e.key === "Enter") $("#csend").click(); };
    $("#cfoto").onchange = async e => { const f = e.target.files[0]; if (f) invia("", await miniatura(f)); };
    disegna();
  },
};

// ---------- richieste ----------
function nuovaRichiesta(dati) {
  const r = { id: Date.now().toString(36), data: Date.now(), citta: zona.citta, ...dati };
  richieste.unshift(r); salvaRichieste(); return r;
}
function aggiornaRichiesta(id, dati) {
  const r = richieste.find(x => x.id === id);
  if (r) { Object.assign(r, dati); salvaRichieste(); }
  if (location.hash === "#/richieste") render();
}
ROTTE.richieste = {
  tab: "richieste", titolo: "Le mie richieste",
  html() {
    if (!richieste.length) return vuoto("inbox", "<b>Ancora niente qui</b><br>Quando contatti qualcuno o premi SOS,<br>trovi tutto in questa pagina.")
      + `<a class="btn press" href="#/categorie">${ic("search")}Cerca un professionista</a>`;
    const etichetta = { attesa: "Ricerca", proposte: "Da scegliere", accettata: "In corso", completata: "Completata" };
    const tipo = { urgenza: ["siren", "SOS"], chiamata: ["phone", "Chiamata"], chat: ["message-circle", "Chat"], preventivo: ["file-text", "Preventivo"] };
    return richieste.map((r, i) => {
      const a = r.proId && pro(r.proId), c = cat(r.categoria);
      const d = new Date(r.data).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      const ultimo = r.tipo === "chat" && chat[r.proId]?.at(-1);
      return `<div class="req" style="--i:${i}">
        <div class="top"><b>${ic(tipo[r.tipo][0])}${r.problema || tipo[r.tipo][1] + " · " + c.nome}</b><span class="stato ${r.stato}">${etichetta[r.stato]}</span></div>
        <div class="muted small" style="margin-top:3px">${d}${a ? " · " + esc(a.nome) : ""}${r.luogo === "strada" ? " · su strada" : ""}${r.veicolo ? " · " + esc(r.veicolo) : ""}</div>
        ${r.tipo === "urgenza" && r.testo ? `<p class="small" style="margin:8px 0 0">“${esc(r.testo)}”</p>` : ""}
        ${ultimo ? `<p class="small" style="margin:8px 0 0;color:var(--ink-2)">${ultimo.da === "io" ? "Tu: " : ""}${ultimo.testo ? esc(ultimo.testo) : "Foto"}</p>` : ""}
        ${r.foto?.length ? `<div class="thumbs">${r.foto.map(f => `<img src="${f}" alt="" style="width:52px;height:52px">`).join("")}</div>` : ""}
        ${r.recensione ? `<div class="small" style="margin-top:8px"><span class="stelle">${STELLA.repeat(r.recensione.voto)}</span> la tua recensione</div>` : ""}
        ${r.tipo === "preventivo" && !r.proId ? `<p class="small" style="margin:8px 0 0;color:var(--p1);font-weight:600">${r.offerte.filter(o => o.arrivo <= Date.now()).length} di ${r.offerte.length} preventivi arrivati</p>` : ""}
        <div class="row" style="margin-top:12px">
          ${r.tipo === "preventivo" ? `<a class="btn ${r.proId ? "sec" : ""} press" href="#/preventivo/${r.id}">${ic("file-text")}${r.proId ? "Dettagli" : "Vedi i preventivi"}</a>` : ""}
          ${r.tipo === "urgenza" && r.stato !== "completata" ? `<a class="btn sec press" href="#/traccia/${r.id}">${ic("navigation")}Segui</a>` : ""}
          ${a && r.stato !== "attesa" ? `<a class="btn sec press" href="#/chat/${a.id}">${ic("message-circle")}Chat</a>` : ""}
          ${r.stato === "accettata" && r.tipo !== "chat" ? `<button class="btn press" data-fine="${r.id}">${ic("check")}Finito</button>` : ""}
          ${r.stato === "completata" && !r.recensione ? `<button class="btn press" data-rec="${r.id}">${ic("star")}Recensisci</button>` : ""}
        </div>
      </div>`;
    }).join("");
  },
  dopo() {
    if (richieste.some(r => r.nuovo)) { richieste.forEach(r => (r.nuovo = false)); salvaRichieste(); }
    bottoniRichiesta();
  },
};
function bottoniRichiesta() {
  $$("[data-fine]").forEach(b => b.onclick = () => { aggiornaRichiesta(b.dataset.fine, { stato: "completata" }); render(); apriRecensione(b.dataset.fine); });
  $$("[data-rec]").forEach(b => b.onclick = () => apriRecensione(b.dataset.rec));
}
function apriRecensione(id) {
  const r = richieste.find(x => x.id === id), a = pro(r.proId);
  let v = 5;
  const frasi = ["", "Pessimo", "Così così", "Nella media", "Bene", "Ottimo"];
  apriFoglio(`<div class="center">${avatar(a, "big").replace('class="avatar', 'style="margin:0 auto 12px" class="avatar')}
    <h3>Com'è andata con ${esc(nomeBreve(a))}?</h3></div>
    <div class="stars-in">${[1, 2, 3, 4, 5].map(i => `<button data-v="${i}" class="on">${STELLA}</button>`).join("")}</div>
    <p class="center" style="font-weight:700;margin:-4px 0 12px" id="frase">${frasi[5]}</p>
    <textarea class="in" id="rtxt" placeholder="Puntualità, qualità del lavoro, prezzo…"></textarea>
    <div style="height:12px"></div><button class="btn press" id="rok">Pubblica recensione</button>`,
  el => {
    const stelle = $$("[data-v]", el);
    stelle.forEach(s => s.onclick = () => {
      v = +s.dataset.v; $("#frase", el).textContent = frasi[v];
      stelle.forEach(x => x.classList.toggle("on", +x.dataset.v <= v));
    });
    $("#rok", el).onclick = () => {
      aggiornaRichiesta(id, { recensione: { voto: v, testo: $("#rtxt", el).value.trim() } });
      chiudiFoglio(); toast("Grazie, recensione pubblicata"); render();
    };
  });
}
