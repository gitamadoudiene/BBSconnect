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
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[22px] bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[18px] font-bold tracking-[-0.03em] text-ink">{title}</h3>
            <p className="mt-1.5 text-[13px] text-db-muted">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Annuler
              </button>
              <form action={action}>
                <button className="btn btn-sm bg-db-danger text-white hover:opacity-90">
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
