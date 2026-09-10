"use client";

import { FormEvent, useState } from "react";
import { Check, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

type PendingAccount = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
};

type AdminSubscriptionManagerProps = {
  pendingAccounts: PendingAccount[];
};

export default function AdminSubscriptionManager({
  pendingAccounts,
}: AdminSubscriptionManagerProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [activatingEmail, setActivatingEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function activate(emailToActivate: string) {
    const normalizedEmail = emailToActivate.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter the email shown in the Wish Money payment note.");
      return;
    }

    setActivatingEmail(normalizedEmail);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const result = (await response.json()) as {
        email?: string;
        error?: string;
        expiresAt?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Unable to activate this subscription.");
        return;
      }

      const expiration = result.expiresAt
        ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
            new Date(result.expiresAt)
          )
        : "the next month";
      setMessage(`${result.email ?? normalizedEmail} is active until ${expiration}.`);
      setEmail("");
      router.refresh();
    } catch {
      setError("Unable to activate this subscription. Please try again.");
    } finally {
      setActivatingEmail(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void activate(email);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 text-center">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            SouqFlow
          </span>
          <p className="mt-3 text-sm text-gray-500">Subscription administration</p>
        </header>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-blue-100/40 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <ShieldCheck size={14} aria-hidden="true" />
                Admin only
              </div>
              <h1 className="mt-4 text-2xl font-bold text-gray-900">Activate a Wish Money payment</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Confirm the $9.99 payment in Wish Money, then enter the SouqFlow email the customer wrote in the
                payment note. Activation gives the account one month of access.
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Mail size={22} aria-hidden="true" />
            </div>
          </div>

          <form onSubmit={submit} className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:flex sm:items-end sm:gap-3">
            <label className="block flex-1 text-sm font-semibold text-blue-950">
              Account email from the payment note
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="customer@example.com"
                autoComplete="email"
                className="mt-2 h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <button
              type="submit"
              disabled={activatingEmail !== null}
              className="mt-3 h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0 sm:w-auto"
            >
              {activatingEmail === email.trim().toLowerCase() ? "Activating..." : "Activate one month"}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
              {error}
            </p>
          )}
        </section>

        <section className="mt-7 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-blue-100/40 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Accounts awaiting activation</h2>
              <p className="mt-1 text-sm text-gray-500">
                Match these addresses with the Wish Money payment note before activating them.
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
              {pendingAccounts.length}
            </span>
          </div>

          {pendingAccounts.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
              <Check className="mx-auto text-emerald-600" size={25} aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-gray-700">No accounts are waiting for activation.</p>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100">
              {pendingAccounts.map((account) => (
                <li key={account.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{account.name || "Unnamed account"}</p>
                    <p className="mt-1 truncate font-mono text-sm text-blue-700">{account.email}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Registered {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(account.createdAt))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void activate(account.email)}
                    disabled={activatingEmail !== null}
                    className="shrink-0 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {activatingEmail === account.email ? "Activating..." : "Activate one month"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
