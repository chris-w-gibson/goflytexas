import { randomUUID } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSessionFromCookies } from '@/lib/auth';
import { sendSuggestionNotice } from '@/lib/email';
import { mediaStorage, putStored } from '@/lib/media/storage';
import { checkBody, checkPicture, parseKind, pictureKey } from '@/lib/suggestions/rules';
import { addSuggestion } from '@/lib/suggestions/store';

/**
 * A suggestion or bug report, with one optional picture. A route and not a
 * server action because a server action stops at 1 MB and a phone photo is
 * several. The picture is stored first; the row is written only once it is in.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Sign in to send a suggestion.' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'That did not come through. Try it again.' }, { status: 400 });
  const kind = parseKind(form.get('kind'));
  if (!kind) return NextResponse.json({ error: 'Choose Suggestion or Bug.' }, { status: 400 });
  const text = checkBody(form.get('body'));
  if (!text.ok) return NextResponse.json({ error: text.error }, { status: 400 });

  const id = randomUUID();
  let key: string | null = null;
  let type: string | null = null;
  const file = form.get('picture');
  if (file instanceof File && file.size > 0) {
    const check = checkPicture({ name: file.name, type: file.type, size: file.size });
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
    const storage = mediaStorage();
    if (!storage) {
      return NextResponse.json({ error: 'Pictures cannot be stored yet. Send it without the picture.' }, { status: 503 });
    }
    key = pictureKey(id, check.ext, new Date());
    type = check.mime;
    try {
      await putStored(storage, key, Buffer.from(await file.arrayBuffer()), check.mime);
    } catch (err) {
      console.error('suggestions: picture not stored', err);
      return NextResponse.json({ error: 'The picture did not upload. Try it again, or send it without.' }, { status: 502 });
    }
  }

  await addSuggestion({
    id,
    kind,
    body: text.body,
    pictureKey: key,
    pictureType: type,
    authorId: session.uid,
    authorName: session.name || session.email,
  });
  // The report is saved; a notice that fails must not tell the person it was lost.
  await sendSuggestionNotice({
    kind,
    body: text.body,
    authorName: session.name || session.email,
    hasPicture: key !== null,
  }).catch((err) => console.error('suggestions: notice not sent', err));

  revalidatePath('/admin/suggestions');
  return NextResponse.json({ ok: true });
}
