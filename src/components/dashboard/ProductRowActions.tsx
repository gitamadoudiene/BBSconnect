"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, Copy, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { archiveProductAction, deleteProductAction, duplicateProductAction } from "@/actions/products";
import { ConfirmButton } from "./ConfirmButton";

export function ProductRowActions({ id, slug, archived }: { id: string; slug: string; archived: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Actions"
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate transition hover:bg-paper hover:text-ink"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-52 rounded-[16px] border border-line bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(18,19,21,0.35)]">
            <Link
              href={`/dashboard/produits/${id}`}
              className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-[13px] text-ink hover:bg-paper"
              onClick={() => setOpen(false)}
            >
              <Pencil className="h-3.5 w-3.5" /> Modifier
            </Link>
            <Link
              href={`/boutique/${slug}`}
              target="_blank"
              className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-[13px] text-ink hover:bg-paper"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="h-3.5 w-3.5" /> Voir sur la boutique
            </Link>
            <form action={duplicateProductAction.bind(null, id)}>
              <button className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-[13px] text-ink hover:bg-paper">
                <Copy className="h-3.5 w-3.5" /> Dupliquer
              </button>
            </form>
            {!archived && (
              <form action={archiveProductAction.bind(null, id)}>
                <button className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-[13px] text-ink hover:bg-paper">
                  <Archive className="h-3.5 w-3.5" /> Archiver
                </button>
              </form>
            )}
            <div className="my-1 border-t border-db-border" />
            <ConfirmButton
              action={deleteProductAction.bind(null, id)}
              title="Supprimer ce produit ?"
              description="Cette action est irréversible. Le produit et toutes ses variantes seront définitivement supprimés."
              trigger={
                <button className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-[13px] text-db-danger hover:bg-db-danger-tint">
                  <Trash2 className="h-3.5 w-3.5" /> Supprimer
                </button>
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
