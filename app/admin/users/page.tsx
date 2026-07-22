import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getSessionFromCookies } from '@/lib/auth';
import { InviteForm } from './InviteForm';
import { sendPasswordResetAction, toggleUserDisabledAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await getSessionFromCookies();
  const allUsers = await db.select().from(users).orderBy(asc(users.createdAt));

  if (session?.role !== 'admin') {
    return (
      <p className="text-slate-600 text-sm">
        Only admins can manage users. Ask an admin for access.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-slate-600 mt-1">
          Who can sign in to this admin console.
        </p>
      </div>

      <InviteForm />

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {allUsers.map((u) => {
          const isSelf = u.id === session.uid;
          return (
            <div key={u.id} className="p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[220px]">
                <p className="font-medium text-navy-900">
                  {u.name}
                  {isSelf && <span className="text-xs text-slate-400"> (you)</span>}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {u.email} · {u.role}
                  {u.mustChangePassword ? ' · temp password pending' : ''}
                  {u.lastLoginAt
                    ? ` · last login ${u.lastLoginAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}`
                    : ' · never logged in'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    u.disabled
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {u.disabled ? 'Disabled' : 'Active'}
                </span>
                {!u.disabled && (
                  <form action={sendPasswordResetAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <button
                      type="submit"
                      className="text-xs border border-slate-300 rounded-lg px-2 py-1 hover:bg-slate-50"
                    >
                      Send password reset
                    </button>
                  </form>
                )}
                {!isSelf && (
                  <form action={toggleUserDisabledAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="disable" value={String(!u.disabled)} />
                    <button
                      type="submit"
                      className={`text-xs border rounded-lg px-2 py-1 ${
                        u.disabled
                          ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          : 'border-red-200 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {u.disabled ? 'Re-enable' : 'Disable'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
