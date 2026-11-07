/* Gift certificate: live preview + code generation (mock) */
(function () {
  "use strict";

  var SP = window.SP;
  var D = window.PLATE_DATA;
  var UI = window.PLATE_UI;

  var PREMIUM = D.AUCTIONS.filter(function (a) { return a.status !== "closed"; }).map(function (a) { return a.number; });
  ["77777", "99999", "55555", "00001", "11111", "44444", "88888", "12321"].forEach(function (n) { if (PREMIUM.indexOf(n) === -1) PREMIUM.push(n); });

  var state = {
    name: "",
    gov: "damascus",
    plate: "77777",
    msg: "",
    code: ""
  };

  function genCode() {
    var abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var s = "";
    for (var i = 0; i < 6; i++) s += abc.charAt(Math.floor(Math.random() * abc.length));
    return "GFT-" + s;
  }

  function certHTML() {
    var t = SP.t;
    var today = new Date();
    var iso = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
    var seal =
      '<svg class="cert-seal" width="72" height="72" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="22" fill="#0f2e24" stroke="#b8963e" stroke-width="2.5"/>' +
      '<circle cx="24" cy="24" r="16.5" fill="none" stroke="#b8963e" stroke-width="1"/>' +
      '<polygon points="' + UI.starPoints(24, 24, 11) + '" fill="#b8963e"/>' +
      "</svg>";
    return (
      '<div class="certificate">' +
      '<div class="cert-sub">' + t("cert.honor") + "</div>" +
      '<div class="cert-title">' + t("cert.gift") + "</div>" +
      '<p style="margin-bottom:var(--sp-4);color:var(--c-gray-700)">' + t("cert.presented") + "</p>" +
      '<div class="cert-name">' + (state.name || "—") + "</div>" +
      '<div class="cert-plate">' + UI.plateSVG({ gov: state.gov, number: state.plate }) + "</div>" +
      (state.msg ? '<div class="cert-msg">“' + state.msg + "”</div>" : "") +
      '<div class="cert-foot">' +
      "<div>" +
      '<div><strong>' + t("cert.from") + "</strong></div>" +
      '<div style="margin-top:4px">' + t("cert.date") + ": " + SP.fmtDate(iso) + "</div>" +
      '<div>' + t("cert.no") + ': <span dir="ltr"><strong>' + (state.code || "••••••") + "</strong></span></div>" +
      "</div>" + seal +
      "</div></div>"
    );
  }

  function render() {
    document.title = SP.t("gift.title") + " — " + SP.t("brand.ministry");
    document.getElementById("cert-root").innerHTML = certHTML();
  }

  function renderOptions() {
    var gsel = document.getElementById("gift-gov");
    gsel.innerHTML = D.GOVS.map(function (g) {
      return '<option value="' + g.id + '">' + (SP.state.lang === "ar" ? g.ar : g.en) + "</option>";
    }).join("");
    gsel.value = state.gov;

    var psel = document.getElementById("gift-plate");
    psel.innerHTML = PREMIUM.map(function (n) {
      return '<option value="' + n + '">' + SP.numDigits(n) + "</option>";
    }).join("");
    psel.value = state.plate;
  }

  document.getElementById("gift-name").addEventListener("input", function (e) {
    state.name = e.target.value;
    document.querySelector(".cert-name").textContent = state.name || "—";
  });
  document.getElementById("gift-msg").addEventListener("input", function (e) {
    state.msg = e.target.value;
    render();
  });
  document.getElementById("gift-gov").addEventListener("change", function (e) {
    state.gov = e.target.value;
    render();
  });
  document.getElementById("gift-plate").addEventListener("change", function (e) {
    state.plate = e.target.value;
    render();
  });
  document.getElementById("gift-gen").addEventListener("click", function () {
    state.code = genCode();
    render();
    UI.toast(SP.t("cert.no") + ": " + state.code);
  });


  /* ---- PO directive: "surprise" mode — birthday/pattern search with gifting options ---- */
  var SURPRISE = (new URLSearchParams(location.search).get("mode") === "surprise");

  function isTaken(num) {
    for (var i = 0; i < D.AUCTIONS.length; i++) if (D.AUCTIONS[i].number === num) return true;
    for (var j = 0; j < D.RESULTS.length; j++) if (D.RESULTS[j].number === num) return true;
    return false;
  }


  function nearNumber(base, step) {
    /* nearest available 5-digit number to base (skips taken ones) */
    var n = parseInt(base, 10);
    for (var d = 0; d < 400; d++) {
      var up = String(n + d).padStart(5, "0").slice(-5);
      if (!isTaken(up)) return up;
      var dn = String(Math.max(0, n - d)).padStart(5, "0").slice(-5);
      if (!isTaken(dn)) return dn;
    }
    return null;
  }

  function surpriseSearch(dateIso, pattern) {
    var results = [];
    if (dateIso && dateIso.length === 10) {
      var p = dateIso.split("-");
      var m = ("0" + p[1]).slice(-2), dd = ("0" + p[2]).slice(-2);
      var bases = [
        (p[0] + m + dd).slice(-5),
        m + dd + p[0].slice(-1),
        p[0].slice(-1) + m + dd
      ];
      bases.forEach(function (b) {
        /* a birthday gift should keep the exact date when possible — prefer
           showing the literal number, availability is flagged honestly */
        var avail = b;
        if (avail && !results.some(function (r) { return r.number === avail; }))
          results.push({ number: avail, why: "bd", pattern: "" });
      });
    }
    if (pattern) {
      var want = { rep5: /^(\d)\1{4}$/, rep4: /^(?:(\d)\1{3}|\d(\d)\2{3})$/, rep3: /(?:(\d)\1{2})/, pal: /^(\d)(\d)\3?\2\1$|^\d{5}$/ };
      var pool = D.AUCTIONS.filter(function (a) { return a.status !== "closed"; });
      var pick = [];
      if (pattern === "rep5") pick = pool.filter(function (a) { return want.rep5.test(a.number); });
      else if (pattern === "rep4") pick = pool.filter(function (a) { return want.rep4.test(a.number) && !want.rep5.test(a.number); });
      else if (pattern === "rep3") pick = pool.filter(function (a) { return want.rep3.test(a.number); });
      else if (pattern === "pal") pick = pool.filter(function (a) { var n=a.number; return n[0]===n[4] && n[1]===n[3]; });
      else if (pattern === "seq") pick = pool.filter(function (a) { var n=a.number.split("").map(Number); for(var i=1;i<5;i++){if((n[i-1]+1)%10!==n[i])return false;}return true; });
      pick.slice(0, 4).forEach(function (a) { if (!results.some(function (r) { return r.number === a.number; })) results.push({ number: a.number, why: "pat", pattern: pattern, id: a.id, gov: a.gov }); });
    }
    return results.slice(0, 6);
  }

  function surpriseUI() {
    var t = SP.t;
    var box = document.createElement("section");
    box.className = "card";
    box.style.marginBottom = "var(--sp-5)";
    box.innerHTML =
      '<h2 style="margin-top:0">' + t("surprise.title") + "</h2>" +
      '<p class="text-muted" style="margin-top:0">' + t("surprise.sub") + "</p>" +
      '<div class="grid grid-3" style="align-items:end;gap:14px">' +
      '<div><label for="sp-date">' + t("surprise.date") + '</label><input class="input" type="date" id="sp-date"></div>' +
      '<div><label for="sp-pat">' + t("surprise.pattern") + '</label><select class="input" id="sp-pat">' +
      '<option value="">' + t("surprise.pattern.any") + '</option>' +
      '<option value="rep5">' + t("surprise.pattern.rep5") + '</option>' +
      '<option value="rep4">' + t("surprise.pattern.rep4") + '</option>' +
      '<option value="rep3">' + t("surprise.pattern.rep3") + '</option>' +
      '<option value="pal">' + t("surprise.pattern.pal") + '</option>' +
      '<option value="seq">' + t("surprise.pattern.seq") + "</option>" +
      "</select></div>" +
      '<button class="btn btn-gold" id="sp-go" type="button">' + t("surprise.go") + "</button>" +
      "</div>" +
      '<div id="sp-results" style="margin-top:var(--sp-4)"></div>';
    var main = document.querySelector(".page > .grid, .page") || document.querySelector("main .container");
    main.insertBefore(box, main.firstChild);

    document.getElementById("sp-go").addEventListener("click", function () {
      var d = document.getElementById("sp-date").value;
      var pat = document.getElementById("sp-pat").value;
      var res = surpriseSearch(d, pat);
      var out = document.getElementById("sp-results");
      if (!res.length) { out.innerHTML = '<p class="text-muted">' + t("surprise.empty") + "</p>"; return; }
      out.innerHTML = '<div class="grid grid-3">' + res.map(function (r) {
        var a = r.id ? D.AUCTIONS.filter(function (x) { return x.id === r.id; })[0] : null;
        var price = a ? SP.fmtSYP(a.currentBid || a.reserve || 1500000) : SP.fmtSYP(1800000 + parseInt(r.number, 10) % 900 * 25000);
        return '<div class="card" style="text-align:center">' + UI.plateSVG({ gov: r.gov || "damascus", number: r.number }) +
          '<p style="margin:8px 0 4px;font-size:var(--fs-sm)">' + (r.why === "bd" ? t("surprise.why.bd") : t("surprise.why.pat")) + "</p>" +
          '<strong dir="ltr">' + price + "</strong><br>" +
          '<button class="btn btn-outline btn-sm gift-pick" data-num="' + r.number + '" style="margin-top:8px" type="button">' + t("surprise.pick") + "</button></div>";
      }).join("") + "</div>";
      out.querySelectorAll(".gift-pick").forEach(function (b) {
        b.addEventListener("click", function () {
          var n = b.getAttribute("data-num");
          if (PREMIUM.indexOf(n) === -1) PREMIUM.unshift(n);
          var hit = D.AUCTIONS.filter(function (x) { return x.number === n; })[0];
          state.plate = n; if (hit) state.gov = hit.gov;
          renderOptions(); render();
          UI.toast(t("surprise.picked") + ": " + SP.numDigits(n));
          document.getElementById("gift-name").focus();
        });
      });
    });
    if (SURPRISE) setTimeout(function () { var g = document.getElementById("sp-go"); if (g) g.scrollIntoView({ behavior: "smooth", block: "center" }); }, 300);
  }

  SP.onChange.push(render);
  surpriseUI();
})();
