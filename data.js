// Dati di ESEMPIO per il prototipo: artigiani, recensioni e foto sono inventati.

const GRUPPI = [
  { id: "impianti", nome: "Impianti", icona: "wrench" },
  { id: "edilizia", nome: "Edilizia e finiture", icona: "brick-wall" },
  { id: "infissi", nome: "Porte e finestre", icona: "door-open" },
  { id: "arredo", nome: "Legno e arredo", icona: "armchair" },
  { id: "riparazioni", nome: "Riparazioni", icona: "hammer" },
  { id: "casa", nome: "Pulizie e traslochi", icona: "spray-can" },
  { id: "esterni", nome: "Giardino ed esterni", icona: "trees" },
  { id: "auto", nome: "Auto e moto", icona: "car" },
];

// top: compare nella home tra "i più cercati". parole: per la ricerca libera.
const CATEGORIE = [
  { id: "idraulico", nome: "Idraulico", icona: "🚰", gruppo: "impianti", top: 1, parole: "acqua perdita tubo scarico lavandino wc water bagno rubinetto doccia allagamento",
    desc: "Riparazione perdite, scarichi otturati, sostituzione sanitari e rubinetteria. Pronto intervento." },
  { id: "elettricista", nome: "Elettricista", icona: "⚡", gruppo: "impianti", top: 2, parole: "luce corrente presa salvavita quadro cortocircuito blackout interruttore lampadario",
    desc: "Impianti civili, quadri elettrici, guasti e cortocircuiti, certificazioni di conformità." },
  { id: "caldaia", nome: "Tecnico caldaie", icona: "🔥", gruppo: "impianti", top: 3, parole: "caldaia termosifoni riscaldamento acqua calda gas bollino fumi",
    desc: "Manutenzione e revisione caldaie, bollino blu, riparazione guasti, installazione nuove caldaie." },
  { id: "clima", nome: "Condizionatori", icona: "❄️", gruppo: "impianti", top: 7, parole: "condizionatore clima aria condizionata pompa di calore split freddo",
    desc: "Installazione, ricarica gas e pulizia condizionatori. Pompe di calore." },
  { id: "antennista", nome: "Antennista", icona: "📡", gruppo: "impianti", parole: "antenna tv parabola segnale canali sky decoder",
    desc: "Installazione e puntamento antenne e parabole, impianti TV condominiali." },
  { id: "allarmi", nome: "Allarmi e videosorveglianza", icona: "📹", gruppo: "impianti", parole: "allarme telecamere videosorveglianza antifurto sicurezza citofono videocitofono",
    desc: "Antifurto, telecamere, videocitofoni e controllo accessi." },
  { id: "solare", nome: "Fotovoltaico e solare", icona: "☀️", gruppo: "impianti", parole: "pannelli fotovoltaico solare batteria accumulo",
    desc: "Impianti fotovoltaici, solare termico, batterie di accumulo e manutenzione." },
  { id: "spurgo", nome: "Spurgo e fognature", icona: "🚛", gruppo: "impianti", parole: "spurgo fogna fossa biologica pozzo nero intasato videoispezione",
    desc: "Spurgo pozzi neri, fosse biologiche, disostruzione e videoispezione condotte." },
  { id: "domotica", nome: "Domotica", icona: "🏠", gruppo: "impianti", parole: "domotica smart home automazione alexa",
    desc: "Casa intelligente: luci, tapparelle e clima comandati da telefono." },

  { id: "muratore", nome: "Muratore", icona: "🧱", gruppo: "edilizia", top: 5, parole: "muro crepa ristrutturazione intonaco massetto murature demolizione",
    desc: "Ristrutturazioni, bagni chiavi in mano, piccole opere murarie, intonaci e massetti." },
  { id: "imbianchino", nome: "Imbianchino", icona: "🎨", gruppo: "edilizia", top: 6, parole: "pittura muffa tinteggiatura imbiancare pareti vernice",
    desc: "Tinteggiature interne ed esterne, trattamenti antimuffa, stucchi decorativi." },
  { id: "piastrellista", nome: "Piastrellista", icona: "🔲", gruppo: "edilizia", parole: "piastrelle pavimento rivestimento mattonelle fughe",
    desc: "Posa pavimenti e rivestimenti, fughe e sostituzione piastrelle rotte." },
  { id: "cartongesso", nome: "Cartongessista", icona: "📐", gruppo: "edilizia", parole: "cartongesso controsoffitto pareti divisorie",
    desc: "Pareti, controsoffitti, librerie e nicchie in cartongesso." },
  { id: "tetti", nome: "Tetti e lattoniere", icona: "🏚️", gruppo: "edilizia", parole: "tetto tegole grondaia infiltrazione lattoniere guaina",
    desc: "Riparazione tetti, grondaie, coppi e infiltrazioni." },
  { id: "impermeabilizzazioni", nome: "Impermeabilizzazioni", icona: "💧", gruppo: "edilizia", parole: "infiltrazioni umidità terrazzo guaina impermeabilizzare",
    desc: "Terrazzi, coperture e muri contro infiltrazioni e umidità di risalita." },
  { id: "parquet", nome: "Parquettista", icona: "🪵", gruppo: "edilizia", parole: "parquet levigatura pavimento legno laminato",
    desc: "Posa, levigatura e lucidatura parquet e pavimenti in legno." },

  { id: "fabbro", nome: "Fabbro", icona: "🔑", gruppo: "infissi", top: 4, parole: "porta chiave serratura chiuso fuori cancello cilindro blindata apertura",
    desc: "Apertura porte, sostituzione serrature e cilindri, cancelli e inferriate su misura." },
  { id: "serramenti", nome: "Serramenti", icona: "🪟", gruppo: "infissi", parole: "finestra infisso zanzariera pvc alluminio porta finestra",
    desc: "Finestre in PVC e alluminio, zanzariere, porte finestre." },
  { id: "tapparelle", nome: "Tapparellista", icona: "🎚️", gruppo: "infissi", parole: "tapparella persiana cinghia motore avvolgibile",
    desc: "Riparazione tapparelle, cambio cinghie, motorizzazioni." },
  { id: "vetraio", nome: "Vetraio", icona: "🔷", gruppo: "infissi", parole: "vetro rotto specchio vetrina doppio vetro",
    desc: "Sostituzione vetri rotti, specchi, box doccia e vetrine." },
  { id: "basculanti", nome: "Cancelli e basculanti", icona: "🚧", gruppo: "infissi", parole: "cancello automatico basculante garage motore telecomando",
    desc: "Automazione e riparazione cancelli, porte garage e basculanti." },

  { id: "falegname", nome: "Falegname", icona: "🪚", gruppo: "arredo", top: 8, parole: "legno mobile armadio porta interna su misura",
    desc: "Mobili su misura, riparazione porte e infissi in legno." },
  { id: "montaggio", nome: "Montaggio mobili", icona: "🪛", gruppo: "arredo", parole: "montaggio mobili ikea cucina armadio smontaggio",
    desc: "Montaggio e smontaggio mobili, cucine e armadi di ogni marca." },
  { id: "tappezziere", nome: "Tappezziere", icona: "🛋️", gruppo: "arredo", parole: "divano sedie rivestimento tende tappezzeria",
    desc: "Rifacimento divani e sedie, tende e tappezzeria." },
  { id: "restauratore", nome: "Restauratore mobili", icona: "🪑", gruppo: "arredo", parole: "restauro mobili antichi lucidatura",
    desc: "Restauro e lucidatura mobili antichi e moderni." },

  { id: "elettrodomestici", nome: "Riparazione elettrodomestici", icona: "🧺", gruppo: "riparazioni", parole: "lavatrice lavastoviglie frigo forno asciugatrice elettrodomestico",
    desc: "Lavatrici, lavastoviglie, frigoriferi e forni di tutte le marche." },
  { id: "tuttofare", nome: "Tuttofare", icona: "🧰", gruppo: "riparazioni", parole: "piccoli lavori tuttofare mensole quadri lampadine sistemare",
    desc: "Piccoli lavori di casa: mensole, quadri, tende, sistemazioni varie." },
  { id: "informatico", nome: "Tecnico PC e telefoni", icona: "💻", gruppo: "riparazioni", parole: "computer pc telefono wifi internet stampante cellulare schermo",
    desc: "Riparazione PC e smartphone, rete Wi-Fi, stampanti, assistenza a domicilio." },
  { id: "stufe", nome: "Stufe e camini", icona: "♨️", gruppo: "riparazioni", parole: "stufa pellet camino canna fumaria spazzacamino",
    desc: "Manutenzione stufe a pellet, camini e pulizia canne fumarie." },

  { id: "pulizie", nome: "Impresa di pulizie", icona: "🧽", gruppo: "casa", parole: "pulizie casa ufficio fine cantiere vetri sanificazione",
    desc: "Pulizie di casa, uffici, condomini e fine cantiere." },
  { id: "traslochi", nome: "Traslochi", icona: "📦", gruppo: "casa", parole: "trasloco trasporto mobili furgone",
    desc: "Traslochi completi, imballaggio, trasporto e montaggio." },
  { id: "sgomberi", nome: "Sgombero locali", icona: "🗑️", gruppo: "casa", parole: "sgombero cantina soffitta rifiuti ingombranti",
    desc: "Sgombero cantine, soffitte e appartamenti con smaltimento." },
  { id: "disinfestazione", nome: "Disinfestazione", icona: "🐜", gruppo: "casa", parole: "topi scarafaggi vespe zanzare insetti blatte derattizzazione",
    desc: "Insetti, roditori, nidi di vespe. Interventi rapidi." },
  { id: "lavaggio", nome: "Lavaggio tappeti e divani", icona: "🫧", gruppo: "casa", parole: "lavaggio tappeti divani materassi moquette",
    desc: "Lavaggio a domicilio di divani, tappeti e materassi." },

  { id: "giardiniere", nome: "Giardiniere", icona: "🌿", gruppo: "esterni", parole: "giardino prato erba siepe taglio irrigazione",
    desc: "Manutenzione prati, siepi, impianti di irrigazione, pulizia terreni." },
  { id: "potatura", nome: "Potatura alberi", icona: "🌲", gruppo: "esterni", parole: "albero potatura abbattimento tree climbing",
    desc: "Potatura e abbattimento alberi alti, anche in tree climbing." },
  { id: "piscine", nome: "Piscine", icona: "🏊", gruppo: "esterni", parole: "piscina pulizia pompa filtro",
    desc: "Pulizia, manutenzione e riparazione piscine." },
  { id: "recinzioni", nome: "Recinzioni e pergole", icona: "🏡", gruppo: "esterni", parole: "recinzione pergola gazebo tettoia staccionata",
    desc: "Recinzioni, pergolati, tettoie e gazebo su misura." },

  { id: "meccanico", nome: "Meccanico", icona: "🔩", gruppo: "auto", parole: "auto macchina meccanico tagliando motore freni",
    desc: "Tagliandi, freni, frizione e diagnosi guasti." },
  { id: "elettrauto", nome: "Elettrauto", icona: "🔋", gruppo: "auto", parole: "batteria auto non parte elettrauto fari",
    desc: "Batterie, impianto elettrico auto, avviamento e fari." },
  { id: "carrozziere", nome: "Carrozziere", icona: "🚙", gruppo: "auto", parole: "carrozzeria graffio ammaccatura bozza grandine",
    desc: "Ammaccature, graffi, verniciatura e danni da grandine." },
  { id: "gommista", nome: "Gommista", icona: "🛞", gruppo: "auto", parole: "gomme pneumatici foratura cambio gomme",
    desc: "Cambio gomme, forature, equilibratura, anche a domicilio." },
  { id: "soccorso", nome: "Soccorso stradale", icona: "🆘", gruppo: "auto", parole: "carro attrezzi soccorso stradale guasto auto ferma incidente",
    desc: "Carro attrezzi e soccorso stradale 24 ore su 24." },
];

// Icone (libreria Lucide) e come si chiamano di solito le aziende di quel settore
const ICONE = {
  idraulico: ["droplets", "Idraulica"], elettricista: ["zap", "Impianti Elettrici"], caldaia: ["flame", "Termotecnica"],
  clima: ["snowflake", "Clima"], antennista: ["satellite-dish", "Antenne"], allarmi: ["cctv", "Sicurezza"],
  solare: ["sun", "Energia Solare"], spurgo: ["container", "Spurghi"], domotica: ["lightbulb", "Domotica"],
  muratore: ["brick-wall", "Edilizia"], imbianchino: ["paint-roller", "Decorazioni"], piastrellista: ["layout-grid", "Pavimenti"],
  cartongesso: ["ruler", "Cartongessi"], tetti: ["house", "Coperture"], impermeabilizzazioni: ["umbrella", "Impermeabilizzazioni"],
  parquet: ["layers", "Parquet"], fabbro: ["key-round", "Serrature"], serramenti: ["app-window", "Serramenti"],
  tapparelle: ["blinds", "Tapparelle"], vetraio: ["scan", "Vetreria"], basculanti: ["warehouse", "Automazioni"],
  falegname: ["hammer", "Falegnameria"], montaggio: ["drill", "Montaggi"], tappezziere: ["sofa", "Tappezzeria"],
  restauratore: ["armchair", "Restauri"], elettrodomestici: ["washing-machine", "Assistenza Elettrodomestici"],
  tuttofare: ["wrench", "Servizi Casa"], informatico: ["laptop", "Assistenza Informatica"], stufe: ["heater", "Stufe e Camini"],
  pulizie: ["spray-can", "Pulizie"], traslochi: ["package", "Traslochi"], sgomberi: ["trash-2", "Sgomberi"],
  disinfestazione: ["bug", "Disinfestazioni"], lavaggio: ["sparkles", "Lavaggi"], giardiniere: ["leaf", "Giardini"],
  potatura: ["trees", "Verde"], piscine: ["waves", "Piscine"], recinzioni: ["fence", "Recinzioni"],
  meccanico: ["car", "Autofficina"], elettrauto: ["battery-charging", "Elettrauto"], carrozziere: ["car-front", "Carrozzeria"],
  gommista: ["disc", "Pneumatici"], soccorso: ["truck", "Soccorso Stradale"],
};
CATEGORIE.forEach(c => { c.emoji = c.icona; c.icona = ICONE[c.id][0]; c.settore = ICONE[c.id][1]; });
const EMOJI_GRUPPI = { impianti: "🔧", edilizia: "🧱", infissi: "🚪", arredo: "🪑", riparazioni: "🛠️", casa: "🧹", esterni: "🌳", auto: "🚗" };
GRUPPI.forEach(g => { g.emoji = EMOJI_GRUPPI[g.id]; });

// Problemi pronti per il pulsante SOS: chi non sa che mestiere serve sceglie il problema
const PROBLEMI = {
  casa: [
    { id: "perdita", nome: "Perdita d'acqua", icona: "droplets", cat: "idraulico", prezzo: "60–120 €" },
    { id: "corrente", nome: "Senza corrente", icona: "zap", cat: "elettricista", prezzo: "50–100 €" },
    { id: "caldaia", nome: "Caldaia guasta", icona: "flame", cat: "caldaia", prezzo: "70–150 €" },
    { id: "chiuso", nome: "Chiuso fuori casa", icona: "key-round", cat: "fabbro", prezzo: "80–150 €" },
    { id: "scarico", nome: "Scarico o WC intasato", icona: "container", cat: "spurgo", prezzo: "70–140 €" },
    { id: "vetro", nome: "Vetro rotto", icona: "scan", cat: "vetraio", prezzo: "80–200 €" },
    { id: "tapparella", nome: "Tapparella bloccata", icona: "blinds", cat: "tapparelle", prezzo: "40–90 €" },
    { id: "insetti", nome: "Vespe, topi, insetti", icona: "bug", cat: "disinfestazione", prezzo: "80–150 €" },
  ],
  strada: [
    { id: "gomma", nome: "Gomma bucata", icona: "disc", cat: "gommista", prezzo: "50–110 €" },
    { id: "batteria", nome: "L'auto non parte", icona: "battery-warning", cat: "elettrauto", prezzo: "50–130 €" },
    { id: "panne", nome: "Auto in panne, serve il carro attrezzi", icona: "truck", cat: "soccorso", prezzo: "90–180 €" },
    { id: "incidente", nome: "Incidente", icona: "triangle-alert", cat: "soccorso", prezzo: "da 120 €" },
    { id: "chiavi", nome: "Chiavi chiuse in auto", icona: "key-round", cat: "fabbro", prezzo: "60–120 €" },
    { id: "benzina", nome: "Senza carburante", icona: "fuel", cat: "soccorso", prezzo: "50–90 €" },
  ],
};
const EMOJI_PROBLEMI = { perdita: "💧", corrente: "⚡", caldaia: "🔥", chiuso: "🔑", scarico: "🚽", vetro: "🪟", tapparella: "🎚️", insetti: "🐜",
  gomma: "🛞", batteria: "🔋", panne: "🚛", incidente: "⚠️", chiavi: "🗝️", benzina: "⛽" };
Object.values(PROBLEMI).flat().forEach(p => { p.emoji = EMOJI_PROBLEMI[p.id]; });
const SU_STRADA = ["gommista", "elettrauto", "soccorso", "fabbro", "meccanico"];

const CERTIFICAZIONI = [
  "Abilitazione impianti DM 37/08", "Patentino F-gas", "Abilitazione impianti termici", "Iscrizione Albo gestori ambientali",
  "Corso sicurezza cantieri", "Lavori in quota", "Assicurazione RC professionale",
];

const PROVINCE = {
  "Ancona": ["Ancona", "Senigallia", "Jesi", "Fabriano", "Osimo", "Falconara Marittima"],
  "Pesaro e Urbino": ["Pesaro", "Fano", "Urbino", "Fossombrone"],
  "Macerata": ["Macerata", "Civitanova Marche", "Recanati", "Tolentino"],
  "Fermo": ["Fermo", "Porto San Giorgio", "Porto Sant'Elpidio"],
  "Ascoli Piceno": ["Ascoli Piceno", "San Benedetto del Tronto", "Grottammare"],
};
const COORD = {
  "Ancona": [43.616, 13.519], "Senigallia": [43.715, 13.217], "Jesi": [43.523, 13.244], "Fabriano": [43.336, 12.904],
  "Osimo": [43.486, 13.482], "Falconara Marittima": [43.627, 13.398], "Pesaro": [43.910, 12.913], "Fano": [43.840, 13.019],
  "Urbino": [43.726, 12.636], "Fossombrone": [43.689, 12.807], "Macerata": [43.298, 13.453],
  "Civitanova Marche": [43.307, 13.729], "Recanati": [43.404, 13.549], "Tolentino": [43.209, 13.284],
  "Fermo": [43.160, 13.718], "Porto San Giorgio": [43.183, 13.795], "Porto Sant'Elpidio": [43.257, 13.758],
  "Ascoli Piceno": [42.854, 13.575], "San Benedetto del Tronto": [42.948, 13.880], "Grottammare": [42.989, 13.866],
};
const TUTTE_CITTA = Object.entries(PROVINCE).flatMap(([prov, citta]) => citta.map(c => ({ citta: c, prov })));

const NOMI = ["Marco", "Luca", "Andrea", "Paolo", "Giorgio", "Stefano", "Matteo", "Simone", "Davide", "Roberto",
  "Fabio", "Alessio", "Nicola", "Daniele", "Francesco", "Lorenzo", "Michele", "Riccardo", "Emanuele", "Giulia",
  "Sara", "Elena", "Federico", "Mirko", "Cristian", "Valerio", "Tommaso", "Ilaria"];
const COGNOMI = ["Rossi", "Ferretti", "Mancini", "Pierini", "Santoni", "Marinelli", "Cesaroni", "Bartolini",
  "Giacomini", "Paolini", "Morbidelli", "Capriotti", "Pigini", "Vitali", "Ciccarelli", "Fabbri", "Leonardi",
  "Brunori", "Carletti", "Mariani", "Silvestri", "Tombolini", "Natali", "Gentili", "Rinaldi", "Properzi", "Sbarbati"];

const TESTI_RECENSIONI = [
  [5, "Puntualissimo e preciso, ha risolto il problema in mezz'ora. Consigliato!"],
  [5, "Chiamato di domenica per un'urgenza, è arrivato in meno di un'ora. Gentilissimo."],
  [5, "Lavoro pulito, prezzo onesto e spiegato tutto prima di iniziare."],
  [4, "Bravo e competente, un po' di ritardo sull'orario ma ha avvisato."],
  [4, "Buon lavoro, prezzo nella media. Lo richiamerei."],
  [5, "Finalmente uno serio! Preventivo rispettato al centesimo."],
  [3, "Il lavoro è fatto bene ma ci ha messo più giorni del previsto."],
  [5, "Super disponibile, mi ha anche dato consigli per evitare il problema in futuro."],
  [4, "Professionale e cordiale. Unico neo il costo dell'uscita."],
  [5, "Ha lasciato tutto pulito e in ordine. Bravissimo."],
];
const AUTORI = ["Anna M.", "Giuseppe R.", "Laura B.", "Franco P.", "Chiara S.", "Massimo T.", "Valentina C.",
  "Sergio L.", "Paola F.", "Antonio G.", "Silvia D.", "Claudio V."];
const LAVORI_FOTO = ["Prima e dopo", "Intervento in casa", "Lavoro finito", "Cantiere", "Dettaglio", "Sopralluogo"];

// generatore pseudo-casuale fisso: i dati sono sempre gli stessi a ogni apertura
let _seme = 11;
function caso() { _seme = (_seme * 9301 + 49297) % 233280; return _seme / 233280; }
function scegli(arr) { return arr[Math.floor(caso() * arr.length)]; }

const ARTIGIANI = [];
(function generaArtigiani() {
  let id = 1;
  const forme = [" Srl", " Snc", " & Figli", " Srls", ""];
  for (const cat of CATEGORIE) {
    for (const prov of Object.keys(PROVINCE)) {
      const quanti = (cat.top || SU_STRADA.includes(cat.id) ? 4 : 2) + Math.floor(caso() * 3);
      for (let i = 0; i < quanti; i++) {
        const citta = scegli(PROVINCE[prov]);
        const persona = scegli(NOMI) + " " + scegli(COGNOMI);
        const azienda = caso() < 0.62;
        const nome = azienda ? `${cat.settore} ${persona.split(" ")[1]}${scegli(forme)}` : persona;
        const nRec = 3 + Math.floor(caso() * 5);
        const recensioni = [];
        for (let r = 0; r < nRec; r++) {
          const [voto, testo] = scegli(TESTI_RECENSIONI);
          recensioni.push({ voto, testo, autore: scegli(AUTORI), mesiFa: 1 + Math.floor(caso() * 11) });
        }
        const media = recensioni.reduce((s, r) => s + r.voto, 0) / recensioni.length;
        const [la, lo] = COORD[citta];
        const nFoto = 3 + Math.floor(caso() * 4);
        const strada = SU_STRADA.includes(cat.id) && (cat.gruppo === "auto" || caso() < 0.5);
        ARTIGIANI.push({
          id: id++, nome, tipo: azienda ? "azienda" : "indipendente", referente: persona,
          dipendenti: azienda ? 2 + Math.floor(caso() * 18) : 1, mezzi: azienda ? 1 + Math.floor(caso() * 6) : 1,
          categoria: cat.id, citta, provincia: prov,
          lat: la - caso() * 0.035 + 0.004, lng: lo - caso() * 0.06 - 0.004,
          raggioKm: scegli([15, 20, 30, 40]),
          voto: Math.round(media * 10) / 10,
          numRecensioni: nRec + Math.floor(caso() * (azienda ? 140 : 60)),
          recensioni,
          verificato: caso() < (azienda ? 0.85 : 0.65),
          urgenze: strada || caso() < 0.55,
          strada,
          h24: strada && caso() < 0.6,
          disponibileOra: caso() < 0.55,
          tariffaOra: 25 + Math.floor(caso() * 6) * 5,
          uscita: scegli([0, 20, 25, 30, 35]),
          anniEsperienza: 2 + Math.floor(caso() * 28),
          rispostaMin: scegli([5, 10, 15, 30, 60]),
          lavori: 10 + Math.floor(caso() * (azienda ? 900 : 300)),
          orari: strada && caso() < 0.6 ? "24 ore su 24" : scegli(["Lun–Ven 8–18", "Lun–Sab 7:30–19", "Tutti i giorni 8–20"]),
          foto: Array.from({ length: nFoto }, () => ({ titolo: scegli(LAVORI_FOTO), tono: Math.floor(caso() * 360) })),
        });
      }
    }
  }
})();

// Punteggio "consigliato": come sceglie l'app il migliore per te
function punteggio(a) {
  return a.voto * 20 + (a.disponibileOra ? 14 : 0) + (a.verificato ? 10 : 0) + Math.log(a.numRecensioni + 1) * 4
    - (a.dist ?? 10) * 0.9 + (a.tipo === "azienda" ? 3 : 0);
}

// Domande di iscrizione in attesa (per il pannello admin)
const CANDIDATI_DEMO = [
  { id: "c1", tipo: "azienda", nome: "Impianti Elettrici Bartolini Srl", categoria: "elettricista", citta: "Jesi", piva: "02841230429", doc: ["Carta d'identità", "Visura camerale", "DM 37/08"], giorni: 1 },
  { id: "c2", tipo: "indipendente", nome: "Martina Silvestri", categoria: "pulizie", citta: "Pesaro", piva: "02739810414", doc: ["Carta d'identità", "Visura camerale"], giorni: 1 },
  { id: "c3", tipo: "azienda", nome: "Termotecnica Vitali Snc", categoria: "caldaia", citta: "Macerata", piva: "01928370431", doc: ["Carta d'identità", "Abilitazione impianti termici"], giorni: 2 },
  { id: "c4", tipo: "indipendente", nome: "Enrico Capriotti", categoria: "fabbro", citta: "San Benedetto del Tronto", piva: "", doc: ["Carta d'identità"], giorni: 3 },
  { id: "c5", tipo: "azienda", nome: "Soccorso Stradale Natali Srl", categoria: "soccorso", citta: "Fermo", piva: "02311870447", doc: ["Carta d'identità", "Iscrizione REN autotrasporto", "Assicurazione RC"], giorni: 4 },
];

const SUPPLEMENTO_URGENZA = 9.9;
const PREZZO_PRO = 19;
