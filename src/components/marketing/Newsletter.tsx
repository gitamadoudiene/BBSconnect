"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="section-space-sm border-b border-line bg-paper">
      <div className="container-page flex flex-col items-center text-center">
        <p className="text-eyebrow text-slate">Restez informé</p>
        <h2 className="text-h2 mt-3 max-w-lg text-ink">
          Les nouveautés et offres BBS Connect, directement dans votre boîte mail.
        </h2>

        {submitted ? (
          <p className="mt-8 text-sm font-medium text-ink">
            Merci ! Vous recevrez bientôt nos prochaines actualités.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="glass mt-8 flex w-full max-w-md items-center gap-2 rounded-full p-1.5 pl-5"
          >
            <input
              type="email"
              required
              placeholder="Votre adresse email"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-slate"
            />
            <button type="submit" className="btn btn-primary shrink-0 !px-5 !py-2.5">
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
