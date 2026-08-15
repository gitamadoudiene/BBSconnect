"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold text-brand-navy">Créer un compte</h1>
        <p className="mb-6 text-sm text-brand-navy/60">
          Rejoignez BBSconnect pour suivre vos commandes.
        </p>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Nom complet</label>
            <input
              name="name"
              required
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Téléphone (optionnel)</label>
            <input
              type="tel"
              name="phone"
              placeholder="+221 77 000 00 00"
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          {state?.error && <p className="text-sm font-medium text-brand-red">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-brand-navy py-3 text-sm font-semibold text-white hover:bg-brand-blue disabled:opacity-60"
          >
            {pending ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-navy/60">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-brand-blue hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
