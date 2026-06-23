"use client";

/** Demande la permission de notification (si pas déjà décidée). */
export function ensureNotifyPermission() {
  try {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  } catch {
    /* non supporté */
  }
}

export function notifyEnabled(): boolean {
  try {
    return "Notification" in window && Notification.permission === "granted";
  } catch {
    return false;
  }
}

/** Affiche une notification navigateur (si autorisée). */
export function notify(title: string, body: string) {
  try {
    if (notifyEnabled()) {
      new Notification(title, { body, icon: "/logo.webp", badge: "/logo.webp" });
    }
  } catch {
    /* ignore */
  }
}
