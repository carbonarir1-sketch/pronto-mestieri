// Pannello amministratore (demo): approvazioni, numeri, segnalazioni.

function domande() {
  const lista = CANDIDATI_DEMO.map(c => ({ ...c }));
  if (mioProfilo) lista.unshift({
    id: "me", tipo: mioProfilo.tipo, nome: mioProfilo.nome, categoria: mioProfilo.categoria, citta: mioProfilo.citta, piva: mioProfilo.piva || "",
    doc: [mioProfilo.doc.id && "Documento d'identità", mioProfilo.doc.visura && "Visura / P.IVA", mioProfilo.doc.rc && "Assicurazione RC", mioProfilo.doc.mezzo && "Libretto mezzo", ...mioProfilo.cert].filter(Boolean),
    giorni: 0, tu: true,
  });
  return lista;
}
const SEGNALAZIONI = [
  { id: "s1", testo: "Recensione sospetta: 5 recensioni a 5 stelle in un giorno", chi: "Profilo #214" },
  { id: "s2", testo: "Cliente segnala: il soccorso non si è presentato", chi: "SOS del 21 nov" },
];

ROTTE.admin = {
  tab: "artigiano", indietro: true, titolo: "Pannello admin",
  html() {
    const tutti = domande();
    const attesa = tutti.filter(c => !admin.decisi[c.id]);
    const approvati = Object.entries(admin.decisi).filter(([k, v]) => v === "ok" && !k.startsWith("s")).length;
    const attivi = ARTIGIANI.length + approvati;
    const aziende = ARTIGIANI.filter(a => a.tipo === "azienda").length;
    const nPro = Math.round(attivi * 0.22);
    const sosMese = 312 + richieste.filter(r => r.tipo === "urgenza").length;
    const entrate = nPro * PREZZO_PRO + sosMese * SUPPLEMENTO_URGENZA;
    const giorni = [38, 45, 41, 57, 52, 68, 74 + richieste.length];
    const max = Math.max(...giorni);
    const pts = giorni.map((v, i) => `${i * 50 + 5},${85 - v / max * 72}`).join(" ");
    const perCat = CATEGORIE.map(c => ({ c, n: Math.round(ARTIGIANI.filter(a => a.categoria === c.id).reduce((s, a) => s + a.lavori, 0) / 10) }))
      .sort((a, b) => b.n - a.n).slice(0, 6);
    const maxC = perCat[0].n;
    return `
      <div class="dark-top"><span>Entrate stimate questo mese</span><b>${euro(entrate)}</b>
        <span>${nPro} abbonati Pro × ${PREZZO_PRO} € + ${sosMese} SOS × ${euro(SUPPLEMENTO_URGENZA)}</span></div>
      <div class="kpi">
        <div style="--i:0"><b>${attivi}</b>iscritti attivi <small>+${approvati + 18}</small><br>${aziende} aziende · ${attivi - aziende} professionisti</div>
        <div style="--i:1"><b>${attesa.filter(c => !c.id.startsWith("s")).length}</b>domande da approvare</div>
        <div style="--i:2"><b>${giorni.reduce((a, b) => a + b, 0)}</b>richieste in 7 giorni <small>+24%</small></div>
        <div style="--i:3"><b>18 min</b>arrivo medio SOS</div>
      </div>
      <div class="box">
        <h3>${ic("trending-up")}Richieste al giorno</h3>
        <svg class="spark" viewBox="0 0 310 90" preserveAspectRatio="none">
          <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2453e6" stop-opacity=".2"/><stop offset="1" stop-color="#2453e6" stop-opacity="0"/></linearGradient></defs>
          <polygon points="5,88 ${pts} 305,88" fill="url(#ga)"/>
          <path class="l" d="M${pts.replace(/ /g, " L")}" fill="none" stroke="#2453e6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="riga" style="justify-content:space-between">${["L", "M", "M", "G", "V", "S", "Oggi"].map(g => `<span>${g}</span>`).join("")}</div>
      </div>
      <h2>Domande di iscrizione</h2>
      ${tutti.map((c, i) => {
        const dec = admin.decisi[c.id], k = cat(c.categoria);
        return `<div class="req" style="--i:${i}${c.tu ? ";outline:2px solid var(--p1)" : ""}">
          <div class="top"><b>${ic(c.tipo === "azienda" ? "building-2" : "user-round")}${esc(c.nome)}${c.tu ? ' <span class="badge grey">sei tu</span>' : ""}</b>
            ${dec ? `<span class="stato ${dec === "ok" ? "completata" : "rifiutata"}">${dec === "ok" ? "Approvato" : "Rifiutato"}</span>` : `<span class="muted small">${c.giorni ? c.giorni + " g fa" : "adesso"}</span>`}</div>
          <div class="muted small">${c.tipo === "azienda" ? "Azienda" : "Professionista"} · ${k.nome} · ${esc(c.citta)} · P.IVA ${c.piva ? esc(c.piva) : "<b style='color:var(--sos1)'>mancante</b>"}</div>
          <div class="doclist">${c.doc.length ? c.doc.map(d => `<span class="badge grey">${ic("file-check")}${esc(d)}</span>`).join("") : `<span class="badge urg">${ic("file-x")}Nessun documento</span>`}</div>
          ${dec ? "" : `<div class="row"><button class="btn ghost" data-ko="${c.id}">Rifiuta</button><button class="btn ok press" data-okk="${c.id}">${ic("check")}Approva</button></div>`}
        </div>`;
      }).join("")}
      <h2>Lavori per mestiere</h2>
      <div class="box">${perCat.map(({ c, n }) => `<div class="hbar"><span>${em(c)}${c.nome}</span><i style="--w:${n / maxC * 100}%"></i><b>${n}</b></div>`).join("")}</div>
      <h2>Segnalazioni</h2>
      ${SEGNALAZIONI.filter(s => !admin.decisi[s.id]).map(s => `<div class="req"><div class="top"><b>${ic("flag")}${s.chi}</b></div>
        <p class="small" style="margin:6px 0 10px">${s.testo}</p>
        <div class="row"><button class="btn ghost" data-ko="${s.id}">Ignora</button><button class="btn dark press" data-okk="${s.id}">Gestita</button></div></div>`).join("")
        || vuoto("shield-check", "Nessuna segnalazione aperta")}
      <button class="btn ghost" id="reset">Azzera le decisioni demo</button>`;
  },
  dopo() {
    const decidi = (id, v) => {
      admin.decisi[id] = v; salva("admin", admin);
      toast(id.startsWith("s") ? "Segnalazione chiusa" : v === "ok" ? "Approvato: ora è visibile ai clienti" : "Domanda rifiutata");
      render();
    };
    $$("[data-okk]").forEach(b => b.onclick = () => decidi(b.dataset.okk, "ok"));
    $$("[data-ko]").forEach(b => b.onclick = () => decidi(b.dataset.ko, "no"));
    $("#reset").onclick = () => { admin = { decisi: {} }; salva("admin", admin); render(); };
  },
};
