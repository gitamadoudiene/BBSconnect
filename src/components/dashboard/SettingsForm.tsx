"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/actions/settings";

export function SettingsForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1 block text-[13px] font-medium text-db-text">Nom</label>
        <input
          name="name"
          required
          defaultValue={name}
          className="w-full rounded-lg border border-db-border px-3 py-2 text-[13px] text-db-text outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-[13px] font-medium text-db-text">Email</label>
        <input
          value={email}
          disabled
          className="w-full rounded-lg border border-db-border bg-db-bg px-3 py-2 text-[13px] text-db-muted"
        />
      </div>
      <div>
        <label className="mb-1 block text-[13px] font-medium text-db-text">Téléphone</label>
        <input
          name="phone"
          defaultValue={phone}
          placeholder="+221 77 000 00 00"
          className="w-full rounded-lg border border-db-border px-3 py-2 text-[13px] text-db-text outline-none focus:border-accent"
        />
      </div>

      {state?.error && <p className="text-[13px] font-medium text-db-danger">{state.error}</p>}
      {state?.success && <p className="text-[13px] font-medium text-db-success">Profil mis à jour avec succès.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-6 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-deep disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
