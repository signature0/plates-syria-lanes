/* Editions page: Golden & Royal Black pricing */
(function () {
  "use strict";
  var SP = window.SP, C = window.PLATE_UI, D = window.PLATE_DATA;
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* Fixed price table (SYP) by digit count — scarcity curve.
     ≤3 digits: launch offer (golden). >3 digits: much higher per PO rule. */
  var PRICE = {
    golden: { 1: 250000000, 2: 180000000, 3: 120000000, 4: 420000000, 5: 750000000 },
    royal:  { 1: 350000000, 2: 260000000, 3: 170000000, 4: 580000000, 5: 980000000 }
  };
  var LAUNCH = { golden: 0.25, royal: 0.30 }; /* launch discount % (≤3 digits) */

  function digitCount(n) { return String(n).length; }

  function priceRow(digits) {
    var g = PRICE.golden[digits], r = PRICE.royal[digits];
    var gNet = Math.round(g * (1 - LAUNCH.golden)), rNet = Math.round(r * (1 - LAUNCH.royal));
    var offer = digits <= 3;
    function money(v, was, on) {
      return on
        ? "<s class='ed-was'>" + SP.fmtSYP(was) + "</s> <strong>" + SP.fmtSYP(v) + "</strong> <span class='chip chip-gold'>" + SP.t("ed.launch") + "</span>"
        : "<strong>" + SP.fmtSYP(v) + "</strong>";
    }
    return "<tr><td>" + SP.t("ed.digits." + digits) + (offer ? " <span class='chip chip-green'>" + SP.t("ed.scarce") + "</span>" : "") + "</td>" +
      "<td>" + money(gNet, g, offer) + "</td><td>" + money(rNet, r, offer) + "</td></tr>";
  }

  function render() {
    var cards = [
      { ed: "golden", plate: { gov: "damascus", number: "777", edition: "golden" },
        t: SP.t("ed.gold.t"), d: SP.t("ed.gold.d"), from: PRICE.golden[3], off: LAUNCH.golden },
      { ed: "royal", plate: { gov: "damascus", number: "007", edition: "royal" },
        t: SP.t("ed.roy.t"), d: SP.t("ed.roy.d"), from: PRICE.royal[3], off: LAUNCH.royal }
    ];
    document.getElementById("ed-cards").innerHTML = cards.map(function (c) {
      var net = Math.round(c.from * (1 - c.off));
      return "<article class='card ed-card ed-" + (c.ed === "golden" ? "gold" : "royal") + "' data-reveal>" +
        C.plateSVG(c.plate, { cls: "ed-hero-plate" }) +
        "<h3>" + esc(c.t) + "</h3><p class='text-muted'>" + esc(c.d) + "</p>" +
        "<div class='ed-price'><s>" + SP.fmtSYP(c.from) + "</s> <strong>" + SP.fmtSYP(net) + "</strong>" +
        "<span class='chip chip-gold'>" + SP.t("ed.launch") + " · ٣ خانات فأقل</span></div>" +
        "<a class='btn btn-" + (c.ed === "golden" ? "gold" : "primary") + "' href='auctions.html'>" + SP.t("ed.pick") + "</a>" +
        "</article>";
    }).join("");

    document.getElementById("ed-pricing").innerHTML =
      "<thead><tr><th>" + SP.t("ed.th.digits") + "</th><th>" + SP.t("nav.editions.golden") + "</th><th>" + SP.t("nav.editions.royal") + "</th></tr></thead>" +
      "<tbody>" + [1, 2, 3, 4, 5].map(priceRow).join("") + "</tbody>";

  }
  render();
  window.SP.onChange.push(render);
})();
