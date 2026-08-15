"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="container-page py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-brand-navy">Contactez-nous</h1>
        <p className="mt-2 text-brand-navy/60">Une question ? Notre équipe vous répond rapidement.</p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-brand-blue" />
            <div>
              <p className="font-semibold text-brand-navy">Adresse</p>
              <p className="text-sm text-brand-navy/60">Sacré-Cœur 3, Dakar, Sénégal</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 shrink-0 text-brand-blue" />
            <div>
              <p className="font-semibold text-brand-navy">Téléphone</p>
              <p className="text-sm text-brand-navy/60">+221 77 000 00 00</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 shrink-0 text-brand-blue" />
            <div>
              <p className="font-semibold text-brand-navy">Email</p>
              <p className="text-sm text-brand-navy/60">contact@bbsconnect.sn</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="space-y-4 rounded-lg border border-brand-border p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Nom</label>
              <input required className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Email</label>
              <input type="email" required className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Message</label>
            <textarea required rows={5} className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue" />
          </div>
          {sent && (
            <p className="text-sm font-medium text-emerald-600">
              Merci, votre message a bien été envoyé ! Nous vous répondrons rapidement.
            </p>
          )}
          <button
            type="submit"
            className="rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white hover:bg-brand-blue"
          >
            Envoyer le message
          </button>
        </form>
      </div>
    </div>
  );
}
