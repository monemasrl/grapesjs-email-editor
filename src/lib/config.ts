// Raccolte caricate dall'app (file in static/data/<id>.json, letti dal server).
// Predefinito: solo il kit generato da scripts/build-kit.mjs (pnpm kit).
// Per aggiungere le raccolte estratte (pnpm vendor && pnpm extract): ['kit', 'mjmlio', 'mailteorite', 'easyemail', 'ecommerce']
export const SOURCES = ['kit'];

// Tema usato per l'email vuota e come scelta iniziale in galleria
export const DEFAULT_THEME = 'pulito';
