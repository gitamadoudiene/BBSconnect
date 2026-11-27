"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { Check, Eye, EyeOff, X } from "lucide-react";
import {
  changeEmailAction,
  changePasswordAction,
  updateProfileAction,
  type FormState,
} from "@/actions/settings";

function Feedback({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={clsx(
        "rounded-[12px] px-3.5 py-2.5 text-[13.5px] font-medium",
        state.error ? "bg-db-danger-tint text-db-danger" : "bg-db-success-tint text-db-success"
      )}
    >
      {state.error ?? state.success}
    </p>
  );
}

function PasswordInput({
  id,
  name,
  label,
  autoComplete,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  onChange?: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          onChange={(e) => onChange?.(e.target.value)}
          className="field field-sm pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate hover:bg-paper hover:text-ink"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function SettingsForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">Nom affiché</label>
          <input id="name" name="name" required maxLength={80} defaultValue={name} autoComplete="name" className="field field-sm" />
        </div>
        <div>
          <label htmlFor="phone" className="field-label">Téléphone</label>
          <input
            id="phone"
            name="phone"
            defaultValue={phone}
            placeholder="+221 77 000 00 00"
            autoComplete="tel"
            className="field field-sm"
          />
        </div>
      </div>
      <div>
        <p className="field-label">Adresse de connexion</p>
        <p className="flex h-10 items-center rounded-[12px] bg-paper px-3.5 font-mono text-[12.5px] text-slate">{email}</p>
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
        {pending ? "Enregistrement…" : "Enregistrer le profil"}
      </button>
    </form>
  );
}

const rules = [
  { test: (v: string) => v.length >= 10, label: "10 caractères minimum" },
  { test: (v: string) => /[a-zA-Z]/.test(v), label: "Au moins une lettre" },
  { test: (v: string) => /[0-9]/.test(v), label: "Au moins un chiffre" },
  { test: (v: string) => /[^a-zA-Z0-9]/.test(v), label: "Un symbole (recommandé)", optional: true },
];

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const passed = rules.filter((r) => r.test(next)).length;
  const required = rules.filter((r) => !r.optional).every((r) => r.test(next));

  return (
    <form action={formAction} className="space-y-4" key={state?.success ? "done" : "form"}>
      <PasswordInput id="pw-current" name="current" label="Mot de passe actuel" autoComplete="current-password" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PasswordInput id="pw-next" name="next" label="Nouveau mot de passe" autoComplete="new-password" onChange={setNext} />
        <PasswordInput id="pw-confirm" name="confirm" label="Confirmer" autoComplete="new-password" onChange={setConfirm} />
      </div>

      <div>
        <div className="flex gap-1.5" aria-hidden>
          {rules.map((_, i) => (
            <span
              key={i}
              className={clsx(
                "h-1 flex-1 rounded-full transition-colors",
                i < passed ? (passed >= 4 ? "bg-db-success" : passed >= 3 ? "bg-accent" : "bg-signal") : "bg-paper"
              )}
            />
          ))}
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {rules.map((r) => {
            const ok = r.test(next);
            return (
              <li key={r.label} className={clsx("flex items-center gap-2 text-[12.5px]", ok ? "text-db-success" : "text-slate")}>
                {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                {r.label}
              </li>
            );
          })}
          {confirm && (
            <li className={clsx("flex items-center gap-2 text-[12.5px]", confirm === next ? "text-db-success" : "text-db-danger")}>
              {confirm === next ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {confirm === next ? "Les deux saisies correspondent" : "Les deux saisies diffèrent"}
            </li>
          )}
        </ul>
      </div>

      <Feedback state={state} />
      <button type="submit" disabled={pending || !required || next !== confirm} className="btn btn-primary btn-sm">
        {pending ? "Modification…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(changeEmailAction, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="field-label">Nouvelle adresse</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder={email}
            autoComplete="email"
            className="field field-sm"
          />
        </div>
        <PasswordInput id="email-current" name="current" label="Mot de passe actuel" autoComplete="current-password" />
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn btn-secondary btn-sm">
        {pending ? "Modification…" : "Changer l'adresse"}
      </button>
    </form>
  );
}
