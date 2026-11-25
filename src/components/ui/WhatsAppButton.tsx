import { MessageCircle } from "lucide-react";

/** Persistent WhatsApp entry point — most orders in Dakar start with a chat. */
export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/221788379919"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter avec un conseiller sur WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-[#1f9d55] pl-3.5 pr-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#188046] sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-5 w-5" strokeWidth={2} />
      <span className="hidden sm:inline">Un conseiller</span>
    </a>
  );
}
