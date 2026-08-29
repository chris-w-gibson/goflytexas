import type Anthropic from '@anthropic-ai/sdk';
import { desc, asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { botDocuments, type BotDocument } from '@/lib/db/schema';

/** Max extracted text stored per document (~50 KB). */
export const MAX_EXTRACTED_BYTES = 50 * 1024;
/** Max upload size accepted before extraction (PDFs compress text well). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const TEXT_MIME_TYPES = new Set(['text/plain', 'text/markdown']);
const TEXT_EXTENSIONS = ['.txt', '.md', '.markdown'];

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function isSupportedUpload(filename: string, mimeType: string): boolean {
  if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
    return true;
  }
  if (mimeType === DOCX_MIME || filename.toLowerCase().endsWith('.docx')) {
    return true;
  }
  if (TEXT_MIME_TYPES.has(mimeType)) return true;
  return TEXT_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));
}

/**
 * Extract plain text from an uploaded document buffer.
 * PDFs go through pdf-parse; .txt/.md pass through as UTF-8.
 * Throws with a user-facing message on unsupported/oversized/empty input.
 */
export async function extractText(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  if (!isSupportedUpload(filename, mimeType)) {
    throw new Error('Unsupported file type. Upload a PDF, Word (.docx), .txt, or .md file.');
  }
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error('File is too large (max 10 MB).');
  }

  let text: string;
  if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else if (
    mimeType === DOCX_MIME ||
    filename.toLowerCase().endsWith('.docx')
  ) {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    text = buffer.toString('utf-8');
  }

  text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  if (!text) {
    throw new Error(
      'No text could be extracted. If this is a scanned PDF, export it with selectable text and try again.',
    );
  }
  if (Buffer.byteLength(text, 'utf-8') > MAX_EXTRACTED_BYTES) {
    throw new Error(
      `Extracted text is too long (over ${Math.round(MAX_EXTRACTED_BYTES / 1024)} KB). Split the document into smaller files and upload them separately.`,
    );
  }
  return text;
}

export async function createBotDocument(input: {
  title: string;
  filename: string;
  mimeType: string;
  content: string;
  uploadedBy: string | null;
}): Promise<BotDocument> {
  const [doc] = await db.insert(botDocuments).values(input).returning();
  return doc;
}

export async function listBotDocuments(): Promise<BotDocument[]> {
  return db.select().from(botDocuments).orderBy(desc(botDocuments.createdAt));
}

export async function getBotDocument(id: string): Promise<BotDocument | undefined> {
  const [doc] = await db
    .select()
    .from(botDocuments)
    .where(eq(botDocuments.id, id))
    .limit(1);
  return doc;
}

export async function setBotDocumentActive(id: string, isActive: boolean): Promise<void> {
  await db.update(botDocuments).set({ isActive }).where(eq(botDocuments.id, id));
}

export async function deleteBotDocument(id: string): Promise<void> {
  await db.delete(botDocuments).where(eq(botDocuments.id, id));
}

/**
 * Active documents in deterministic (id) order for the chat system prompt.
 * Ordering must be stable across requests — a shuffled doc list silently
 * invalidates the Anthropic prompt cache.
 */
export async function getActiveKnowledge(): Promise<
  Array<Pick<BotDocument, 'id' | 'title' | 'content'>>
> {
  return db
    .select({
      id: botDocuments.id,
      title: botDocuments.title,
      content: botDocuments.content,
    })
    .from(botDocuments)
    .where(eq(botDocuments.isActive, true))
    .orderBy(asc(botDocuments.id));
}

export const NO_KNOWLEDGE_FALLBACK =
  'No reference documents have been uploaded yet. Say you cannot answer detailed questions right now and offer the contact options.';

/** Pure: the exact <document> wrapping both the chat and voice brains use. */
export function formatKnowledgeText(
  docs: Array<Pick<BotDocument, 'title' | 'content'>>,
): string {
  if (docs.length === 0) return NO_KNOWLEDGE_FALLBACK;
  return docs
    .map((doc) => `<document title="${doc.title}">\n${doc.content}\n</document>`)
    .join('\n\n');
}

const KNOWLEDGE_CACHE_MS = 60 * 1000;
let knowledgeCache: { at: number; block: Anthropic.TextBlockParam } | null = null;

/** Call after any bot_documents change so the next turn sees it immediately. */
export function invalidateKnowledgeCache(): void {
  knowledgeCache = null;
}

/**
 * The system block that carries the prompt-cache breakpoint. Identical content
 * for every request until a document changes — keep it byte-stable.
 * Cached in-process for 60 s: the voice agent calls this on every spoken turn
 * and the Postgres round trip was pure added latency.
 */
export async function buildKnowledgeBlock(): Promise<Anthropic.TextBlockParam> {
  const now = Date.now();
  if (knowledgeCache && now - knowledgeCache.at < KNOWLEDGE_CACHE_MS) return knowledgeCache.block;
  const docs = await getActiveKnowledge();
  const block: Anthropic.TextBlockParam = {
    type: 'text',
    text: `Reference documents:\n\n${formatKnowledgeText(docs)}`,
    cache_control: { type: 'ephemeral' },
  };
  knowledgeCache = { at: now, block };
  return block;
}
