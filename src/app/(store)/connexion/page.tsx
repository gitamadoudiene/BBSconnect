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
        <h1 className="text-h2 mb-2 text-ink">Connexion</h1>
        <p className="mb-8 text-[15px] text-slate">
          Suivez vos commandes et retrouvez vos favoris.
        </p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirect" value={redirect} />
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
            <label className="field-label">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              className="field"
            />
          </div>

          {state?.error && <p className="text-sm font-medium text-signal-deep">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary w-full"
          >
            {pending ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-slate">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-accent link-underline">
            Créer un compte
          </Link>
        </p>
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
