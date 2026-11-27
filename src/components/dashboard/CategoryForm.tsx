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
  brand?: string | null;
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
      <div className="db-card p-6">
        <div className="space-y-4">
          <div>
            <label className="field-label">Nom *</label>
            <input
              name="name"
              required
              defaultValue={defaultValues?.name}
              className="field field-sm"
            />
          </div>
          <div>
            <label className="field-label">Slug</label>
            <input
              name="slug"
              placeholder="généré automatiquement si laissé vide"
              defaultValue={defaultValues?.slug}
              className="field field-sm"
            />
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={defaultValues?.description}
              className="field field-sm"
            />
          </div>
          <div>
            <label className="field-label">Catégorie parente</label>
            <select
              name="parentId"
              defaultValue={defaultValues?.parentId ?? ""}
              className="field field-sm"
            >
              <option value="">Aucune (catégorie racine)</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="brand" className="field-label">Marque (gammes de téléphones)</label>
            <input
              id="brand"
              name="brand"
              list="category-brands"
              defaultValue={defaultValues?.brand ?? ""}
              placeholder="Samsung, Tecno, Huawei…"
              className="field field-sm"
            />
            <datalist id="category-brands">
              {["Apple", "Samsung", "Tecno", "Huawei", "Google", "Xiaomi", "Infinix"].map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
            <p className="mt-1.5 text-[12px] text-slate">
              Range la gamme dans la bonne colonne du menu (iPhone ou Android). Laissez vide pour les accessoires.
            </p>
          </div>
          <div>
            <label className="field-label">Image</label>
            <SingleImageUploader name="image" value={image} onChange={setImage} />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-db-text">
            <input type="checkbox" name="active" defaultChecked={defaultValues?.active ?? true} className="accent-accent" />
            Catégorie active
          </label>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-[14px] bg-db-danger-tint px-4 py-3 text-[13.5px] font-medium text-db-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
