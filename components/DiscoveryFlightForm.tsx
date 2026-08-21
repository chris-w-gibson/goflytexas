'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { reportLead } from '@/lib/gtag';
import { CONTACT } from '@/lib/constants';
import { CheckCircle, Send } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  phone: string;
  preferredTime: string;
};

/** The API requires XXX-XXX-XXXX, so format as they type rather than reject them for it. */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function DiscoveryFlightForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          flightInterest: 'Discovery Flight',
          preferredContact: 'phone',
          message: data.preferredTime
            ? `Discovery flight request. Preferred day/time: ${data.preferredTime}`
            : 'Discovery flight request.',
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Submission failed (${res.status})`);
      }
      setIsSubmitted(true);
      reportLead();
      reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : `Something went wrong. Please call us at ${CONTACT.phoneDisplay}.`,
      );
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 text-center">
        <CheckCircle className="h-12 w-12 text-sky-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">You&apos;re on the list</h3>
        <p className="text-navy-100 mb-6">
          We&apos;ll call you shortly to lock in a day and time. If you&apos;d rather not
          wait, give us a ring.
        </p>
        <a
          href={CONTACT.phoneHref}
          className="inline-flex items-center justify-center px-6 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors"
        >
          Call {CONTACT.phoneDisplay}
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-navy-800 border border-navy-700 rounded-lg p-6 sm:p-8 space-y-5"
    >
      <div>
        <label htmlFor="df-name" className="block text-sm font-medium text-white mb-2">
          Name
        </label>
        <input
          id="df-name"
          type="text"
          autoComplete="name"
          {...register('name', { required: 'Name is required' })}
          className="w-full px-4 py-3 rounded-lg bg-navy-900 border border-navy-600 text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Your name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="df-email" className="block text-sm font-medium text-white mb-2">
          Email
        </label>
        <input
          id="df-email"
          type="email"
          autoComplete="email"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })}
          className="w-full px-4 py-3 rounded-lg bg-navy-900 border border-navy-600 text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="df-phone" className="block text-sm font-medium text-white mb-2">
          Phone
        </label>
        <input
          id="df-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          {...register('phone', {
            required: 'Phone is required',
            pattern: {
              value: /^\d{3}-\d{3}-\d{4}$/,
              message: 'Enter a 10-digit phone number',
            },
            onChange: (e) => setValue('phone', formatPhone(e.target.value)),
          })}
          className="w-full px-4 py-3 rounded-lg bg-navy-900 border border-navy-600 text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="940-905-3090"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="df-preferred"
          className="block text-sm font-medium text-white mb-2"
        >
          Best day or time <span className="text-navy-300 font-normal">(optional)</span>
        </label>
        <input
          id="df-preferred"
          type="text"
          {...register('preferredTime')}
          className="w-full px-4 py-3 rounded-lg bg-navy-900 border border-navy-600 text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Saturday mornings, weekday evenings…"
        />
      </div>

      {submitError && (
        <p className="text-sm text-red-400" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Sending…' : 'Request My Discovery Flight'}
        {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
      </button>

      <p className="text-xs text-navy-300 text-center">
        No payment now — we&apos;ll confirm the details by phone first.
      </p>
    </form>
  );
}
