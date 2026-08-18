"use client";

import { useActionState, useState } from "react";
import type { CategoryFormState } from "@/actions/categories";
import { SingleImageUploader } from "./SingleImageUploader";

type ParentOption = { id: string; name: string };

type DefaultValues = {
  name?: string;
  slug?: string;
  description?: string;
  image?: string | null;
  parentId?: string | null;
  active?: boolean;
};

export function CategoryForm({
  action,
  parentOptions,
  defaultValues,
  submitLabel,
}: {
  action: (state: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;
  parentOptions: ParentOption[];
  defaultValues?: DefaultValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [image, setImage] = useState<string | null>(defaultValues?.image ?? null);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <div className="rounded-xl border border-db-border bg-db-card p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[13px] font-medium text-db-text">Nom *</label>
            <input
              name="name"
              required
              defaultValue={defaultValues?.name}
              className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-db-text">Slug</label>
            <input
              name="slug"
              placeholder="généré automatiquement si laissé vide"
              defaultValue={defaultValues?.slug}
              className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-db-text">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={defaultValues?.description}
              className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-db-text">Catégorie parente</label>
            <select
              name="parentId"
              defaultValue={defaultValues?.parentId ?? ""}
              className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
            >
              <option value="">Aucune (catégorie racine)</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-db-text">Image</label>
            <SingleImageUploader name="image" value={image} onChange={setImage} />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-db-text">
            <input type="checkbox" name="active" defaultChecked={defaultValues?.active ?? true} className="accent-accent" />
            Catégorie active
          </label>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg border border-db-danger/20 bg-db-danger-tint px-3.5 py-2.5 text-[13px] text-db-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-accent-deep disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
