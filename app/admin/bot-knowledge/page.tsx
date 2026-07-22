import { listBotDocuments } from '@/lib/botKnowledge';
import { UploadForm } from './UploadForm';
import { deleteBotDocumentAction, toggleBotDocumentAction } from './actions';

export const dynamic = 'force-dynamic';

function formatBytes(text: string): string {
  const bytes = Buffer.byteLength(text, 'utf-8');
  return bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
}

export default async function BotKnowledgePage() {
  const docs = await listBotDocuments();
  const activeCount = docs.filter((d) => d.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bot Knowledge</h1>
        <p className="text-sm text-slate-600 mt-1">
          {activeCount} active document{activeCount === 1 ? '' : 's'} feeding the website
          chat assistant.
        </p>
      </div>

      <UploadForm />

      {docs.length === 0 ? (
        <p className="text-slate-500 text-sm">
          No documents yet. Upload the first one above — rates, discovery flight info,
          insurance requirements, club details.
        </p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {docs.map((doc) => (
            <div key={doc.id} className="p-4 flex flex-wrap items-start gap-3">
              <div className="flex-1 min-w-[220px]">
                <p className="font-medium text-navy-900">{doc.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {doc.filename} · {formatBytes(doc.content)} ·{' '}
                  {doc.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <details className="mt-2">
                  <summary className="text-xs text-sky-700 cursor-pointer select-none">
                    Preview extracted text
                  </summary>
                  <pre className="mt-2 text-xs text-slate-700 bg-slate-50 rounded-lg p-3 max-h-48 overflow-auto whitespace-pre-wrap">
                    {doc.content.slice(0, 2000)}
                    {doc.content.length > 2000 ? '\n…' : ''}
                  </pre>
                </details>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    doc.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {doc.isActive ? 'Active' : 'Inactive'}
                </span>
                <form action={toggleBotDocumentAction}>
                  <input type="hidden" name="id" value={doc.id} />
                  <input type="hidden" name="isActive" value={String(!doc.isActive)} />
                  <button
                    type="submit"
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1 hover:bg-slate-50"
                  >
                    {doc.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </form>
                <form action={deleteBotDocumentAction}>
                  <input type="hidden" name="id" value={doc.id} />
                  <button
                    type="submit"
                    className="text-xs border border-red-200 text-red-600 rounded-lg px-2 py-1 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
