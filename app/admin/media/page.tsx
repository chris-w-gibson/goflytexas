import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth';
import type { MediaItem } from '@/lib/db/schema';
import { formatBytes, formatDuration, parseFilter, type MediaFilter } from '@/lib/media/rules';
import { mediaStorage } from '@/lib/media/storage';
import { listMedia, mediaTotals } from '@/lib/media/store';
import { MediaUploader } from './MediaUploader';
import { deleteMediaAction, saveMediaAction } from './actions';

export const dynamic = 'force-dynamic';

function addedOn(d: Date): string {
  return d.toLocaleDateString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric' });
}

function Tile({ item, canEdit, canDelete }: { item: MediaItem; canEdit: boolean; canDelete: boolean }) {
  const file = `/admin/media/file/${item.id}`;
  const hasPicture = Boolean(item.thumbKey) || item.kind === 'photo';
  const duration = formatDuration(item.durationSec);
  return (
    <li className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col" data-testid="media-tile">
      <a href={file} target="_blank" rel="noreferrer" className="relative block aspect-[4/3] bg-slate-100">
        {hasPicture ? (
          // eslint-disable-next-line @next/next/no-img-element -- a signed, short-lived link; the image optimizer cannot fetch it
          <img
            src={`${file}?thumb=1`}
            alt={item.note ?? item.filename}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 px-3 text-center">
            {item.filename}
          </span>
        )}
        {item.kind === 'video' && (
          <span className="absolute bottom-1.5 left-1.5 text-[11px] bg-black/70 text-white rounded px-1.5 py-0.5">
            Video{duration ? ` · ${duration}` : ''}
          </span>
        )}
        {item.clearedToPost && (
          <span className="absolute top-1.5 right-1.5 text-[11px] bg-emerald-600 text-white rounded px-1.5 py-0.5">
            OK to post
          </span>
        )}
      </a>
      <div className="p-2.5 flex-1 flex flex-col gap-1">
        <p className="text-sm text-navy-900 line-clamp-2">{item.note ?? item.filename}</p>
        <p className="text-xs text-slate-500">
          {item.uploadedByName} · {addedOn(item.createdAt)} · {formatBytes(item.sizeBytes)}
        </p>
        <details className="mt-auto text-xs">
          <summary className="cursor-pointer text-sky-700 hover:underline select-none">Details</summary>
          <div className="mt-2 space-y-2">
            {canEdit && (
              <form action={saveMediaAction} className="space-y-1.5">
                <input type="hidden" name="id" value={item.id} />
                <textarea
                  name="note"
                  defaultValue={item.note ?? ''}
                  maxLength={500}
                  rows={2}
                  aria-label="Who or what is in this"
                  placeholder="Who or what is in this?"
                  className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                />
                <label className="flex items-center gap-1.5 text-slate-700">
                  <input type="checkbox" name="cleared" defaultChecked={item.clearedToPost} /> OK to post publicly
                </label>
                <button type="submit" className="w-full bg-navy-900 text-white rounded-lg px-2 py-1.5 font-medium">
                  Save
                </button>
              </form>
            )}
            <a href={`${file}?download=1`} className="block text-center border border-slate-300 rounded-lg px-2 py-1.5 hover:bg-slate-50">
              Download the original
            </a>
            {canDelete && (
              <form action={deleteMediaAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={item.id} />
                <label className="flex items-center gap-1 text-slate-500">
                  <input type="checkbox" name="confirm" required /> sure
                </label>
                <button type="submit" className="flex-1 border border-red-200 text-red-600 rounded-lg px-2 py-1.5 hover:bg-red-50">
                  Delete
                </button>
              </form>
            )}
          </div>
        </details>
      </div>
    </li>
  );
}

export default async function MediaPage({ searchParams }: { searchParams: { show?: string | string[] } }) {
  const session = await getSessionFromCookies();
  const filter = parseFilter(searchParams.show);
  const [items, totals] = await Promise.all([listMedia(filter), mediaTotals()]);
  const ready = mediaStorage() !== null;
  const pills: { key: MediaFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Everything', count: totals.items },
    { key: 'photo', label: 'Photos', count: totals.photos },
    { key: 'video', label: 'Videos', count: totals.videos },
    { key: 'cleared', label: 'OK to post', count: totals.cleared },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Media</h1>
        <p className="text-sm text-slate-600 mt-1">
          One place for the school&apos;s photos and videos. Drop them here from your phone, say who is in them,
          and they are ready to use for posts.
        </p>
      </div>

      {!ready ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2" data-testid="media-not-ready">
          Media storage is not set up yet, so nothing can be added.
        </p>
      ) : session ? (
        <MediaUploader />
      ) : (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Sign in with your own login to add media.
        </p>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <nav className="flex flex-wrap gap-1.5 text-sm" aria-label="Show">
            {pills.map((p) => (
              <Link
                key={p.key}
                href={p.key === 'all' ? '/admin/media' : `/admin/media?show=${p.key}`}
                className={`px-3 py-1 rounded-full border ${
                  filter === p.key
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                data-testid={`media-pill-${p.key}`}
              >
                {p.label} <span className={filter === p.key ? 'text-navy-200' : 'text-slate-400'}>{p.count}</span>
              </Link>
            ))}
          </nav>
          <p className="text-xs text-slate-500" data-testid="media-totals">
            {totals.items} {totals.items === 1 ? 'file' : 'files'} · {formatBytes(totals.bytes)}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-xl p-6 text-center">
            {totals.items === 0 ? 'Nothing here yet. Add the first photo or video above.' : 'Nothing matches this filter.'}
          </p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="media-grid">
            {items.map((item) => (
              <Tile
                key={item.id}
                item={item}
                canEdit={Boolean(session)}
                canDelete={session?.role === 'admin' || (!!session && item.uploadedBy === session.uid)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
