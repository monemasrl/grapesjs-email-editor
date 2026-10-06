# Email Editor — branch `sveltekit`

Stessa applicazione del branch `inspector` (kit di blocchi, 3 stili, inspector per elemento, barra testo, libreria immagini) riscritta in **SvelteKit 2 + Svelte 5 + TypeScript**, con un **backend vero**: email e immagini sono salvate su disco dal server SvelteKit (adapter-node). GrapesJS + grapesjs-mjml restano il motore dell'editor.

## Avvio

```bash
pnpm install
pnpm dev                 # http://localhost:5173
pnpm check               # controllo tipi (svelte-check)
```

Produzione:

```bash
pnpm build
ORIGIN=https://editor.example.com DATA_DIR=/var/lib/email-editor PORT=3000 node build
```

| Variabile | Uso |
|-|-|
| `ORIGIN` | **obbligatoria in produzione**: URL pubblico del sito. Senza, SvelteKit rifiuta i POST (protezione CSRF) e salvataggi/upload falliscono |
| `DATA_DIR` | cartella dei dati (predefinita `./data`, esclusa da git) |
| `PUBLIC_BASE_URL` | opzionale: base degli URL delle immagini caricate, se diversa da `ORIGIN` (es. un CDN) |
| `PORT`, `HOST` | porta e indirizzo di ascolto di adapter-node |

## Struttura

```
src/
  routes/
    +page.svelte / +page.server.ts      galleria (template + email salvate)
    edit/[id]/                          nuova email da template (/edit/blank:<stile> = vuota)
    email/[id]/                         email salvata
    api/emails/ · api/emails/[id]/      GET lista · POST crea · GET/PUT/DELETE singola (JSON)
    api/assets/ · api/assets/[name]/    GET lista · POST upload multipart (campo "file") · DELETE
    uploads/[file]/                     serve le immagini caricate
  lib/
    server/catalog.ts                   kit/template/blocchi letti da static/data/*.json
    server/storage.ts                   archivio su disco (sostituibile con DB + S3)
    components/editor/                  EditorPage, BlocksPanel, Inspector, AssetLibrary, controls/*
    editor/                             schema dell'inspector, barra testo, icone, CSS
    themes.ts                           cambio stile, email vuota, segnaposto
static/data/                            kit.json (+ raccolte estratte)
scripts/                                build-kit.mjs, extract.mjs (scrivono in static/data)
```

Note:

- L'editor gira solo nel browser (`ssr = false` sulle pagine `/edit` e `/email`); la galleria è renderizzata dal server.
- Salvataggio: il primo "Salva" crea l'email (POST) e aggiorna l'URL a `/email/<id>` senza ricaricare; i successivi fanno PUT. `⌘/Ctrl+S` salva. Uscendo con modifiche non salvate viene chiesta conferma.
- Upload immagini: solo PNG, JPG, GIF, WebP fino a 5 MB, verificati anche dai primi byte del file; SVG escluso per sicurezza. Gli URL salvati nell'email sono assoluti (servono ai client di posta).
- Versioni scelte: SvelteKit 2.70 (la 3.0 è uscita pochi giorni fa: l'aggiornamento si può fare a parte), Vite 7, TypeScript 5.9.

---

# Branch `inspector`

Parte da `kit` e rifà l'interfaccia dell'editor in stile "studio", restando su **GrapesJS open source** (nessuna licenza, nessuna dipendenza nuova):

- **Layout**: barra in alto (nome, dispositivi, stile, annulla/ripeti, contorni, anteprima, codice, scarica, salva) · a sinistra **Blocchi | Livelli** · al centro il canvas · a destra l'**Inspector**.
- **Inspector per tipo di elemento** (`src/editor/schema.js`): Email, Sezione, Gruppo di sezioni, Colonna, Testo, Bottone, Immagine, Divisore, Spazio, Social, Icona social, Menu, Voce di menu, Hero, Link. Controlli dedicati (`src/editor/controls.js`): colori con la palette dello stile corrente, spaziature su 4 lati collegabili, allineamenti a icone, font dello stile, bordo (spessore/stile/colore), numeri con unità, interruttori, immagine dalla libreria. Percorso di selezione cliccabile e azioni (contenitore, su/giù, duplica, elimina). Tutto passa dall'undo/redo.
- **Barra testo** (`src/editor/rte.js`): grassetto, corsivo, sottolineato, barrato, link (con "nuova scheda"), rimuovi link, colore (palette dello stile + libero), elenchi puntati/numerati, allineamento del blocco, rimuovi formattazione.
- **Libreria immagini** (`src/editor/assets.js`): trascina file o scegli, aggiungi da URL, cerca, rimuovi; mostra anche le immagini già nell'email e segnaposto nei colori dello stile. **Caricamento simulato**: i file diventano data URL nel localStorage (max 1,5 MB); in produzione va sostituito con un upload al server che restituisce l'URL pubblico.
- **Livelli**: Layer Manager di GrapesJS con radice sul corpo dell'email e nomi in italiano, ristilizzato.

Per aggiungere controlli a un tipo di elemento basta aggiungere una riga in `schema.js` (`{ type, attr, label, … }`).

---

# Branch `kit`

In questo branch l'app mostra **solo il kit di blocchi generato** (`scripts/build-kit.mjs`) e i suoi template d'esempio, con stile unico e **3 stili selezionabili**: Pulito, Editoriale, Vivace.

```bash
npm install
pnpm kit        # rigenera public/data/kit.json (già incluso)
npm run dev        # http://localhost:5173
```

## Il kit

46 blocchi per stile (138 in totale), tutti validati con MJML in modalità `strict`:

| Categoria | Blocchi |
|-|-|
| Header (4) | Logo centrato · Logo + "Vedi online" · Logo + menu · Barra annuncio + logo e link |
| Hero (4) | Immagine + titolo + bottone · Titolo su colore · Testo su immagine di sfondo · Immagine e testo affiancati |
| Testo (5) | Titolo e paragrafo · Paragrafo · Citazione · Elenco puntato · Saluto e firma |
| Testo + immagine (3) | Immagine a sinistra · Immagine a destra · Immagine sopra, testo sotto |
| Colonne (3) | 1 colonna (riquadro) · 2 colonne · 3 colonne |
| Immagine (3) | A tutta larghezza · Con didascalia · Due immagini |
| Logo (2) | Logo con payoff · Loghi partner |
| Prodotto singolo (4) | Centrato · Affiancato in sconto · In evidenza · Riga ordine |
| Prodotti (5) | 2 prodotti · 3 prodotti · 4 prodotti (griglia 2×2) · 4 prodotti in riga · Riepilogo ordine |
| CTA (5) | Bottone centrato · Riquadro con bottone · Due bottoni · Codice sconto · Scarica l'app |
| Social (1) | Barra social |
| Separatori (3) | Linea · Spazio · Linea corta d'accento |
| Footer (4) | Semplice · Con social · Scuro · A colonne |

Template d'esempio (per ogni stile): Newsletter, Promozione, Lancio prodotto, Conferma ordine, Benvenuto.

## Stili

- **Galleria**: scegli lo stile con i chip in alto; anche l'"Email vuota" parte nello stile scelto.
- **Editor**: il menu **Stile** nella barra in alto ri-applica un altro stile all'email aperta **mantenendo i testi**: converte colori, font, raggi degli angoli, colori dei segnaposto e web font. Il pannello blocchi mostra i blocchi dello stile corrente.
- Il cambio stile funziona su tutto ciò che usa i token del tema; un colore scelto a mano nello Style Manager che non appartiene al tema resta com'è.

### Aggiungere o modificare uno stile

Tutto è in `scripts/kit/themes.mjs`: colori (12 token), font titoli/testo, web font, raggio bottoni e riquadri. Copia un tema, cambia i valori e lancia `pnpm kit`. Lo script controlla che dentro un tema i colori siano tutti diversi (serve al cambio stile).

- `scripts/kit/helpers.mjs` — mattoncini MJML (testo, bottone, immagine, ecc.) che leggono solo i token
- `scripts/kit/blocks.mjs` — il catalogo dei blocchi
- `scripts/kit/templates.mjs` — i template d'esempio come elenco di blocchi
- `src/themes.js` — cambio stile lato browser
- `src/config.js` — quali raccolte caricare (`['kit']` in questo branch; aggiungi `'mjmlio'`, `'mailteorite'`, `'easyemail'`, `'ecommerce'` per rivedere anche le raccolte estratte, dopo `npm run extract`)

Le immagini sono segnaposto di placehold.co nei colori dello stile; le email salvate in questo branch usano una chiave di localStorage separata da `master`.

---

# Email Editor (prototipo) — raccolte estratte

Editor di email basato su **GrapesJS + grapesjs-mjml**, con template e blocchi estratti da quattro raccolte open source di template MJML.

- **Galleria**: scegli un template (filtrabile per raccolta e ricercabile) oppure parti da un'email vuota.
- **Editor**: GrapesJS con preset MJML; pannello blocchi a sinistra filtrabile per raccolta, categoria, testo e "solo da questo template". Trascina un blocco nel canvas o cliccalo per inserirlo dopo la sezione selezionata.
- **Salvataggio finto**: le email vanno nel `localStorage` del browser (`src/store.js`); compaiono in galleria sotto "Le mie email". `Cmd/Ctrl+S` salva.
- **Scarica HTML**: esporta l'HTML compilato da MJML.

## Avvio

```bash
npm install
npm run dev        # http://localhost:5173
```

I dati estratti sono già in `public/data/`, quindi non serve altro per partire.

## Rigenerare template e blocchi

```bash
npm run vendor     # scarica i 4 repository in vendor/ (commit fissati in scripts/sources.mjs)
npm run extract    # rigenera public/data/*.json e reports/*.md
```

`vendor/` è trattato come dati: non viene eseguito nulla al suo interno.

### Cosa fa l'estrazione (`scripts/extract.mjs`)

1. Parsing di ogni `.mjml` con il parser XML di MJML.
2. `<mj-attributes>` (`mj-all`, default per tag, `mj-class`) applicati **inline** su ogni elemento: in GrapesJS ogni sezione viene compilata da sola, quindi deve essere autosufficiente. Solo gli attributi validi per il componente vengono copiati.
3. Attributi non validi (che MJML già ignorava) rimossi; `background-color="none"` → `transparent`.
4. Componenti che grapesjs-mjml 1.x non supporta convertiti: `mj-table` → `mj-text` con tabella HTML, `mj-accordion` → `mj-text`, `mj-carousel` → prima immagine. Elementi messi direttamente in `mj-body` (es. `mj-spacer`) avvolti in section/column.
5. In `mj-head` restano solo `mj-font` e `mj-style` (`mj-title`/`mj-preview` verrebbero mostrati come testo nel canvas).
6. Ogni `mj-section` / `mj-wrapper` di primo livello diventa un blocco, validato con MJML in modalità `strict`; duplicati strutturali (stessa struttura e stili, testi/URL diversi) scartati.
7. Categoria assegnata con euristiche (Header, Hero, Testo, Testo + immagine, Immagine, Colonne, Prodotti, CTA, Social, Separatori, Footer); la regola usata è nel tooltip del blocco.
8. Quando un blocco viene inserito, i suoi `mj-font`/`mj-style` d'origine vengono aggiunti a `mj-head` se mancano.

Il riepilogo per ogni raccolta è in `reports/<raccolta>.md`.

## Raccolte

| Raccolta | Template | Blocchi | Licenza |
|-|-|-|-|
| [mjmlio/email-templates](https://github.com/mjmlio/email-templates) | 25 | 180 | nessun file LICENSE nel repo |
| [Mailteorite/mjml-email-templates](https://github.com/Mailteorite/mjml-email-templates) | 14 | 79 | MIT |
| [Easy-Email-Pro/email-templates](https://github.com/Easy-Email-Pro/email-templates) | 50 | 364 | MIT (dichiarata nel README) |
| [bbulakh/ecommerce-email](https://github.com/bbulakh/ecommerce-email) | 5 | 24 | MIT |

Il repository ufficiale MJML non dichiara una licenza: prima di usare quei template in un prodotto conviene verificarlo.

## Struttura

```
scripts/        fetch-vendor.mjs, extract.mjs, sources.mjs
public/data/    index.json + un JSON per raccolta (template e blocchi)
reports/        report di estrazione
src/
  main.js       router (#/, #/edit/<id>, #/email/<id>)
  gallery.js    galleria template ed email salvate
  editor.js     GrapesJS + pannello blocchi personalizzato (blockManager.custom)
  preview.js    anteprime: MJML compilato nel browser, iframe scalati e caricati in modo lazy
  store.js      salvataggio finto (localStorage) — da sostituire con la tua API
```

## Note

- Le anteprime sono renderizzate dal vivo nel browser con `mjml-browser`, quindi non ci sono thumbnail da rigenerare.
- In sviluppo l'istanza dell'editor è disponibile in console come `window.__editor`.
- Un template Mailteorite (`upsell/01-order-bump-discount`) contiene `mj-section` annidate in `mj-column` già nell'originale: si apre, ma MJML segnala avvisi in esportazione.
