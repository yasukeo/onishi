"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "onishi:pwa-dismissed";

/** Enregistre le service worker (prod) + propose l'installation de l'app. */
export function PwaSetup() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      if (localStorage.getItem(DISMISS_KEY)) return;
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-sm animate-fade-up rounded-[var(--radius-lg)] border border-sand-deep bg-cream/95 p-3 shadow-xl backdrop-blur-md sm:left-auto sm:right-4">
      <div className="flex items-center gap-3">
        <LogoMark size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Installer Onishi</p>
          <p className="text-xs text-ink-soft">Accès rapide depuis votre écran d&apos;accueil.</p>
        </div>
        <button
          onClick={install}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-terracotta px-3 text-sm font-medium text-cream hover:bg-terracotta-600"
        >
          <Download className="h-4 w-4" /> Installer
        </button>
        <button
          onClick={dismiss}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-sand"
          aria-label="Plus tard"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
