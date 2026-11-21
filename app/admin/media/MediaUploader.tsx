'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ACCEPT, checkUpload, formatBytes, type MediaKind } from '@/lib/media/rules';

type Job = {
  id: number;
  name: string;
  size: number;
  progress: number;
  state: 'waiting' | 'sending' | 'done' | 'failed';
  error?: string;
};

type Preview = { blob: Blob; width: number; height: number; durationSec: number | null };

const THUMB_EDGE = 640;

function toJpeg(source: CanvasImageSource, w: number, h: number): Promise<Blob | null> {
  const scale = Math.min(1, THUMB_EDGE / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
}

async function photoPreview(file: File): Promise<Preview | null> {
  const bitmap = await createImageBitmap(file);
  try {
    const blob = await toJpeg(bitmap, bitmap.width, bitmap.height);
    return blob ? { blob, width: bitmap.width, height: bitmap.height, durationSec: null } : null;
  } finally {
    bitmap.close();
  }
}

function videoPreview(file: File): Promise<Preview | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    const finish = (p: Preview | null) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(p);
    };
    const timer = setTimeout(() => finish(null), 10_000);
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.onerror = () => finish(null);
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, (video.duration || 0) / 2);
    };
    video.onseeked = async () => {
      const blob = await toJpeg(video, video.videoWidth, video.videoHeight).catch(() => null);
      finish(
        blob
          ? {
              blob,
              width: video.videoWidth,
              height: video.videoHeight,
              durationSec: Number.isFinite(video.duration) ? video.duration : null,
            }
          : null,
      );
    };
    video.src = url;
  });
}

/** A small JPEG for the grid, made on the device. Null when the browser cannot read the file (HEIC on a desktop). */
async function preview(file: File, kind: MediaKind): Promise<Preview | null> {
  try {
    return kind === 'photo' ? await photoPreview(file) : await videoPreview(file);
  } catch {
    return null;
  }
}

function put(url: string, body: Blob, type: string, onProgress?: (fraction: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`storage answered ${xhr.status}`));
    xhr.onerror = () => reject(new Error('the connection dropped'));
    xhr.send(body);
  });
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `the server answered ${res.status}`);
  return data;
}

type Signed = {
  id: string;
  key: string;
  mime: string;
  uploadUrl: string;
  thumbKey: string | null;
  thumbUploadUrl: string | null;
};

export function MediaUploader() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const counter = useRef(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [note, setNote] = useState('');
  const [cleared, setCleared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  const patch = useCallback((id: number, p: Partial<Job>) => {
    setJobs((all) => all.map((j) => (j.id === id ? { ...j, ...p } : j)));
  }, []);

  const send = useCallback(
    async (files: File[]) => {
      if (files.length === 0 || busy) return;
      setBusy(true);
      const batch = files.map((file) => ({ file, id: ++counter.current }));
      setJobs((all) => [
        ...batch.map(({ file, id }) => ({ id, name: file.name, size: file.size, progress: 0, state: 'waiting' as const })),
        ...all.filter((j) => j.state === 'failed'),
      ]);
      let added = 0;
      for (const { file, id } of batch) {
        const check = checkUpload(file);
        if (!check.ok) {
          patch(id, { state: 'failed', error: check.error });
          continue;
        }
        try {
          patch(id, { state: 'sending' });
          const thumb = await preview(file, check.kind);
          const signed = await postJson<Signed>('/admin/media/sign', {
            name: file.name,
            type: check.mime,
            size: file.size,
            thumb: Boolean(thumb),
          });
          await put(signed.uploadUrl, file, signed.mime, (f) => patch(id, { progress: f }));
          if (thumb && signed.thumbUploadUrl) {
            await put(signed.thumbUploadUrl, thumb.blob, 'image/jpeg').catch(() => undefined);
          }
          await postJson('/admin/media/items', {
            id: signed.id,
            key: signed.key,
            thumbKey: signed.thumbKey,
            name: file.name,
            type: check.mime,
            width: thumb?.width ?? null,
            height: thumb?.height ?? null,
            durationSec: thumb?.durationSec ?? null,
            note,
            cleared,
          });
          patch(id, { state: 'done', progress: 1 });
          added += 1;
        } catch (err) {
          patch(id, {
            state: 'failed',
            error: `${file.name}: not added, ${err instanceof Error ? err.message : 'something went wrong'}.`,
          });
        }
      }
      setBusy(false);
      if (input.current) input.current.value = '';
      if (added > 0) {
        setNote('');
        setCleared(false);
        router.refresh();
      }
    },
    [busy, cleared, note, patch, router],
  );

  const done = jobs.filter((j) => j.state === 'done').length;

  return (
    <section
      className={`bg-white border-2 border-dashed rounded-xl p-4 space-y-3 ${over ? 'border-sky-500 bg-sky-50' : 'border-slate-300'}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void send(Array.from(e.dataTransfer.files));
      }}
      data-testid="media-uploader"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="text-xs text-slate-600">
          Who or what is in these? (optional)
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder="Sam's first solo in the 172, with his instructor"
            className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
            data-testid="media-note"
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 disabled:opacity-50"
        >
          {busy ? 'Adding…' : 'Add photos or videos'}
        </button>
      </div>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={cleared}
          onChange={(e) => setCleared(e.target.checked)}
          className="mt-0.5"
          data-testid="media-cleared"
        />
        <span>
          OK to post publicly. Everyone shown has agreed, and a parent has for anyone under 18.
        </span>
      </label>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => void send(Array.from(e.target.files ?? []))}
        data-testid="media-input"
      />
      <p className="text-xs text-slate-500">
        Pick from your phone or drag files here. Photos up to 30 MB, videos up to 750 MB.
      </p>

      {jobs.length > 0 && (
        <ul className="space-y-1.5" data-testid="media-jobs">
          {jobs.map((j) => (
            <li key={j.id} className="text-sm">
              {j.state === 'failed' ? (
                <p className="text-red-600">{j.error}</p>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="truncate flex-1 text-slate-700">
                    {j.name} <span className="text-slate-400">· {formatBytes(j.size)}</span>
                  </span>
                  <span className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden" aria-hidden>
                    <span
                      className={`block h-full ${j.state === 'done' ? 'bg-emerald-500' : 'bg-sky-500'}`}
                      style={{ width: `${Math.round(j.progress * 100)}%` }}
                    />
                  </span>
                  <span className="w-16 text-right text-xs text-slate-500">
                    {j.state === 'done' ? 'Added' : j.state === 'waiting' ? 'Waiting' : `${Math.round(j.progress * 100)}%`}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {!busy && done > 0 && (
        <p className="text-sm text-emerald-700" data-testid="media-added">
          {done === 1 ? '1 file added to the library.' : `${done} files added to the library.`}
        </p>
      )}
    </section>
  );
}
