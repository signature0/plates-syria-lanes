/* Auction detail + live bidding mock (increments, anti-sniping extension,
   proxy bids, watchlist, deposit badge). */
(function () {
  "use strict";

  var SP = window.SP;
  var D = window.PLATE_DATA;
  var UI = window.PLATE_UI;
  var REQUIRED_DEPOSIT = 2000000;

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id") || "A-001";
  var A = null;
  for (var i = 0; i < D.AUCTIONS.length; i++) if (D.AUCTIONS[i].id === id) A = D.AUCTIONS[i];

  var proxy = null;      /* {max: number} */
  var ended = false;
  var oppNext = 0;
  var oppCount = 0;
  var OPP_WHO = ["B-102", "B-207", "B-118", "B-342", "B-501"];

  function parseMoney(str) {
    var clean = String(str).replace(/[^0-9\u0660-\u0669]/g, "");
    if (!clean) return 0;
    clean = clean.replace(/[\u0660-\u0669]/g, function (d) {
      return "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669".indexOf(d);
    });
    return parseInt(clean, 10);
  }

  function minNext() { return A.current + D.stepOf(A.current); }

  function clock(at) {
    var dt = new Date(at);
    var h = dt.getHours(), m = dt.getMinutes();
    return SP.numDigits((h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m);
  }

  /* ---------- rendering ---------- */
  function chrome() {
    var t = SP.t;
    var gov = SP.govName(A.gov);
    var patKey = UI.patternKey(A.number);
    var above = A.current >= A.reserve;
    var statusChip = ended
      ? '<span class="chip ' + (above ? "chip-ok" : "chip-danger") + '">' + (above ? t("detail.won") : t("detail.unsold")) + "</span>"
      : '<span class="chip chip-gold">' + t("card.left") + " <span class=\"countdown\" id=\"cd-chip\"></span></span>";

    var incRows = D.INCREMENTS.map(function (r, idx) {
      var from = idx === 0 ? 0 : D.INCREMENTS[idx - 1].max;
      var to = r.max === Infinity ? "∞" : SP.fmtInt(r.max);
      return "<tr><td>" + SP.fmtInt(from) + " – " + to + "</td><td><strong>" + SP.fmtSYP(r.step) + "</strong></td></tr>";
    }).join("");

    var watch = SP.watchSet().indexOf(A.id) !== -1;

    return (
      '<a class="back-link" href="auctions.html">← ' + t("detail.back") + "</a>" +
      '<div class="page-head">' +
      '<span class="eyebrow">' + gov + "</span>" +
      "<h1>" + SP.numDigits(A.number) + "</h1>" +
      '<div class="chip-row">' +
      '<span class="chip chip-gold">' + t("pat." + patKey) + "</span>" +
      '<span class="chip ' + (above ? "chip-ok" : "chip-warn") + '">' + (above ? t("card.above") : t("card.below")) + "</span>" +
      statusChip +
      "</div></div>" +

      '<div class="detail-grid">' +
      "<div>" +
      '<div class="detail-plate" id="detail-plate">' + UI.plateSVG(A) + "</div>" +
      '<div class="car-mock"><div id="car-mock">' + UI.carSVG(A) + '</div><div class="cap">' + t("detail.car") + "</div></div>" +

      '<div class="bid-box">' +
      '<div class="deposit-badge" id="deposit-badge"></div>' +
      '<div class="bid-current">' +
      "<div><span class=\"lbl\">" + t("detail.current") + '</span><div class="num" id="cur-bid"></div></div>' +
      "<div><span class=\"lbl\">" + t("detail.minnext") + '</span><div class="num" id="min-next"></div></div>' +
      '<div><span class="lbl">' + t("detail.time") + '</span><div class="countdown" id="cd"></div></div>' +
      "</div>" +
      (ended ? "" : (
        '<div class="bid-row">' +
        '<div class="field" style="margin:0"><label for="bid-amount">' + t("detail.yourbid") + '</label>' +
        '<input id="bid-amount" class="input" inputmode="numeric" autocomplete="off"></div>' +
        '<button id="btn-bid" class="btn btn-gold">' + t("detail.bidnow") + "</button>" +
        "</div>"
      )) +
      '<div class="proxy-box">' +
      "<h3>" + t("detail.proxy.title") + "</h3>" +
      '<p class="hint">' + t("detail.proxy.d") + "</p>" +
      (ended ? "" : (
        '<div class="bid-row">' +
        '<div class="field" style="margin:0"><label for="proxy-max">' + t("detail.proxy.max") + '</label>' +
        '<input id="proxy-max" class="input" inputmode="numeric" autocomplete="off"></div>' +
        '<button id="btn-proxy" class="btn btn-outline btn-sm">' + (proxy ? t("detail.proxy.remove") : t("detail.proxy.set")) + "</button>" +
        "</div>"
      )) +
      '<p class="proxy-status" id="proxy-status"></p>' +
      "</div>" +
      "</div>" +

      '<div class="card card-pad mt-4">' +
      "<h3>" + t("detail.ladder") + "</h3>" +
      '<ul class="ladder" id="ladder"></ul>' +
      "</div>" +
      "</div>" +

      "<aside>" +
      '<div class="card card-pad"><h3>' + t("detail.inc") + "</h3>" +
      '<table class="inc-table"><thead><tr><th>' + t("detail.inc.from") + "</th><th>" + t("detail.inc.step") + "</th></tr></thead>" +
      "<tbody>" + incRows + "</tbody></table></div>" +
      '<div class="card card-pad mt-4"><h3>' + t("detail.rules") + "</h3>" +
      '<ul class="rules-list">' +
      "<li>" + t("detail.rules.1") + "</li>" +
      "<li>" + t("detail.rules.2") + "</li>" +
      "<li>" + t("detail.rules.3") + "</li>" +
      "</ul>" +
      '<div class="rule-anti"><strong>' + t("detail.rules.anti") + "</strong>" + t("detail.rules.anti.d") + "</div>" +
      '<div class="flex-between mt-4">' +
      '<button class="btn btn-ghost btn-sm" type="button" data-watch="' + A.id + '" aria-pressed="' + watch + '">' +
      (watch ? "★ " + t("card.watching") : "☆ " + t("card.watch")) + "</button>" +
      '<a class="btn btn-outline btn-sm" href="register.html">' + t("nav.register") + "</a>" +
      "</div></div>" +
      "</aside>" +
      "</div>"
    );
  }

  function build() {
    document.getElementById("detail-root").innerHTML = chrome();
    bind();
    render();
  }

  function bind() {
    var bb = document.getElementById("btn-bid");
    if (bb) bb.addEventListener("click", userBid);
    var bp = document.getElementById("btn-proxy");
    if (bp) bp.addEventListener("click", toggleProxy);
  }

  function render() {
    var t = SP.t;
    var u = SP.user();
    var canBid = !ended && u.verified && u.deposit >= REQUIRED_DEPOSIT;

    document.title = SP.numDigits(A.number) + " — " + t("nav.auctions") + " — " + t("brand.ministry");

    var cur = document.getElementById("cur-bid");
    if (cur) cur.textContent = SP.fmtSYP(A.current);
    var mn = document.getElementById("min-next");
    if (mn) mn.textContent = ended ? "—" : SP.fmtSYP(minNext());

    var input = document.getElementById("bid-amount");
    if (input) {
      input.value = String(minNext());
      input.disabled = !canBid;
      input.setAttribute("aria-label", t("detail.yourbid"));
    }
    var bb = document.getElementById("btn-bid");
    if (bb) {
      bb.disabled = !canBid;
      bb.setAttribute("aria-label", t("detail.bidnow"));
    }

    var dep = document.getElementById("deposit-badge");
    if (dep) {
      if (u.verified && u.deposit >= REQUIRED_DEPOSIT) {
        dep.className = "deposit-badge";
        dep.innerHTML = "✓ " + t("detail.deposit.ok") + " — " + SP.fmtSYP(u.deposit) +
          " (" + t("detail.deposit.req") + ": " + SP.fmtSYP(REQUIRED_DEPOSIT) + ")";
      } else {
        dep.className = "deposit-badge is-bad";
        dep.innerHTML = "✗ " + t("detail.deposit.bad") +
          ' — <a href="register.html">' + t("nav.register") + " →</a>";
      }
    }

    var ps = document.getElementById("proxy-status");
    if (ps) ps.textContent = proxy ? (t("detail.proxy.active") + " " + SP.fmtSYP(proxy.max)) : "";

    var lad = document.getElementById("ladder");
    if (lad) {
      lad.innerHTML = A.ladderData.length
        ? A.ladderData.slice(0, 12).map(function (b) {
            var who = b.you ? (SP.state.lang === "ar" ? "أنت" : "You") : b.who;
            var cls = b.you ? ' style="color:var(--c-maroon);font-weight:800"' : "";
            return "<li><span class=\"who\"" + cls + ">" + who + "</span>" +
              '<span class="num">' + SP.fmtSYP(b.amount) + "</span>" +
              '<span class="when">' + clock(b.at) + "</span></li>";
          }).join("")
        : "<li>" + t("detail.ladder.empty") + "</li>";
    }
    tick();
  }

  /* ---------- bidding ---------- */
  function doBid(amount, who, isUser) {
    A.current = amount;
    A.ladderData.unshift({ who: who, amount: amount, at: Date.now(), you: isUser });
    /* anti-sniping: bid inside last 2 minutes extends +60s */
    var left = A.endsAt - Date.now();
    if (left > 0 && left < 120000) {
      A.endsAt += 60000;
      UI.toast(SP.t("toast.extend"));
    }
  }

  function userBid() {
    if (ended) return;
    var u = SP.user();
    if (!u.verified || u.deposit < REQUIRED_DEPOSIT) {
      UI.toast(SP.t("detail.deposit.bad"), "warn");
      return;
    }
    var input = document.getElementById("bid-amount");
    var amt = parseMoney(input ? input.value : "");
    var mn = minNext();
    if (!amt || amt < mn) {
      UI.toast(SP.t("toast.bid.invalid") + " " + SP.fmtSYP(mn), "warn");
      return;
    }
    doBid(amt, "you", true);
    UI.toast(SP.t("toast.bid"));
    render();
    applyProxy();
  }

  function applyProxy() {
    if (!proxy || ended || A.endsAt <= Date.now()) return;
    var guard = 0;
    while (guard < 3) {
      var next = minNext();
      if (next <= proxy.max) {
        doBid(next, "proxy", false);
        UI.toast(SP.t("toast.proxy"));
        guard++;
      } else break;
    }
    render();
  }

  function toggleProxy() {
    if (proxy) { proxy = null; render(); return; }
    var v = parseMoney(document.getElementById("proxy-max").value);
    if (!v || v < minNext()) {
      UI.toast(SP.t("toast.bid.invalid") + " " + SP.fmtSYP(minNext()), "warn");
      return;
    }
    proxy = { max: v };
    render();
    applyProxy();
  }

  /* ---------- live tick: countdown + simulated opponents ---------- */
  function tick() {
    var cd = document.getElementById("cd");
    var cdChip = document.getElementById("cd-chip");
    var left = A.endsAt - Date.now();

    if (left <= 0 && !ended) {
      ended = true;
      build(); /* re-render final state */
      return;
    }
    if (ended) return;
    if (cd) {
      cd.textContent = SP.fmtCountdown(left);
      cd.classList.toggle("is-soon", left < 120000);
    }
    if (cdChip) {
      cdChip.textContent = SP.fmtCountdown(left);
      cdChip.classList.toggle("is-soon", left < 120000);
    }

    /* simulated rival bidders keep the room alive (capped) */
    if (Date.now() >= oppNext && oppCount < 8) {
      oppCount++;
      oppNext = Date.now() + 30000 + Math.floor(Math.random() * 30000);
      doBid(minNext(), OPP_WHO[oppCount % OPP_WHO.length], false);
      render();
      applyProxy();
    }
  }

  /* ---------- boot ---------- */
  var root = document.getElementById("detail-root");
  if (!A) {
    root.innerHTML = '<div class="empty">' + SP.t("common.empty") +
      ' — <a href="auctions.html">' + SP.t("nav.auctions") + "</a></div>";
    document.title = SP.t("nav.auctions") + " — " + SP.t("brand.ministry");
    return;
  }
  oppNext = Date.now() + 25000;
  build();
  SP.onChange.push(function () { build(); });
  setInterval(tick, 1000);
})();
