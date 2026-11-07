/* Governorate hub: directory (no ?g) + per-governorate page (?g=…) */
(function () {
  "use strict";

  var SP = window.SP;
  var D = window.PLATE_DATA;
  var UI = window.PLATE_UI;

  function counts(govId) {
    var a = 0, m = 0;
    D.AUCTIONS.forEach(function (x) { if (x.gov === govId) a++; });
    D.MARKET_SEED.forEach(function (x) { if (x.gov === govId) m++; });
    return { a: a, m: m, total: a + m };
  }

  function renderDirectory() {
    var t = SP.t;
    document.title = t("gov.title") + " — " + t("brand.ministry");
    return (
      '<div class="page-head">' +
      '<span class="eyebrow">' + t("nav.governorates") + "</span>" +
      "<h1>" + t("gov.title") + "</h1>" +
      '<p class="lead">' + t("gov.sub") + "</p>" +
      "</div>" +
      '<div class="grid grid-4">' +
      D.GOVS.map(function (g) {
        var c = counts(g.id);
        return (
          '<a class="card gov-card" href="governorate.html?g=' + g.id + '">' +
          '<div class="gc-body">' +
          "<h3>" + (SP.state.lang === "ar" ? g.ar : g.en) + "</h3>" +
          '<div class="gc-count">' + SP.numDigits(String(c.total)) + " " + t("gov.count") + "</div>" +
          "</div></a>"
        );
      }).join("") +
      "</div>"
    );
  }

  function renderHub(gov) {
    var t = SP.t;
    var name = SP.state.lang === "ar" ? gov.ar : gov.en;
    var c = counts(gov.id);
    var auctions = D.AUCTIONS.filter(function (a) { return a.gov === gov.id; });
    var market = D.MARKET_SEED.filter(function (m) { return m.gov === gov.id; });
    return (
      '<a class="back-link" href="governorate.html">← ' + t("common.back") + "</a>" +
      '<div class="gov-banner"><h1>' + name + "</h1>" +
      "<p>" + SP.numDigits(String(c.total)) + " " + t("gov.count") + " — " +
      SP.numDigits(String(c.a)) + " " + t("nav.auctions") + " · " +
      SP.numDigits(String(c.m)) + " " + t("nav.marketplace") + "</p></div>" +
      "<section><h2>" + t("gov.auctions") + "</h2>" +
      (auctions.length
        ? '<div class="grid grid-3">' + auctions.map(UI.auctionCardHTML).join("") + "</div>"
        : '<div class="empty">' + t("common.empty") + "</div>") +
      "</section>" +
      '<section class="section"><h2>' + t("gov.market") + "</h2>" +
      (market.length
        ? '<div class="grid grid-3">' + market.map(function (m) { return UI.listingCardHTML(m, {}); }).join("") + "</div>"
        : '<div class="empty">' + t("common.empty") + "</div>") +
      "</section>"
    );
  }

  function render() {
    var root = document.getElementById("gov-root");
    var params = new URLSearchParams(window.location.search);
    var g = params.get("g");
    if (!g) {
      root.innerHTML = renderDirectory();
    } else {
      var gov = null;
      for (var i = 0; i < D.GOVS.length; i++) if (D.GOVS[i].id === g) gov = D.GOVS[i];
      if (!gov) {
        root.innerHTML = '<div class="empty">' + SP.t("common.empty") +
          ' — <a href="governorate.html">' + SP.t("gov.title") + "</a></div>";
        document.title = SP.t("gov.title") + " — " + SP.t("brand.ministry");
        return;
      }
      root.innerHTML = renderHub(gov);
      document.title = (SP.state.lang === "ar" ? gov.ar : gov.en) + " — " + SP.t("gov.title") + " — " + SP.t("brand.ministry");
    }
  }

  SP.onChange.push(render);
  render();
  SP.startTicker();
})();
