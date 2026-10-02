/**
 * Guards every lesson song: static file on disk, valid MP3, untouched since it was
 * verified, and sung words == on-screen lyrics. See scripts/songs.json (canonical
 * lyrics), scripts/song-manifest.json (sha256 pins) and scripts/verify-song.py.
 * Songs are NEVER generated at play time; if one of these fails, fix the asset.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as unit1 from './unit1/scenes';
import * as wt from './welcome-town/scenes';
import * as wtA2 from './welcome-town-a2/scenes';
import * as magicCastle from './magic-castle/scenes';

const root = path.resolve(__dirname, '../../..');
const songs: Record<string, { publicPath: string; lines: string[] }> = JSON.parse(
  fs.readFileSync(path.join(root, 'scripts/songs.json'), 'utf8'),
);
const manifest: Record<string, { bytes: number; sha256: string }> = JSON.parse(
  fs.readFileSync(path.join(root, 'scripts/song-manifest.json'), 'utf8'),
);

type SongScene = { id: string; kind: 'song'; songUrl?: string; durationSeconds?: number; lyrics: { text: string }[]; lineDurationsMs?: number[] };

const songScenes: SongScene[] = [];
const seen = new Set<string>();
for (const mod of [unit1, wt, wtA2, magicCastle] as Record<string, unknown>[]) {
  for (const v of Object.values(mod)) {
    if (!Array.isArray(v)) continue;
    for (const s of v as { id?: string; kind?: string }[]) {
      if (s?.kind === 'song' && s.id && !seen.has(s.id)) { seen.add(s.id); songScenes.push(s as SongScene); }
    }
  }
}

const bySongPath = new Map(Object.entries(songs).map(([key, s]) => [s.publicPath, key]));
const norm = (t: string) =>
  t.replace(/[’‘]/g, "'").toLowerCase().replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Duration (s) of a CBR MPEG-1 Layer III file from its first frame header. */
function mp3Seconds(buf: Buffer): number {
  let i = 0;
  if (buf.slice(0, 3).toString() === 'ID3') i = 10 + (((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f));
  while (i < buf.length - 4 && !(buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0)) i++;
  const kbps = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320][(buf[i + 2] >> 4) & 0xf];
  if (!kbps) throw new Error('no valid MP3 frame header');
  return (buf.length - i) / (kbps * 125);
}

describe('lesson songs are saved, intact and match their lyrics', () => {
  it('finds the song scenes', () => expect(songScenes.length).toBeGreaterThanOrEqual(25));

  for (const scene of songScenes) {
    describe(scene.id, () => {
      const file = scene.songUrl ? scene.songUrl.split('?')[0] : '';
      const abs = path.join(root, 'public', file);

      it('plays a static file from /public (never live generation)', () => {
        expect(file.startsWith('/')).toBe(true);
        expect(fs.existsSync(abs)).toBe(true);
      });

      it('is registered in songs.json with identical lyrics', () => {
        const key = bySongPath.get(`public${file}`);
        expect(key, `${file} missing from scripts/songs.json`).toBeTruthy();
        expect(scene.lyrics.map((l) => norm(l.text))).toEqual(songs[key!].lines.map(norm));
      });

      it('is a valid MP3 matching the pinned checksum', () => {
        const buf = fs.readFileSync(abs);
        const key = bySongPath.get(`public${file}`)!;
        expect(buf.length).toBeGreaterThan(100_000);
        expect(crypto.createHash('sha256').update(buf).digest('hex')).toBe(manifest[key]?.sha256);
        const secs = mp3Seconds(buf);
        if (scene.durationSeconds) expect(Math.abs(secs - scene.durationSeconds)).toBeLessThan(2);
        if (scene.lineDurationsMs) {
          expect(scene.lineDurationsMs).toHaveLength(scene.lyrics.length);
          expect(Math.abs(scene.lineDurationsMs.reduce((a, b) => a + b, 0) / 1000 - secs)).toBeLessThan(1.5);
        }
      });
    });
  }
});
