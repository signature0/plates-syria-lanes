/* Tools: plate valuation + birthdate finder */
(function () {
  "use strict";

  var SP = window.SP;
  var D = window.PLATE_DATA;
  var UI = window.PLATE_UI;

  function toDigits(str) {
    var AR = "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669";
    return String(str).replace(/[\u0660-\u0669]/g, function (c) { return AR.indexOf(c); }).replace(/[^0-9]/g, "");
  }

  /* ---------- valuation ---------- */
  var lastVal = null;

  function renderVal() {
    var box = document.getElementById("val-result");
    var num = toDigits(document.getElementById("val-num").value);
    if (num.length !== 5) {
      box.style.display = "none";
      UI.toast(SP.t("val.err"), "warn");
      return;
    }
    lastVal = num;
    var s = UI.scorePlate(num);
    var range = UI.tierRange(s.tier, s.total);
    var rows = s.rows.map(function (r) {
      return '<div class="score-row' + (r.on ? "" : " is-off") + '"><span>' + SP.t(r.key) + '</span><span class="pts">' +
        SP.numDigits(String(r.pts)) + " pts</span></div>";
    }).join("");
    box.innerHTML =
      '<div class="flex-between" style="margin-bottom:var(--sp-2)">' +
      '<div class="ac-num" style="font-size:var(--fs-2xl)">' + SP.numDigits(num) + "</div>" +
      '<span class="chip chip-ok">' + SP.t("tier." + s.tier) + "</span></div>" +
      rows +
      '<div class="score-row" style="border-bottom:none;margin-top:var(--sp-1)"><strong>' + SP.t("val.score") + '</strong><strong class="pts">' + SP.numDigits(String(s.total)) + "</strong></div>" +
      '<div class="tier-line"><span class="lbl">' + SP.t("val.range") + ':</span><strong>' + SP.fmtSYP(range[0]) + " — " + SP.fmtSYP(range[1]) + "</strong></div>";
    box.style.display = "";
  }

  /* ---------- birthdate finder ---------- */
  var lastBd = null;

  function candidates(dateIso) {
    var p = dateIso.split("-");
    if (p.length !== 3) return [];
    var m = String(p[1]).length === 1 ? "0" + p[1] : String(p[1]);
    var dd = String(p[2]).length === 1 ? "0" + p[2] : String(p[2]);
    var eight = p[0] + m + dd;
    var out = [
      eight.slice(-5), /* last 5 of YYYYMMDD */
      m + dd + p[0].slice(-1), /* MMDD + last year digit */
      p[0].slice(-1) + m + dd /* last year digit + MMDD */
    ];
    /* dedupe */
    var seen = {};
    var res = [];
    out.forEach(function (n) {
      if (!seen[n] && n.length === 5) { seen[n] = true; res.push(n); }
    });
    return res;
  }

  function isTaken(num) {
    for (var i = 0; i < D.AUCTIONS.length; i++) if (D.AUCTIONS[i].number === num) return true;
    for (var j = 0; j < D.RESULTS.length; j++) if (D.RESULTS[j].number === num) return true;
    return false;
  }

  function renderBd() {
    var box = document.getElementById("bd-result");
    var iso = document.getElementById("bd-date").value;
    var cands = candidates(iso);
    if (!cands.length) {
      box.style.display = "none";
      UI.toast(SP.t("val.err"), "warn");
      return;
    }
    lastBd = iso;
    var scored = cands.map(function (n) {
      return { num: n, score: UI.scorePlate(n) };
    }).sort(function (a, b) { return b.score.total - a.score.total; });

    var best = scored[0];
    var range = UI.tierRange(best.score.tier, best.score.total);
    var taken = isTaken(best.num);
    var alts = scored.slice(1).map(function (c) {
      return '<span class="chip">' + SP.numDigits(c.num) + " · " + SP.numDigits(String(c.score.total)) + "</span>";
    }).join("");

    box.innerHTML =
      '<div class="flex-between" style="align-items:center;margin-bottom:var(--sp-3)">' +
      '<div><div class="lbl" style="font-size:var(--fs-xs);font-weight:800;color:var(--c-text-muted)">' + SP.t("bd.result") + "</div>" +
      '<div class="ac-num bd-num" style="font-size:var(--fs-2xl)">' + SP.numDigits(best.num) + "</div></div>" +
      '<div class="ac-plate" style="width:220px">' + UI.plateSVG({ gov: "damascus", number: best.num }) + "</div></div>" +
      '<div class="ac-meta" style="margin-bottom:var(--sp-3)">' +
      '<span class="chip ' + (taken ? "chip-danger" : "chip-ok") + '">' + SP.t(taken ? "bd.taken" : "bd.available") + "</span>" +
      '<span class="chip">' + SP.t("bd.tier") + ": " + SP.t("tier." + best.score.tier) + "</span>" +
      '<span class="chip">' + SP.t("bd.price") + ": " + SP.fmtSYP(range[0]) + " — " + SP.fmtSYP(range[1]) + "</span></div>" +
      (alts ? '<div class="ac-meta" style="margin-bottom:var(--sp-3)">' + alts + "</div>" : "") +
      '<p class="text-muted" style="margin:0;font-size:var(--fs-xs)">' + SP.t("bd.note") + "</p>";
    box.style.display = "";
  }

  function rerun() {
    if (lastVal !== null) renderVal();
    if (lastBd !== null) renderBd();
  }

  document.getElementById("btn-val").addEventListener("click", renderVal);
  document.getElementById("btn-bd").addEventListener("click", renderBd);
  SP.onChange.push(rerun);
})();
