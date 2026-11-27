"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-h2 mb-2 text-ink">Créer un compte</h1>
        <p className="mb-8 text-[15px] text-slate">
          Rejoignez BBSconnect pour suivre vos commandes.
        </p>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="field-label">Nom complet</label>
            <input
              name="name"
              required
              className="field"
            />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              name="email"
              required
              className="field"
            />
          </div>
          <div>
            <label className="field-label">Téléphone (optionnel)</label>
            <input
              type="tel"
              name="phone"
              placeholder="+221 77 000 00 00"
              className="field"
            />
          </div>
          <div>
            <label className="field-label">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="field"
            />
          </div>

          {state?.error && <p className="text-sm font-medium text-signal-deep">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary w-full"
          >
            {pending ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-slate">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-accent link-underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
