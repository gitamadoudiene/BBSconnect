"use client";

import { useState } from "react";

export function ConfirmButton({
  action,
  title,
  description,
  confirmLabel = "Supprimer",
  trigger,
}: {
  action: () => Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[15px] font-semibold text-db-text">{title}</h3>
            <p className="mt-1.5 text-[13px] text-db-muted">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-db-border px-3.5 py-2 text-[13px] font-medium text-db-text transition hover:bg-db-bg"
              >
                Annuler
              </button>
              <form action={action}>
                <button className="rounded-lg bg-db-danger px-3.5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">
                  {confirmLabel}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
