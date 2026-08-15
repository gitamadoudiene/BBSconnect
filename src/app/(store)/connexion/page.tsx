"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";

function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "";

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold text-brand-navy">Connexion</h1>
        <p className="mb-6 text-sm text-brand-navy/60">
          Connectez-vous à votre compte BBSconnect.
        </p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirect" value={redirect} />
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
            <label className="mb-1 block text-sm font-medium text-brand-navy">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          {state?.error && <p className="text-sm font-medium text-brand-red">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-brand-navy py-3 text-sm font-semibold text-white hover:bg-brand-blue disabled:opacity-60"
          >
            {pending ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-navy/60">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-brand-blue hover:underline">
            Créer un compte
          </Link>
        </p>

        <div className="mt-8 rounded-md border border-dashed border-brand-border bg-brand-gray p-4 text-xs text-brand-navy/60">
          <p className="mb-1 font-semibold text-brand-navy">Comptes de démonstration</p>
          <p>Commerçant : marchand@bbsconnect.sn / Commerce2026!</p>
          <p>Client : client@bbsconnect.sn / Client2026!</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
