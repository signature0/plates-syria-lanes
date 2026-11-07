/* Lane A — shared components & rendering helpers.
   Pure-ish functions; read window.SP (defined in app.js) at call time. */
(function () {
  "use strict";

  var C = {};

  /* ---------- small svg helpers ---------- */
  C.starPoints = function (cx, cy, r) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / 5;
      var rad = i % 2 === 0 ? r : r * 0.42;
      pts.push((cx + rad * Math.cos(ang)).toFixed(2) + "," + (cy + rad * Math.sin(ang)).toFixed(2));
    }
    return pts.join(" ");
  };

  /* Syrian flag — NEW official flag (adopted 13 March 2025):
     horizontal stripes green / white / black with THREE red five-pointed
     stars centered in the white stripe. Drawn at x,y with w,h. */
  C.flagSVG = function (x, y, w, h) {
    var sh = h / 3;
    var r = Math.max(2.2, h * 0.13); // star radius scales with flag height
    return '<g transform="translate(' + x + "," + y + ')" aria-hidden="true">' +
      '<rect width="' + w + '" height="' + h + '" fill="#ffffff" stroke="#101010" stroke-width="0.8"/>' +
      '<rect width="' + w + '" height="' + sh.toFixed(2) + '" fill="#007a3d"/>' +
      '<rect y="' + (h - sh).toFixed(2) + '" width="' + w + '" height="' + sh.toFixed(2) + '" fill="#131313"/>' +
      '<polygon points="' + C.starPoints(w * 0.3, h / 2, r) + '" fill="#ce1126"/>' +
      '<polygon points="' + C.starPoints(w * 0.5, h / 2, r) + '" fill="#ce1126"/>' +
      '<polygon points="' + C.starPoints(w * 0.7, h / 2, r) + '" fill="#ce1126"/>' +
      "</g>";
  };

  /* ---------- plate (shared component) ----------
     Format per RFI Q43: governorate symbol + 5 digits.
     Governorate name always Arabic (physical object), numerals respect toggle. */
  C.plateInner = function (p) {
    var SP = window.SP;
    var gov = SP.govAr(p.gov);
    var num = SP.numDigits(p.number);
    var ed = p.edition || "standard";
    var uid = "x" + (C._uid = (C._uid || 0) + 1);
    if (ed === "golden") {
      return (
        '<defs><linearGradient id="gldP' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d98b"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#a8801c"/></linearGradient></defs>' +
        '<rect x="3" y="3" width="454" height="144" rx="10" fill="url(#gldP'+uid+')" stroke="#6e5311" stroke-width="6"/>' +
        '<rect x="13" y="13" width="434" height="124" rx="7" fill="none" stroke="#fff3c4" stroke-width="2"/>' +
        C.flagSVG(24, 28, 54, 34) +
        '<text x="51" y="86" text-anchor="middle" font-family="Cairo, sans-serif" font-size="16" font-weight="800" letter-spacing="2" fill="#3d2f0a">SYR</text>' +
        '<line x1="98" y1="26" x2="98" y2="124" stroke="#6e5311" stroke-width="1.5"/>' +
        '<text x="218" y="108" text-anchor="middle" direction="ltr" font-family="Cairo, sans-serif" font-size="70" font-weight="900" letter-spacing="4" fill="#3d2f0a">' + num + "</text>" +
        '<line x1="340" y1="26" x2="340" y2="124" stroke="#6e5311" stroke-width="1.5"/>' +
        C.govLabel(437, 50, gov, "#3d2f0a")
      );
    }
    if (ed === "royal") {
      return (
        '<defs><linearGradient id="royP' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26262b"/><stop offset=".5" stop-color="#101014"/><stop offset="1" stop-color="#000"/></linearGradient></defs>' +
        '<rect x="3" y="3" width="454" height="144" rx="10" fill="url(#royP'+uid+')" stroke="#b8963e" stroke-width="6"/>' +
        '<rect x="13" y="13" width="434" height="124" rx="7" fill="none" stroke="rgba(233,196,106,.5)" stroke-width="2"/>' +
        C.flagSVG(24, 28, 54, 34) +
        '<text x="51" y="86" text-anchor="middle" font-family="Cairo, sans-serif" font-size="16" font-weight="800" letter-spacing="2" fill="#e9c46a">SYR</text>' +
        '<line x1="98" y1="26" x2="98" y2="124" stroke="#b8963e" stroke-width="1.5"/>' +
        '<text x="218" y="108" text-anchor="middle" direction="ltr" font-family="Cairo, sans-serif" font-size="70" font-weight="900" letter-spacing="4" fill="#f5f2ea">' + num + "</text>" +
        '<line x1="340" y1="26" x2="340" y2="124" stroke="#b8963e" stroke-width="1.5"/>' +
        C.govLabel(437, 50, gov, "#e9c46a")
      );
    }
    return (
      '<rect x="3" y="3" width="454" height="144" rx="10" fill="#f8f5ec" stroke="#1a4a3a" stroke-width="6"/>' +
      '<rect x="13" y="13" width="434" height="124" rx="7" fill="none" stroke="#b8963e" stroke-width="2"/>' +
      C.flagSVG(24, 28, 54, 34) +
      '<text x="51" y="86" text-anchor="middle" font-family="Cairo, sans-serif" font-size="16" font-weight="800" letter-spacing="2" fill="#0f2e24">SYR</text>' +
      '<line x1="98" y1="26" x2="98" y2="124" stroke="#b8963e" stroke-width="1.5"/>' +
      '<text x="218" y="108" text-anchor="middle" direction="ltr" font-family="Cairo, sans-serif" font-size="70" font-weight="900" letter-spacing="4" fill="#0f2e24">' + num + "</text>" +
      '<line x1="340" y1="26" x2="340" y2="124" stroke="#b8963e" stroke-width="1.5"/>' +
      C.govLabel(437, 50, gov, "#1a4a3a")
    );
  };

  C.govLabel = function (x, y, gov, fill) {
    /* PO: governorate must NEVER clip. Hard cap 14px fits even "الحسكة" inside x=340..446
       with margin; longer names shrink further (min 10). */
    var n = String(gov).length;
    /* SVG has direction:rtl inherited — flip anchor so text grows INWARD from x toward divider */
    var ax = 874 - x; /* mirror coordinate for RTL-in-RTL rendering: right edge lands at x */
    var fs = Math.min(14, Math.floor(92 / (n * 0.62)));
    fs = Math.max(10, fs);
    /* the SVG inherits document RTL; Chrome's glyph run for an RTL string anchored
       at x with text-anchor:middle is correct regardless of dir, so center it. */
    var cx = (348 + 442) / 2; /* governorate zone centre */
    return '<text x="' + cx + '" y="' + y + '" text-anchor="middle" direction="rtl" font-family="Cairo, sans-serif" font-size="' + fs + '" font-weight="800" fill="' + fill + '">' + gov + "</text>";
  };

  C.plateSVG = function (p, opts) {
    opts = opts || {};
    var cls = "plate-svg" + (opts.cls ? " " + opts.cls : "");
    var aria = window.SP.govAr(p.gov) + " " + window.SP.numDigits(p.number);
    return '<svg class="' + cls + '" viewBox="0 0 460 150" role="img" aria-label="' + aria + '" xmlns="http://www.w3.org/2000/svg">' +
      C.plateInner(p) + "</svg>";
  };

  /* ---------- car mockup (generic premium sedan, front view, no logos) ---------- */
  C.carSVG = function (p) {
    var SP = window.SP;
    var gov = SP.govAr(p.gov);
    return (
      '<svg viewBox="0 0 640 400" role="img" aria-label="' + gov + '" xmlns="http://www.w3.org/2000/svg">' +
      "<defs>" +
      '<linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#2a5a4b"/><stop offset="1" stop-color="#16382e"/>' +
      "</linearGradient>" +
      '<linearGradient id="carGlass" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#b7d3e0"/><stop offset="1" stop-color="#7fa8bd"/>' +
      "</linearGradient>" +
      "</defs>" +
      /* ground */
      '<ellipse cx="320" cy="366" rx="252" ry="16" fill="rgba(15,46,36,0.18)"/>' +
      /* cabin */
      '<path d="M172,198 L216,122 Q320,96 424,122 L468,198 Z" fill="#12332a"/>' +
      '<path d="M228,190 L262,134 Q320,114 378,134 L412,190 Z" fill="url(#carGlass)"/>' +
      '<line x1="320" y1="116" x2="320" y2="190" stroke="#12332a" stroke-width="4"/>' +
      /* body */
      '<path d="M100,330 L100,218 Q100,196 128,194 L512,194 Q540,196 540,218 L540,330 Q540,338 528,338 L112,338 Q100,338 100,330 Z" fill="url(#carBody)"/>' +
      /* mirrors */
      '<rect x="138" y="184" width="36" height="18" rx="7" fill="#0f2e24"/>' +
      '<rect x="466" y="184" width="36" height="18" rx="7" fill="#0f2e24"/>' +
      /* headlights */
      '<rect x="112" y="212" width="84" height="28" rx="14" fill="#eef6f8" stroke="#0f2e24" stroke-width="2"/>' +
      '<circle cx="176" cy="226" r="7" fill="#b8963e"/>' +
      '<rect x="444" y="212" width="84" height="28" rx="14" fill="#eef6f8" stroke="#0f2e24" stroke-width="2"/>' +
      '<circle cx="464" cy="226" r="7" fill="#b8963e"/>' +
      /* grille */
      '<rect x="243" y="210" width="154" height="34" rx="9" fill="#0b1f19" stroke="#0f2e24" stroke-width="2"/>' +
      '<line x1="252" y1="220" x2="388" y2="220" stroke="#2c4a40" stroke-width="3"/>' +
      '<line x1="252" y1="229" x2="388" y2="229" stroke="#2c4a40" stroke-width="3"/>' +
      '<line x1="252" y1="238" x2="388" y2="238" stroke="#2c4a40" stroke-width="3"/>' +
      /* gold pinstripe */
      '<line x1="106" y1="268" x2="534" y2="268" stroke="#b8963e" stroke-width="2"/>' +
      /* bumper */
      '<rect x="94" y="286" width="452" height="40" rx="10" fill="#0f2e24"/>' +
      /* plate mounted on bumper */
      '<g transform="translate(239,293) scale(0.348)">' + C.plateInner(p) + "</g>" +
      "</svg>"
    );
  };

  /* ---------- toast ---------- */
  C.toast = function (msg, type) {
    var root = document.getElementById("toast-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "toast-root";
      document.body.appendChild(root);
    }
    var el = document.createElement("div");
    el.className = "toast" + (type === "warn" ? " toast-warn" : "");
    el.setAttribute("role", "status");
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3400);
  };

  /* ---------- pattern classification (xplate-style classes, 5 digits) ---------- */
  C.patternClass = function (num) {
    var d = num.split("").map(Number);
    var c = { same5: false, triple: false, palindrome: false, sequence: false, repeat: false, lucky7: false };
    var uniq = {};
    d.forEach(function (x) { uniq[x] = true; });
    if (Object.keys(uniq).length === 1) c.same5 = true;

    var run = 1, maxRun = 1;
    for (var i = 1; i < d.length; i++) {
      run = d[i] === d[i - 1] ? run + 1 : 1;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 3) c.triple = true;

    var rev = d.slice().reverse().join("");
    if (num === rev) c.palindrome = true;

    var asc = true, desc = true;
    for (var j = 1; j < d.length; j++) {
      if (d[j] !== d[j - 1] + 1) asc = false;
      if (d[j] !== d[j - 1] - 1) desc = false;
    }
    if (asc || desc) c.sequence = true;

    var pairs = 0;
    for (var k = 1; k < d.length; k++) if (d[k] === d[k - 1]) pairs++;
    if (pairs >= 1) c.repeat = true;

    if (num.indexOf("7") !== -1) c.lucky7 = true;
    return c;
  };

  /* Primary pattern label key (for chips/filters) */
  C.patternKey = function (num) {
    var c = C.patternClass(num);
    if (c.same5) return "same5";
    if (c.sequence) return "sequence";
    if (c.palindrome) return "palindrome";
    if (c.triple) return "triple";
    if (c.repeat) return "repeat";
    if (c.lucky7) return "lucky7";
    return "other";
  };

  /* ---------- valuation scoring (tools) ---------- */
  C.scorePlate = function (num) {
    var d = num.split("").map(Number);
    var rows = [];
    var uniq = {};
    d.forEach(function (x) { uniq[x] = true; });
    var same5 = Object.keys(uniq).length === 1;
    rows.push({ key: "r.same5", on: same5, pts: same5 ? 500 : 0 });

    var run = 1, maxRun = 1;
    for (var i = 1; i < d.length; i++) {
      run = d[i] === d[i - 1] ? run + 1 : 1;
      if (run > maxRun) maxRun = run;
    }
    rows.push({ key: "r.triple", on: maxRun >= 3, pts: maxRun >= 4 ? 220 : maxRun >= 3 ? 180 : 0 });

    var rev = d.slice().reverse().join("");
    var pal = num === rev && !same5;
    rows.push({ key: "r.palindrome", on: pal, pts: pal ? 220 : 0 });

    var asc = true, desc = true;
    for (var j = 1; j < d.length; j++) {
      if (d[j] !== d[j - 1] + 1) asc = false;
      if (d[j] !== d[j - 1] - 1) desc = false;
    }
    var seq = (asc || desc) && !same5;
    rows.push({ key: "r.sequence", on: seq, pts: seq ? 200 : 0 });

    var pairs = 0;
    for (var k = 1; k < d.length; k++) if (d[k] === d[k - 1]) pairs++;
    var repPts = Math.min(pairs * 90, 180);
    rows.push({ key: "r.repeat", on: repPts > 0, pts: repPts });

    var sevens = num.split("").filter(function (ch) { return ch === "7"; }).length;
    var l7 = sevens > 0;
    rows.push({ key: "r.lucky7", on: l7, pts: l7 ? sevens * 15 + (sevens === 5 ? 150 : 0) : 0 });

    var sum = d.reduce(function (a, b) { return a + b; }, 0);
    var luckySum = (sum === 21 || sum === 28 || sum === 35) && !same5;
    rows.push({ key: "r.sum", on: luckySum, pts: luckySum ? 20 : 0 });

    var total = 0;
    rows.forEach(function (r) { total += r.pts; });
    var tier = total >= 650 ? "national" : total >= 350 ? "premium" : total >= 150 ? "good" : "standard";
    return { rows: rows, total: total, tier: tier };
  };

  C.tierRange = function (tier, total) {
    var base = {
      national: [200000000, 600000000],
      premium: [40000000, 150000000],
      good: [10000000, 40000000],
      standard: [2000000, 10000000]
    }[tier];
    var f = 0.85 + Math.min(total, 1000) / 2000; /* 0.85 – 1.35 */
    return [Math.round(base[0] * f / 500000) * 500000, Math.round(base[1] * f / 500000) * 500000];
  };

  /* ---------- auction card ---------- */
  C.auctionCardHTML = function (a) {
    var SP = window.SP;
    var t = SP.t;
    var gov = SP.govName(a.gov);
    var ended = a.endsAt <= Date.now();
    var above = a.current >= a.reserve;
    var watch = SP.watchSet().indexOf(a.id) !== -1;
    return (
      '<div class="card auction-card" data-card="' + a.id + '">' +
      '<div class="ac-plate"><a href="auction.html?id=' + a.id + '" aria-label="' + gov + " " + SP.numDigits(a.number) + '">' + C.plateSVG(a) + "</a></div>" +
      '<div class="ac-body">' +
      '<a class="ac-link" href="auction.html?id=' + a.id + '">' +
      '<div class="ac-gov">' + gov + "</div>" +
      '<div class="ac-num">' + SP.numDigits(a.number) + "</div>" +
      "</a>" +
      '<div class="ac-meta">' +
      '<span class="chip ' + (above ? "chip-ok" : "chip-warn") + '">' + (above ? t("card.above") : t("card.below")) + "</span>" +
      '<span class="chip">' + SP.numDigits(String(a.ladderData.length)) + " " + t("card.bids") + "</span>" +
      "</div>" +
      '<div class="ac-bid"><span class="lbl">' + (ended ? t("detail.won") : t("card.bid")) + '</span><span class="val">' + SP.fmtSYP(a.current) + "</span></div>" +
      '<div class="ac-time"><span class="lbl">' + t("card.left") + '</span><span class="countdown" data-countdown="' + a.endsAt + '" data-ended-label="' + t("card.ended") + '"></span>' +
      '<button class="watch-btn" type="button" data-watch="' + a.id + '" aria-pressed="' + watch + '" aria-label="' + (watch ? t("card.watching") : t("card.watch")) + '">' +
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.5 6.8-6.1-3.6-6.1 3.6 1.5-6.8L2.2 8.9l6.9-.6z"/></svg>' +
      "</button></div>" +
      "</div></div>"
    );
  };

  /* ---------- marketplace listing card ---------- */
  C.listingCardHTML = function (l, opts) {
    opts = opts || {};
    var SP = window.SP;
    var t = SP.t;
    var gov = SP.govName(l.gov);
    var patKey = C.patternKey(l.number);
    var modeCls = { fixed: "mode-fixed", auction: "mode-auction", offer: "mode-offer" }[l.mode];

    var priceHTML = "";
    if (l.mode === "fixed") {
      priceHTML = '<div class="listing-price">' + SP.fmtSYP(l.price) + "</div>";
    } else if (l.mode === "auction") {
      priceHTML = '<div class="listing-price">' + SP.fmtSYP(l.price) + "</div>" +
        '<div class="listing-end">' + t("mkt.inc") + ": " + SP.fmtSYP(l.increment) + "</div>" +
        '<div class="listing-end">' + t("mkt.ends") + ' <span class="countdown" data-countdown="' + l.endsAt + '">' +
        SP.fmtCountdown(l.endsAt - Date.now(), t("card.ended")) + "</span></div>";
    } else {
      priceHTML = '<div class="listing-price" style="font-size:var(--fs-md)">' + t("mode.offer") + "</div>";
    }

    var soldChip = opts.sold ? ' <span class="badge badge-gray">' + t("mkt.sold") + "</span>" : "";
    var pendingChip = opts.pending ? ' <span class="chip chip-warn">' + t("mkt.offer.pending") + "</span>" : "";

    var actions = "";
    if (opts.actions && !opts.sold) {
      if (l.mode === "fixed") actions = '<button class="btn btn-primary btn-sm" type="button" data-buy="' + l.id + '">' + t("mkt.buy") + "</button>";
      if (l.mode === "offer") {
        actions = '<button class="btn btn-outline btn-sm" type="button" data-offer="' + l.id + '">' + t("mkt.offer") + "</button>" +
          '<div class="offer-form" data-offerform="' + l.id + '" style="display:none">' +
          '<div class="field"><label>' + t("mkt.offer.amount") + '</label><input class="input" inputmode="numeric" autocomplete="off"></div>' +
          '<div class="field"><label>' + t("mkt.offer.msg") + '</label><textarea class="input" rows="2" data-i18n-ph="mkt.offer.msg.ph"></textarea></div>' +
          '<button class="btn btn-gold btn-sm" type="button" data-offersubmit="' + l.id + '">' + t("common.send") + "</button>" +
          "</div>";
      }
    }

    return (
      '<div class="card listing-card" data-list="' + l.id + '">' +
      '<div class="ac-plate">' + C.plateSVG(l) + "</div>" +
      '<div class="ac-body">' +
      '<div class="ac-gov">' + gov + "</div>" +
      '<div class="ac-num">' + SP.numDigits(l.number) + "</div>" +
      '<div class="ac-meta"><span class="mode-badge ' + modeCls + '">' + t("mode." + l.mode) + "</span>" +
      '<span class="chip">' + t("pat." + patKey) + "</span>" + pendingChip + soldChip + "</div>" +
      priceHTML +
      '<div class="ac-bid"><span class="lbl">' + t("mkt.form.seller") + '</span><span class="val">' + (l.seller || "—") + "</span></div>" +
      '<div class="ac-meta" style="margin-top:var(--sp-2)">' + actions + "</div>" +
      "</div></div>"
    );
  };

  /* ---------- gov name helpers ---------- */
  C.govById = function (id) {
    var g = window.PLATE_DATA.GOVS.filter(function (x) { return x.id === id; })[0];
    return g || { ar: id, en: id };
  };

  window.PLATE_UI = C;
})();
