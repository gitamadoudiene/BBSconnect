"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

const channels = [
  { label: "WhatsApp", value: "78 837 99 19", href: "https://wa.me/221788379919", note: "Le plus rapide" },
  { label: "Téléphone", value: "78 837 99 19", href: "tel:+221788379919" },
  { label: "Téléphone", value: "75 459 68 30", href: "tel:+221754596830" },
  { label: "Email", value: "ballabusinessservice@gmail.com", href: "mailto:ballabusinessservice@gmail.com" },
  { label: "Adresse", value: "Sacré-Cœur 3, Dakar, Sénégal" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div>
      <section className="border-b border-line">
        <div className="container-page py-12 lg:py-20">
          <p className="text-eyebrow text-slate">Contact</p>
          <h1 className="text-h1 mt-6 max-w-[16ch] text-ink">Une question sur un modèle ? On vous répond.</h1>
        </div>
      </section>

      <div className="container-page grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-16">
        <ul className="border-t border-ink">
          {channels.map((c) => {
            const content = (
              <>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate">{c.label}</span>
                <span className="flex items-center justify-between gap-4">
                  <span className="tabular break-all text-[19px] font-semibold tracking-[-0.02em] text-ink">{c.value}</span>
                  {c.href && <ArrowUpRight className="h-4 w-4 shrink-0 text-ink" />}
                </span>
                {c.note && <span className="font-mono text-[11px] text-accent">{c.note}</span>}
              </>
            );
            return (
              <li key={c.value} className="border-b border-line">
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex flex-col gap-1 py-4 transition-colors hover:text-accent"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex flex-col gap-1 py-4">{content}</div>
                )}
              </li>
            );
          })}
        </ul>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="card space-y-5 p-6 lg:p-8"
        >
          <h2 className="text-h3 text-ink">Écrivez-nous</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="c-name" className="field-label">Nom</label>
              <input id="c-name" required autoComplete="name" className="field" />
            </div>
            <div>
              <label htmlFor="c-email" className="field-label">Email</label>
              <input id="c-email" type="email" required autoComplete="email" className="field" />
            </div>
          </div>
          <div>
            <label htmlFor="c-msg" className="field-label">Message</label>
            <textarea id="c-msg" required rows={6} className="field" placeholder="Modèle, budget, question…" />
          </div>
          {sent && (
            <p role="status" className="text-[14px] font-medium text-success">
              Merci, votre message a bien été envoyé. Nous vous répondons rapidement.
            </p>
          )}
          <button type="submit" className="btn btn-primary">
            Envoyer le message
          </button>
        </form>
      </div>
    </div>
  );
}
