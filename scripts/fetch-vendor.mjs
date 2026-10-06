// Scarica i repository sorgenti in vendor/ al commit fissato.
// Il contenuto di vendor/ è trattato come dati: non viene mai eseguito.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SOURCES } from './sources.mjs';

const VENDOR = join(process.cwd(), 'vendor');
mkdirSync(VENDOR, { recursive: true });

for (const s of SOURCES) {
  const dest = join(VENDOR, s.dir);
  const git = (...args) => execFileSync('git', args, { stdio: 'inherit' });
  if (!existsSync(dest)) {
    git('init', '-q', dest);
    git('-C', dest, 'remote', 'add', 'origin', `https://github.com/${s.repo}.git`);
  }
  console.log(`→ ${s.repo}@${s.sha.slice(0, 7)}`);
  git('-C', dest, 'fetch', '-q', '--depth', '1', 'origin', s.sha);
  git('-C', dest, 'checkout', '-q', '--force', 'FETCH_HEAD');
}
