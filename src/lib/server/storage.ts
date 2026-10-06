// Archivio su disco: email (JSON) e immagini caricate (file + indice JSON).
// Cartella configurabile con la variabile d'ambiente DATA_DIR (predefinita: ./data).
// Per la produzione si può sostituire con un database e uno storage S3 mantenendo le stesse funzioni.
import { mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { SavedEmail, UploadedAsset } from '$lib/types';

const DATA_DIR = resolve(env.DATA_DIR || 'data');
const EMAILS = join(DATA_DIR, 'emails.json');
const ASSETS = join(DATA_DIR, 'assets.json');
export const UPLOAD_DIR = join(DATA_DIR, 'uploads');

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
// Niente SVG: servito dallo stesso dominio potrebbe eseguire script
export const IMAGE_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};
export const FILE_RE = /^[a-z0-9-]+\.(png|jpg|gif|webp)$/;

// Il tipo dichiarato dal browser non basta: controllo i primi byte del file
function matchesMagic(b: Buffer, ext: string): boolean {
  switch (ext) {
    case 'png': return b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case 'jpg': return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case 'gif': return b.subarray(0, 4).toString('ascii') === 'GIF8';
    case 'webp': return b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP';
    default: return false;
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try { return JSON.parse(await readFile(file, 'utf8')) as T; } catch { return fallback; }
}

// Scrittura atomica (file temporaneo + rename) e serializzata, per non perdere dati con richieste concorrenti
let queue: Promise<unknown> = Promise.resolve();
function writeJson(file: string, data: unknown) {
  const run = async () => {
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2));
    await rename(tmp, file);
  };
  const p = queue.then(run, run);
  queue = p.catch(() => {});
  return p;
}

// ───────── email ─────────
export async function listEmails(): Promise<SavedEmail[]> {
  const list = await readJson<SavedEmail[]>(EMAILS, []);
  return list.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function getEmail(id: string): Promise<SavedEmail | undefined> {
  return (await readJson<SavedEmail[]>(EMAILS, [])).find((e) => e.id === id);
}

export async function saveEmail(input: Omit<SavedEmail, 'id' | 'savedAt'> & { id?: string | null }): Promise<SavedEmail> {
  const list = await readJson<SavedEmail[]>(EMAILS, []);
  const item: SavedEmail = {
    id: input.id || `mail-${randomUUID().slice(0, 8)}`,
    name: input.name,
    mjml: input.mjml,
    fromTemplate: input.fromTemplate ?? null,
    theme: input.theme ?? null,
    savedAt: new Date().toISOString(),
  };
  const i = list.findIndex((e) => e.id === item.id);
  if (i >= 0) list[i] = item; else list.push(item);
  await writeJson(EMAILS, list);
  return item;
}

export async function deleteEmail(id: string): Promise<boolean> {
  const list = await readJson<SavedEmail[]>(EMAILS, []);
  const next = list.filter((e) => e.id !== id);
  if (next.length === list.length) return false;
  await writeJson(EMAILS, next);
  return true;
}

// ───────── immagini ─────────
export async function listAssets(): Promise<UploadedAsset[]> {
  return (await readJson<UploadedAsset[]>(ASSETS, [])).sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export async function saveUpload(file: File, publicBase: string): Promise<UploadedAsset> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error('Formato non supportato (PNG, JPG, GIF o WebP)');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('File troppo grande (max 5 MB)');
  const buf = Buffer.from(await file.arrayBuffer());
  if (!matchesMagic(buf, ext)) throw new Error('Il contenuto non corrisponde a un\'immagine valida');
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(join(UPLOAD_DIR, name), buf);
  const asset: UploadedAsset = {
    name,
    // URL assoluto: nelle email le immagini devono essere raggiungibili da fuori
    src: `${publicBase.replace(/\/$/, '')}/uploads/${name}`,
    original: file.name.slice(0, 120),
    size: file.size,
    addedAt: new Date().toISOString(),
  };
  const list = await readJson<UploadedAsset[]>(ASSETS, []);
  list.push(asset);
  await writeJson(ASSETS, list);
  return asset;
}

export async function deleteAsset(name: string): Promise<boolean> {
  if (!FILE_RE.test(name)) return false;
  const list = await readJson<UploadedAsset[]>(ASSETS, []);
  const next = list.filter((a) => a.name !== name);
  if (next.length === list.length) return false;
  await writeJson(ASSETS, next);
  const path = join(UPLOAD_DIR, name);
  if (existsSync(path)) await unlink(path);
  return true;
}
