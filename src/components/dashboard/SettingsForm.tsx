"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/actions/settings";

export function SettingsForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-navy">Nom</label>
        <input
          name="name"
          required
          defaultValue={name}
          className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-navy">Email</label>
        <input
          value={email}
          disabled
          className="w-full rounded-md border border-brand-border bg-brand-gray px-3 py-2 text-sm text-brand-navy/50"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-navy">Téléphone</label>
        <input
          name="phone"
          defaultValue={phone}
          placeholder="+221 77 000 00 00"
          className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </div>

      {state?.error && <p className="text-sm font-medium text-brand-red">{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-emerald-600">Profil mis à jour avec succès.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white hover:bg-brand-blue disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
