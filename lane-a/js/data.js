/* Lane A — mock data (no backend). Deterministic, relative times so the
   demo always shows a mix of "ending soon" / "live" / "later" auctions. */
(function () {
  "use strict";

  var GOVS = [
    { id: "damascus",    ar: "دمشق",      en: "Damascus" },
    { id: "rif",         ar: "ريف دمشق", en: "Rif Dimashq" },
    { id: "halab",       ar: "حلب",       en: "Aleppo" },
    { id: "homs",        ar: "حمص",       en: "Homs" },
    { id: "hama",        ar: "حماة",      en: "Hama" },
    { id: "idlib",       ar: "إدلب",      en: "Idlib" },
    { id: "ladhiqia",    ar: "اللاذقية", en: "Lattakia" },
    { id: "tartus",      ar: "طرطوس",     en: "Tartus" },
    { id: "draa",        ar: "درعا",      en: "Daraa" },
    { id: "qunaytra",    ar: "القنيطرة", en: "Qunaytra" },
    { id: "suwayda",     ar: "السويداء", en: "Suwayda" },
    { id: "dayr",        ar: "دير الزور", en: "Deir ez-Zor" },
    { id: "hasaka",      ar: "الحسكة",    en: "Hasaka" },
    { id: "raqqa",       ar: "الرقة",     en: "Raqqa" }
  ];

  /* Bid increments (SYP) — table shown on auction detail. */
  var INCREMENTS = [
    { max: 5000000,    step: 250000 },
    { max: 15000000,   step: 500000 },
    { max: 50000000,   step: 1000000 },
    { max: 100000000,  step: 2500000 },
    { max: Infinity,   step: 5000000 }
  ];

  var M = 60000, H = 3600000, D = 86400000;
  var now = Date.now();

  function mkLadder(cur, count, who) {
    /* Build a plausible history ending at `cur`. */
    var out = [];
    var val = cur;
    var t = now - 4 * M;
    for (var i = 0; i < count; i++) {
      out.push({ who: who[i % who.length], amount: val, at: t });
      val = stepOf(val) > 0 ? val - stepOf(val) : val - 250000;
      if (val <= 0) val = 250000;
      t -= 3 * M + (i % 3) * 2 * M;
    }
    return out.reverse();
  }

  function stepOf(amount) {
    for (var i = 0; i < INCREMENTS.length; i++) {
      if (amount < INCREMENTS[i].max) return INCREMENTS[i].step;
    }
    return INCREMENTS[INCREMENTS.length - 1].step;
  }

  var WHO = ["B-102", "B-207", "B-118", "B-342", "B-501"];

  /* 20 live auctions across 14 governorates (≥18 required, ≥6 govts). */
  var AUCTIONS = [
    { id: "A-001", gov: "damascus", number: "77777", reserve: 450000000,  current: 380000000,  endsIn: 95 * 1000,  ladder: 6 },
    { id: "A-002", gov: "damascus", number: "12345", reserve: 60000000,   current: 75000000,   endsIn: 3 * M,      ladder: 5 },
    { id: "A-003", gov: "damascus", number: "11223", reserve: 20000000,   current: 22000000,   endsIn: 15 * M,     ladder: 4 },
    { id: "A-004", gov: "damascus", number: "80808", reserve: 130000000,  current: 105000000,  endsIn: 26 * H,     ladder: 5 },
    { id: "A-005", gov: "rif",      number: "00001", reserve: 900000000,  current: 1200000000, endsIn: 3 * H,      ladder: 7 },
    { id: "A-006", gov: "halab",    number: "10101", reserve: 80000000,   current: 95000000,   endsIn: 26 * M,     ladder: 5 },
    { id: "A-007", gov: "halab",    number: "44444", reserve: 300000000,  current: 260000000,  endsIn: 45 * M,     ladder: 6 },
    { id: "A-008", gov: "halab",    number: "70770", reserve: 70000000,   current: 66000000,   endsIn: 30 * H,     ladder: 4 },
    { id: "A-009", gov: "homs",     number: "77770", reserve: 120000000,  current: 150000000,  endsIn: 10 * M,     ladder: 5 },
    { id: "A-010", gov: "homs",     number: "19451", reserve: 20000000,   current: 15000000,   endsIn: 2 * D,      ladder: 3 },
    { id: "A-011", gov: "hama",     number: "12321", reserve: 35000000,   current: 28000000,   endsIn: 5 * M,      ladder: 4 },
    { id: "A-012", gov: "idlib",    number: "55555", reserve: 250000000,  current: 250000000,  endsIn: 50 * M,     ladder: 6 },
    { id: "A-013", gov: "ladhiqia", number: "90909", reserve: 90000000,   current: 110000000,  endsIn: 80 * M,     ladder: 5 },
    { id: "A-014", gov: "tartus",   number: "11112", reserve: 25000000,   current: 19000000,   endsIn: 100 * 1000, ladder: 3 },
    { id: "A-015", gov: "draa",     number: "88880", reserve: 15000000,   current: 12000000,   endsIn: 2 * H,      ladder: 3 },
    { id: "A-016", gov: "qunaytra", number: "13579", reserve: 18000000,   current: 18000000,   endsIn: 40 * M,     ladder: 4 },
    { id: "A-017", gov: "suwayda",  number: "25252", reserve: 12000000,   current: 9000000,    endsIn: 3 * H,      ladder: 3 },
    { id: "A-018", gov: "dayr",     number: "66666", reserve: 140000000,  current: 160000000,  endsIn: 6 * H,      ladder: 5 },
    { id: "A-019", gov: "hasaka",   number: "31415", reserve: 15000000,   current: 11000000,   endsIn: 9 * H,      ladder: 3 },
    { id: "A-020", gov: "raqqa",    number: "45678", reserve: 40000000,   current: 44000000,   endsIn: 12 * H,     ladder: 4 }
  ];

  /* Marketplace listings: mode = fixed | auction | offer */
  var MARKET_SEED = [
    { id: "M-001", gov: "damascus", number: "33333", mode: "fixed",   price: 180000000, seller: "S. Kh." },
    { id: "M-002", gov: "damascus", number: "20252", mode: "offer",   seller: "R. A." },
    { id: "M-003", gov: "halab",    number: "99999", mode: "fixed",   price: 220000000, seller: "H. M." },
    { id: "M-004", gov: "halab",    number: "15975", mode: "auction", price: 10000000,  endsIn: 3 * D,  increment: 250000, seller: "N. B." },
    { id: "M-005", gov: "homs",     number: "70007", mode: "offer",   seller: "A. H." },
    { id: "M-006", gov: "idlib",    number: "88888", mode: "fixed",   price: 190000000, seller: "Y. D." },
    { id: "M-007", gov: "ladhiqia", number: "12121", mode: "auction", price: 8000000,   endsIn: 1 * D,  increment: 1000000, seller: "M. S." },
    { id: "M-008", gov: "hama",     number: "60606", mode: "fixed",   price: 60000000,  seller: "K. T." },
    { id: "M-009", gov: "suwayda",  number: "12312", mode: "offer",   seller: "O. F." },
    { id: "M-010", gov: "rif",      number: "11235", mode: "auction", price: 25000000,  endsIn: 5 * D,  increment: 500000, seller: "Z. R." }
  ];

  /* Family packages (bundles) */
  var PACKAGES = [
    { id: "P-001", gov: "damascus", kind: "series", nameAr: "سلسلة المئة — دمشق", nameEn: "Series of 100 — Damascus",
      plates: ["10001", "10002", "10003", "10004", "10005"], price: 120000000 },
    { id: "P-002", gov: "halab", kind: "match", nameAr: "سلسلة 303 — حلب", nameEn: "Series 303 — Aleppo",
      plates: ["30301", "30302", "30303", "30304", "30305"], price: 95000000 },
    { id: "P-003", gov: "homs", kind: "seven", nameAr: "عائلة الرقم 7 — حمص", nameEn: "The family of 7 — Homs",
      plates: ["70770", "77077", "77707", "70777", "77770"], price: 260000000 },
    { id: "P-004", gov: "ladhiqia", kind: "series", nameAr: "سلسلة 909 — اللاذقية", nameEn: "Series 909 — Lattakia",
      plates: ["90901", "90902", "90903", "90904", "90905"], price: 88000000 }
  ];

  /* Past auction results (public transparency) */
  var RESULTS = [
    { date: "2026-10-28", gov: "damascus", number: "70707", start: 120000000, hammer: 145000000, buyer: "A. S." },
    { date: "2026-10-28", gov: "halab",    number: "56789", start: 25000000,  hammer: 31000000,  buyer: "K. M." },
    { date: "2026-10-25", gov: "homs",     number: "99999", start: 150000000, hammer: 182000000, buyer: "H. T." },
    { date: "2026-10-21", gov: "idlib",    number: "34567", start: 8000000,   hammer: 11500000,  buyer: "M. R." },
    { date: "2026-10-18", gov: "ladhiqia", number: "22222", start: 90000000,  hammer: 128000000, buyer: "F. A." },
    { date: "2026-10-15", gov: "damascus", number: "10101", start: 40000000,  hammer: 52000000,  buyer: "B. N." },
    { date: "2026-10-11", gov: "hama",     number: "80808", start: 60000000,  hammer: 74000000,  buyer: "S. H." },
    { date: "2026-10-08", gov: "tartus",   number: "11111", start: 45000000,  hammer: 58000000,  buyer: "T. W." },
    { date: "2026-10-04", gov: "dayr",     number: "44440", start: 20000000,  hammer: 26000000,  buyer: "N. K." },
    { date: "2026-09-30", gov: "qunaytra", number: "24680", start: 5000000,   hammer: 7200000,   buyer: "R. D." }
  ];

  /* Materialize endsAt timestamps and ladders. */
  AUCTIONS.forEach(function (a) {
    a.endsAt = now + a.endsIn;
    a.ladderData = mkLadder(a.current, a.ladder, WHO);
    delete a.endsIn;
  });
  MARKET_SEED.forEach(function (l) {
    if (l.mode === "auction") l.endsAt = now + l.endsIn;
    delete l.endsIn;
  });

  window.PLATE_DATA = {
    GOVS: GOVS,
    INCREMENTS: INCREMENTS,
    AUCTIONS: AUCTIONS,
    MARKET_SEED: MARKET_SEED,
    PACKAGES: PACKAGES,
    RESULTS: RESULTS,
    stepOf: stepOf
  };
})();
