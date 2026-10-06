# GrapesJS Email Editor

Editor di email drag & drop basato su **GrapesJS + MJML**, con un kit di blocchi dallo stile coerente e un backend per salvare email e immagini.

**Stack:** SvelteKit 2, Svelte 5, TypeScript, adapter-node, GrapesJS 0.23 + grapesjs-mjml, mjml-browser.

## Funzionalità

- **Galleria**: template d'esempio filtrabili per stile, email vuota, elenco delle email salvate (apri, elimina).
- **Editor** con interfaccia propria:
  - a sinistra **Blocchi** (anteprime dal vivo, ricerca, categorie) e **Livelli**;
  - a destra l'**Inspector**, con controlli specifici per ogni tipo di elemento (sezione, colonna, testo, bottone, immagine, divisore, spazio, social, menu, hero, link): palette dello stile corrente, spaziature sui 4 lati, allineamenti, font, bordi, immagini dalla libreria, percorso di selezione e azioni (sposta, duplica, elimina);
  - **barra di formattazione del testo**: grassetto, corsivo, sottolineato, barrato, link, colore, elenchi, allineamento, rimuovi formattazione;
  - **libreria immagini** con upload (trascina o scegli), aggiunta da URL e ricerca;
  - anteprima desktop/tablet/mobile, annulla/ripeti, codice MJML/HTML, download dell'HTML compilato.
- **Stili**: Pulito, Editoriale, Vivace. Il menu *Stile* nell'editor riapplica un altro stile all'email aperta mantenendo i testi.
- **Salvataggio** su disco tramite API: email in JSON, immagini nella cartella `uploads`.

## Avvio

Requisiti: Node.js 20 o superiore, pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

| Comando | Cosa fa |
|-|-|
| `pnpm dev` | server di sviluppo |
| `pnpm check` | controllo dei tipi (svelte-check) |
| `pnpm build` | build di produzione in `build/` |
| `pnpm start` | avvia la build (`node build`) |
| `pnpm kit` | rigenera il kit di blocchi e template in `static/data/kit.json` |
| `pnpm vendor` / `pnpm extract` | scarica le raccolte MJML open source ed estrae template e blocchi (vedi sotto) |

## Produzione

```bash
pnpm build
ORIGIN=https://editor.example.com DATA_DIR=/var/lib/email-editor PORT=3000 node build
```

| Variabile | Uso |
|-|-|
| `ORIGIN` | **obbligatoria in produzione**: URL pubblico del sito. Senza, SvelteKit rifiuta le richieste POST (protezione CSRF) e salvataggi e upload falliscono |
| `DATA_DIR` | cartella dei dati (predefinita `./data`, esclusa da git) |
| `PUBLIC_BASE_URL` | opzionale: base degli URL delle immagini caricate, se diversa da `ORIGIN` (es. un CDN) |
| `PORT`, `HOST` | porta e indirizzo di ascolto (adapter-node) |

Dietro un reverse proxy vanno impostati anche `PROTOCOL_HEADER` / `HOST_HEADER` di adapter-node, oppure solo `ORIGIN`.

## Struttura

```
src/
  routes/
    +page.svelte, +page.server.ts       galleria
    edit/[id]/                          nuova email da template (/edit/blank:<stile> = email vuota)
    email/[id]/                         email salvata
    api/emails/, api/emails/[id]/       API email
    api/assets/, api/assets/[name]/     API immagini
    uploads/[file]/                     immagini caricate
  lib/
    components/                         Preview, Icon, Toast
    components/editor/                  EditorPage, BlocksPanel, Inspector, AssetLibrary, controls/*
    editor/                             schema dell'inspector, barra testo, icone, inserimento blocchi, CSS
    server/catalog.ts                   template, blocchi e stili letti da static/data
    server/storage.ts                   archivio su disco
    themes.ts                           cambio stile, email vuota, segnaposto
    config.ts                           raccolte caricate e stile predefinito
static/data/                            kit.json (+ raccolte estratte)
scripts/                                generazione del kit ed estrazione delle raccolte
reports/                                report dell'ultima estrazione
```

L'editor gira solo nel browser (`ssr = false` sulle pagine `/edit` e `/email`); la galleria è renderizzata dal server.

## API

| Metodo e percorso | Descrizione |
|-|-|
| `GET /api/emails` | elenco delle email salvate |
| `POST /api/emails` | crea un'email: `{ name, mjml, fromTemplate?, theme? }` |
| `GET /api/emails/:id` | singola email |
| `PUT /api/emails/:id` | aggiorna un'email |
| `DELETE /api/emails/:id` | elimina un'email |
| `GET /api/assets` | elenco delle immagini caricate |
| `POST /api/assets` | upload multipart, campo `file` (anche più file) |
| `DELETE /api/assets/:name` | elimina un'immagine |
| `GET /uploads/:file` | serve un'immagine caricata |

- Upload: solo PNG, JPG, GIF e WebP fino a 5 MB, verificati anche dai primi byte del file. SVG escluso: servito dallo stesso dominio potrebbe eseguire script.
- Gli URL delle immagini salvati nell'email sono assoluti, perché devono funzionare nei client di posta.
- `src/lib/server/storage.ts` scrive su file JSON con scritture atomiche: va bene per un'istanza singola. Per più istanze o più carico si sostituisce con un database e uno storage tipo S3 mantenendo le stesse funzioni.

## Kit di blocchi e stili

Il kit è generato da `scripts/build-kit.mjs` (`pnpm kit`): 46 blocchi per stile, tutti validati con MJML in modalità `strict`, più 5 template d'esempio (Newsletter, Promozione, Lancio prodotto, Conferma ordine, Benvenuto).

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

File principali:

- `scripts/kit/themes.mjs`: gli stili (12 colori, font titoli/testo, web font, raggio di bottoni e riquadri);
- `scripts/kit/helpers.mjs`: mattoncini MJML (testo, bottone, immagine…) che usano solo i valori dello stile;
- `scripts/kit/blocks.mjs`: il catalogo dei blocchi;
- `scripts/kit/templates.mjs`: i template d'esempio, come elenco di blocchi.

**Aggiungere uno stile**: copia un tema in `themes.mjs`, cambia id, nome e valori, poi lancia `pnpm kit`. Dentro un tema i colori devono essere tutti diversi tra loro e i due font devono essere stringhe diverse: è quello che permette al cambio stile di convertire un valore nell'altro (lo script lo controlla).

**Cambio stile**: converte nell'MJML colori, font, raggi degli angoli, colori dei segnaposto e web font del tema di partenza in quelli del tema scelto. Un colore scelto a mano che non appartiene allo stile resta com'è.

Le immagini del kit sono segnaposto di placehold.co nei colori dello stile.

## Inspector

Cosa mostra l'inspector per ogni tipo di elemento è definito in `src/lib/editor/schema.ts`: per aggiungere un controllo basta una riga, ad esempio `{ type: 'color', attr: 'background-color', label: 'Sfondo' }`.

Tipi di controllo disponibili (`src/lib/components/editor/controls/`): `text`, `number`, `select`, `segmented`, `toggle`, `color`, `spacing`, `border`, `font`, `image`.

## Raccolte MJML open source (opzionale)

Oltre al kit, l'app può caricare template e blocchi estratti da quattro raccolte open source:

```bash
pnpm vendor     # scarica i repository in vendor/ (commit fissati in scripts/sources.mjs)
pnpm extract    # genera static/data/<raccolta>.json e reports/<raccolta>.md
```

Poi si attivano in `src/lib/config.ts`:

```ts
export const SOURCES = ['kit', 'mjmlio', 'mailteorite', 'easyemail', 'ecommerce'];
```

L'estrazione applica gli `mj-attributes` direttamente sugli elementi (ogni sezione deve funzionare da sola nell'editor), rimuove gli attributi non validi, converte i componenti non supportati da grapesjs-mjml (`mj-table`, `mj-accordion`, `mj-carousel`), valida ogni blocco con MJML ed elimina i duplicati.

| Raccolta | Licenza |
|-|-|
| [mjmlio/email-templates](https://github.com/mjmlio/email-templates) | nessun file LICENSE nel repository: da verificare prima dell'uso in un prodotto |
| [Mailteorite/mjml-email-templates](https://github.com/Mailteorite/mjml-email-templates) | MIT |
| [Easy-Email-Pro/email-templates](https://github.com/Easy-Email-Pro/email-templates) | MIT (dichiarata nel README) |
| [bbulakh/ecommerce-email](https://github.com/bbulakh/ecommerce-email) | MIT |

`vendor/` è trattato come dati: lo script non esegue nulla al suo interno.
