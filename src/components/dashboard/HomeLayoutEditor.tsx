"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";
import { saveAnnouncementAction, saveHomeLayoutAction, type HomeFormState } from "@/actions/homepage";

type Section = { id: string; label: string; hint: string; visible: boolean };

function Feedback({ state }: { state: HomeFormState }) {
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

export function HomeLayoutEditor({ initial, defaults }: { initial: Section[]; defaults: Section[] }) {
  const [sections, setSections] = useState(initial);
  const [state, formAction, pending] = useActionState(saveHomeLayoutAction, undefined);

  const move = (i: number, d: -1 | 1) =>
    setSections((list) => {
      const j = i + d;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  return (
    <form action={formAction}>
      <input type="hidden" name="sections" value={JSON.stringify(sections.map(({ id, visible }) => ({ id, visible })))} />
      <ol className="divide-y divide-line">
        {sections.map((s, i) => (
          <li key={s.id} className={clsx("flex items-center gap-4 py-3.5", !s.visible && "opacity-50")}>
            <span className="w-6 font-mono text-[12px] text-slate">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold tracking-[-0.01em] text-ink">{s.label}</span>
              <span className="block truncate text-[12.5px] text-slate">{s.hint}</span>
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Monter ${s.label}`} className="flex h-8 w-8 items-center justify-center rounded-full text-slate hover:bg-paper disabled:opacity-30">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1} aria-label={`Descendre ${s.label}`} className="flex h-8 w-8 items-center justify-center rounded-full text-slate hover:bg-paper disabled:opacity-30">
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={s.visible}
              aria-label={`Afficher ${s.label}`}
              onClick={() => setSections((list) => list.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)))}
              className={clsx("relative h-6 w-11 shrink-0 rounded-full transition-colors", s.visible ? "bg-ink" : "bg-line-strong")}
            >
              <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", s.visible ? "translate-x-[22px]" : "translate-x-0.5")} />
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
          {pending ? "Enregistrement…" : "Enregistrer la page d'accueil"}
        </button>
        <button type="button" onClick={() => setSections(defaults)} className="btn btn-secondary btn-sm">
          <RotateCcw className="h-4 w-4" /> Ordre d&apos;origine
        </button>
        <div className="w-full sm:w-auto sm:flex-1">
          <Feedback state={state} />
        </div>
      </div>
    </form>
  );
}

export function AnnouncementForm({ text }: { text: string }) {
  const [state, formAction, pending] = useActionState(saveAnnouncementAction, undefined);
  const [value, setValue] = useState(text);
  return (
    <form action={formAction} className="space-y-3">
      <div className="rounded-[14px] bg-paper px-4 py-2.5 font-mono text-[11.5px] text-slate">{value || "(bandeau vide)"}</div>
      <input
        name="text"
        value={value}
        maxLength={140}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Message du bandeau"
        className="field field-sm"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] text-slate">{value.length}/140</span>
        <button type="submit" disabled={pending} className="btn btn-secondary btn-sm">
          {pending ? "…" : "Enregistrer"}
        </button>
      </div>
      <Feedback state={state} />
    </form>
  );
}
