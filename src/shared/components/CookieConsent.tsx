import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "./Button";
import Checkbox from "./Checkbox";

type CookiePrefs = {
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "uprise-cookie-preferences";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({ analytics: true, marketing: false });

  useEffect(() => {
    setOpen(!localStorage.getItem(STORAGE_KEY));
    const handler = () => setOpen(true);
    window.addEventListener("uprise:cookie-settings", handler);
    return () => window.removeEventListener("uprise:cookie-settings", handler);
  }, []);

  const save = (next: CookiePrefs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, ...next, savedAt: new Date().toISOString() }));
    setPrefs(next);
    setOpen(false);
    setCustomize(false);
  };

  if (!open) {
    return (
      <button
        className="focus-ring fixed bottom-5 left-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border bg-surface text-gold shadow-gold"
        type="button"
        aria-label="Cookie settings"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-sm border border-gold/30 bg-surface/95 p-5 shadow-gold backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p id="cookie-title" className="font-display text-2xl font-semibold text-ink">
            Cookie Preferences
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Essential cookies keep the experience secure. Analytics and marketing cookies are optional and can be
            changed anytime.
          </p>
        </div>
        <button
          className="focus-ring text-muted hover:text-ink"
          type="button"
          aria-label="Close cookie consent banner"
          onClick={() => setOpen(false)}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {customize && (
        <div className="mt-5 grid gap-3">
          <div className="flex items-center justify-between rounded-sm border border-border p-3 text-sm bg-black/25">
            <span className="text-ink">Essential</span>
            <Checkbox checked disabled label="" aria-label="Essential cookies, always enabled" />
          </div>
          <div className="flex items-center justify-between rounded-sm border border-border p-3 text-sm bg-black/25">
            <span className="text-ink">Analytics</span>
            <Checkbox
              checked={prefs.analytics}
              label=""
              aria-label="Analytics cookies toggle"
              onChange={(event) => setPrefs({ ...prefs, analytics: event.target.checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-sm border border-border p-3 text-sm bg-black/25">
            <span className="text-ink">Marketing</span>
            <Checkbox
              checked={prefs.marketing}
              label=""
              aria-label="Marketing cookies toggle"
              onChange={(event) => setPrefs({ ...prefs, marketing: event.target.checked })}
            />
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" onClick={() => save({ analytics: true, marketing: true })}>
          Accept All
        </Button>
        <Button variant="secondary" type="button" onClick={() => save({ analytics: false, marketing: false })}>
          Reject Non-Essential
        </Button>
        {customize ? (
          <Button variant="outline" type="button" onClick={() => save(prefs)}>
            Save Preferences
          </Button>
        ) : (
          <Button variant="outline" type="button" onClick={() => setCustomize(true)}>
            Customize
          </Button>
        )}
      </div>
    </div>
  );
}
