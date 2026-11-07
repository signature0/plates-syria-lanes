# Lane A (Pi @ Pop!_OS) — build notes

- **CARD-1** DONE — foundation: css/tokens.css (Lane A tokens from brief), css/app.css, js/i18n.js (full AR/EN), js/data.js, js/components.js (plate SVG + car mockup SVG + toasts + pattern/valuation logic), js/app.js (state, toggles, ticker), index.html landing.
  Verified with external jsdom checker (node check.js index.html landing): PASS — no console/page errors, default RTL+ar, EN toggle flips dir+all strings, numerals toggle swaps ١٢٣⇄123 everywhere, 4 upcoming cards, 14 governorate chips, RFI contact email in footer, stats count-up.
  Note: repo had no docs/ or handoffs/; tokens derived from CARD.md Lane A brief into css/tokens.css. assets/img/ empty → CSS fallback hero per spec.
