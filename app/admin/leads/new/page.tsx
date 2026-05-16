import { createManualLeadAction } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export default function NewLeadPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Add lead manually</h1>
      <p className="text-slate-600 mb-6 text-sm">
        Use this when someone calls in or walks up. They&rsquo;ll be added to the weekly follow-up cadence
        like any web lead (unless you mark them <em>contacted</em> or <em>converted</em>).
      </p>

      <form action={createManualLeadAction} className="space-y-4 bg-white rounded-lg border border-slate-200 p-6">
        <Field label="Full name *" name="name" required />
        <Field label="Email *" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" />

        <div>
          <label htmlFor="flightInterest" className="block text-sm font-medium mb-1">Interested in</label>
          <select id="flightInterest" name="flightInterest" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Select…</option>
            <option value="private">Private Pilot License</option>
            <option value="instrument">Instrument Rating</option>
            <option value="commercial">Commercial License</option>
            <option value="rental">Aircraft Rental</option>
            <option value="tour">Aerial Tour</option>
            <option value="ferry">Ferry Flight</option>
            <option value="insurance">Insurance Checkout</option>
            <option value="biennial">Biannual Review (BFR)</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preferred contact</label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="preferredContact" value="phone" defaultChecked />
              Phone
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="preferredContact" value="email" />
              Email
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="What they asked about, when they called, etc."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="bg-navy-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-navy-800"
        >
          Add lead
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
