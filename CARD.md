# TASK CARD (run ALL 4 cards in order)

## Task cards (each ≈5k tokens — well under 40k cap)
- **CARD-1 Foundation**: skeleton, design tokens from YOUR design brief, header/footer, numeral+language toggles, plate SVG component, car mockup SVG, landing page. Done = landing renders RTL+EN, both toggles work.
- **CARD-2 Auctions**: list + detail + live-bidding mock (increments, extension logic, proxy, watchlist), ≥18 sample plates across ≥6 governorates. Done = full bid flow works on one auction.
- **CARD-3 Governorate + Marketplace**: governorate hub pages + search; marketplace with 3 listing modes + offer form + pattern filters. Done = filter/search/list functional.
- **CARD-4 Tools + extras**: birthdate finder, valuation, family packages, gift certificate, results page, KYC/deposit mock. Done = all six present and interactive.



# DESIGN BRIEF — YOUR LANE ONLY (B)

### Lane B — "Modernized" (OpenCode @ Kenpachi)
Same brand palette refined: desaturated greens, deeper ink neutrals, gold as sparing micro-accent; gradient-mesh hero band; layered soft shadows + subtle glass cards; 12–16px radii; refined type scale with weight contrast; scroll-reveal micro-animations (respect prefers-reduced-motion). Modern fintech-gov energy.

# SHARED CONTEXT

# 02 — Spec · Syria Premium Plate E-Auction (prototype scope)

**Writer:** Hermes/Yukio (from brief + research), PO approves before lanes start.
**Readers:** all three builder lanes, QA. Lanes must not edit this file — questions go in their own notes file.
**Date:** 2026-11-07 · **Status:** PO-approved (research gate passed; three-lane build ordered).
Lanes: A = Pi @ Pop!_OS ("Official") · B = OpenCode @ Kenpachi ("Modernized") · C = OpenCode @ Node 2 ("Award-winning"). Same cards all lanes; ONLY the design brief differs.

## Product (all lanes, identical scope)
Arabic-first PWA prototype for Syria's premium-plate e-auction: RTL by default (`dir="rtl" lang="ar"`), English secondary toggle, Arabic-Indic ↔ Western numerals toggle (١٢٣ ⇄ 123). Mock data only — no backend. Great on PC (priority) and mobile.

### Pages / features
1. **Landing** — bold banner (use shared ComfyUI asset), strong intro, "كيف تشارك" 3-step guide, upcoming-auctions strip, live stats bar, footer with RFI contacts (vip.plates@mot.gov.sy).
2. **Auction list & detail** — plate cards (governorate + number + reserve state + time left); detail = big SVG plate render, car mockup (generic premium sedan front view, no brand logos), current-bid ladder, increment table, rules panel incl. anti-sniping explanation.
3. **Live bidding (mock)** — bid button with validation (≥ next increment, deposit badge), countdown that EXTENDS +60 s on a bid in the last 2 minutes with visible toast "تم تمديد المزاد", proxy-bid setting, watchlist toggle.
4. **Governorate search** [NEW PO] — filter by governorate (14: دمشق، ريف دمشق، حلب، حمص، حماة، إدلب، اللاذقية، طرطوس، درعا، القنيطرة، السويداء، دير الزور، الحسكة، الرقة); dedicated per-governorate page listing only that governorate's plates.
5. **Marketplace** [NEW PO] — owners list a plate with one of three modes: سعر ثابت (fixed) / مزاد (auction w/ end date + increments) / مفتوح للتفاوض (open to offers → offer form). xplate.com-style pattern-class search adapted to Syria: patterns xxxxx/xxxx/xxx/xx/x, repeats (aabb), palindromes (xyx), sequences (123) + governorate categories; ask prices in SYP respecting the numerals toggle.
6. **Tools** — birthdate finder (date → nearest available number + mock price); valuation tool (pattern scoring: repeats, sequences, palindromes, lucky 7, digit count → tier + suggested range).
7. **Family packages** — consecutive/matching-series bundles page.
8. **Gift certificate preview** — calligraphy-style certificate with plate SVG + recipient name input.
9. **Results page (public)** — past auctions, hammer prices, mock ministry transparency cockpit (revenue, lots sold).
10. **Registration/KYC mock** — Syrian ID / diaspora passport; deposit step UI showing multi-rail choice (bank transfer / e-cash / card gateway) — visual only.

### Plate renderer (shared component)
SVG: governorate name in Arabic (right side), 5-digit number, mini Syrian flag + "SYR" (format per RFI Q43: رمز محافظة + ٥ خانات). Crisp at all sizes; numerals respect the toggle.

### Content rules
- Native Arabic voice: formal-clear, government-grade, no translationese. EN toggle swaps whole UI.
- Currency ل.س with thousands separators. Accessibility: WCAG AA contrast, focus states, aria labels on bid controls (RFI asks for people-of-determination access).

## Shared assets (do NOT generate your own images)
Repo `assets/img/` holds Node 2 ComfyUI renders (banner-16x9.jpg, hero-square.jpg). Use them over a fallback color. Fonts: Cairo (CDN Google Fonts) minimum; Lane C may add a display face.

## Acceptance checks (per card)
- Pages open with no console errors (file:// OK).
- RTL default; EN toggle flips dir + ALL strings; numerals toggle works everywhere.
- Governorate filter returns only that governorate's plates; marketplace 3 modes functional (localStorage OK).
- Anti-sniping: bid at <2 min visibly extends the clock.
- Clean at 390px AND 1440px (Node 2 QA screenshots both).

