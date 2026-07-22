import { useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon, Music, Search, Loader2, FolderOpen } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type AssetKind = 'image' | 'audio' | 'other';
interface VaultAsset {
  name: string;
  bucket: string;
  path: string;
  url: string;
  kind: AssetKind;
  updatedAt: string | null;
  size: number | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hub: 'playground' | 'academy' | 'success';
  /** Called when the creator picks an asset.
   *  `field` is 'image_url' or 'audio_url'. Parent merges into active slide. */
  onPick: (asset: { url: string; kind: AssetKind; field: 'image_url' | 'audio_url' }) => void;
}

const HUB_BUCKETS: Record<Props['hub'], { bucket: string; prefix: string }[]> = {
  playground: [
    { bucket: 'playground_assets', prefix: '' },
    { bucket: 'lesson-assets', prefix: 'studio' },
  ],
  academy: [
    { bucket: 'lesson-assets', prefix: 'studio' },
  ],
  success: [
    { bucket: 'lesson-assets', prefix: 'studio' },
  ],
};

function classifyKind(name: string): AssetKind {
  const n = name.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(n)) return 'image';
  if (/\.(mp3|wav|m4a|ogg|webm)$/.test(n)) return 'audio';
  return 'other';
}

/**
 * Recursively list every file under `prefix` in `bucket`. Supabase's `.list()`
 * is shallow, so we fan out into subfolders. Caps depth/breadth to keep it
 * snappy on large libraries.
 */
async function listAllFiles(bucket: string, prefix: string, depth = 0): Promise<VaultAsset[]> {
  if (depth > 4) return [];
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 200,
    sortBy: { column: 'updated_at', order: 'desc' },
  });
  if (error || !data) return [];
  const out: VaultAsset[] = [];
  for (const item of data) {
    // A folder has no `id` (and no metadata).
    const isFolder = !item.id;
    const childPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (isFolder) {
      const nested = await listAllFiles(bucket, childPath, depth + 1);
      out.push(...nested);
    } else {
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(childPath);
      out.push({
        name: item.name,
        bucket,
        path: childPath,
        url: pub.publicUrl,
        kind: classifyKind(item.name),
        updatedAt: (item as any).updated_at || null,
        size: (item.metadata as any)?.size ?? null,
      });
    }
  }
  return out;
}

export function AssetVaultDialog({ open, onOpenChange, hub, onPick }: Props) {
  const [assets, setAssets] = useState<VaultAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'image' | 'audio'>('image');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const sources = HUB_BUCKETS[hub];
        const results = await Promise.all(
          sources.map((s) => listAllFiles(s.bucket, s.prefix)),
        );
        if (!cancelled) {
          const flat = results.flat().filter((a) => a.kind !== 'other');
          setAssets(flat);
        }
      } catch (e: any) {
        if (!cancelled) toast.error(e?.message || 'Failed to load vault');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, hub]);

  const filtered = useMemo(() => {
    return assets
      .filter((a) => a.kind === tab)
      .filter((a) => !query.trim() || a.name.toLowerCase().includes(query.trim().toLowerCase()) || a.path.toLowerCase().includes(query.trim().toLowerCase()))
      .slice(0, 200);
  }, [assets, tab, query]);

  const accent = hub === 'playground' ? 'text-orange-600 border-orange-200' : 'text-indigo-600 border-indigo-200';
  const accentActive = hub === 'playground' ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white';

  const handlePick = (asset: VaultAsset) => {
    onPick({
      url: asset.url,
      kind: asset.kind,
      field: asset.kind === 'audio' ? 'audio_url' : 'image_url',
    });
    onOpenChange(false);
    toast.success(`${asset.kind === 'audio' ? 'Audio' : 'Image'} added to slide`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className={cn('flex items-center gap-2', accent.split(' ')[0])}>
            <FolderOpen className="w-5 h-5" /> Asset Vault
          </DialogTitle>
          <DialogDescription>
            Reuse images and audio you've already generated or uploaded — click to insert into the current slide.
          </DialogDescription>
        </DialogHeader>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="inline-flex rounded-full bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTab('image')}
              className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition',
                tab === 'image' ? accentActive : 'text-slate-600 hover:text-slate-800')}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Images
            </button>
            <button
              type="button"
              onClick={() => setTab('audio')}
              className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition',
                tab === 'audio' ? accentActive : 'text-slate-600 hover:text-slate-800')}
            >
              <Music className="w-3.5 h-3.5" /> Audio
            </button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by filename…"
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading vault…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm gap-1">
              <FolderOpen className="w-6 h-6" />
              No {tab} assets yet. Generate or upload one and it will appear here.
            </div>
          ) : tab === 'image' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filtered.map((a) => (
                <button
                  key={a.bucket + a.path}
                  type="button"
                  onClick={() => handlePick(a)}
                  className="group relative rounded-lg overflow-hidden border border-slate-200 bg-white aspect-square hover:border-slate-400 transition"
                  title={a.name}
                >
                  <img
                    src={a.url}
                    alt={a.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-1.5 py-1 truncate opacity-0 group-hover:opacity-100 transition">
                    {a.name}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <ul className="space-y-1.5">
              {filtered.map((a) => (
                <li
                  key={a.bucket + a.path}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2 hover:border-slate-400 transition"
                >
                  <Music className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-700 truncate">{a.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{a.bucket}/{a.path}</div>
                  </div>
                  <audio src={a.url} controls className="h-8 max-w-[180px]" />
                  <button
                    type="button"
                    onClick={() => handlePick(a)}
                    className={cn('rounded-md px-2.5 py-1 text-xs font-semibold text-white shrink-0',
                      hub === 'playground' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700')}
                  >
                    Use
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-[10px] text-slate-400 text-center">
          Showing up to 200 most recent assets per type.
        </div>
      </DialogContent>
    </Dialog>
  );
}
