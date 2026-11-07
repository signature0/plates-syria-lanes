/* Results dashboard: season KPIs, revenue by governorate, full auction log */
(function () {
  "use strict";

  var SP = window.SP;
  var D = window.PLATE_DATA;

  function render() {
    document.title = SP.t("res.title") + " — " + SP.t("brand.ministry");
    var rows = D.RESULTS.slice();
    var total = 0, lots = rows.length;
    var byGov = {};
    rows.forEach(function (r) {
      total += r.hammer;
      byGov[r.gov] = (byGov[r.gov] || 0) + r.hammer;
    });
    var avg = lots ? Math.round(total / lots) : 0;
    var topGov = "";
    var topVal = -1;
    Object.keys(byGov).forEach(function (g) {
      if (byGov[g] > topVal) { topVal = byGov[g]; topGov = g; }
    });

    document.getElementById("dash-revenue").textContent = SP.fmtSYP(total);
    document.getElementById("dash-lots").textContent = SP.numDigits(String(lots));
    document.getElementById("dash-avg").textContent = SP.fmtSYP(avg);
    document.getElementById("dash-top").textContent = SP.govName(topGov);

    /* bars: top 7 governorates by revenue */
    var bars = Object.keys(byGov).map(function (g) {
      return { g: g, v: byGov[g] };
    }).sort(function (a, b) { return b.v - a.v; }).slice(0, 7);
    var max = bars.length ? bars[0].v : 1;
    document.getElementById("res-bars").innerHTML = bars.map(function (b) {
      var pct = Math.round((b.v / max) * 100);
      return '<div class="bar-row"><span>' + SP.govName(b.g) + '</span>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="bar-val">' + SP.fmtSYP(b.v) + "</span></div>";
    }).join("");

    /* table: all closed auctions (10) */
    var tb = document.querySelector("#res-table tbody");
    tb.innerHTML = rows.map(function (r) {
      return "<tr>" +
        "<td>" + SP.fmtDate(r.date) + "</td>" +
        "<td>" + SP.govName(r.gov) + "</td>" +
        '<td><div class="ac-plate" style="width:170px">' + window.PLATE_UI.plateSVG({ gov: r.gov, number: r.number }) + "</div></td>" +
        "<td>" + SP.fmtSYP(r.start) + "</td>" +
        '<td><strong>' + SP.fmtSYP(r.hammer) + "</strong></td>" +
        "<td>" + r.buyer + "</td></tr>";
    }).join("");
  }

  SP.onChange.push(render);
  render();
})();
