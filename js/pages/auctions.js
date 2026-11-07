/* Auctions list page */
(function () {
  "use strict";

  var SP = window.SP;
  var D = window.PLATE_DATA;
  var UI = window.PLATE_UI;

  var state = { q: "", gov: "", pat: "all", sort: "ending" };

  function normNum(s) {
    return String(s).replace(/[\u0660-\u0669]/g, function (d) {
      return "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669".indexOf(d);
    });
  }

  function filtered() {
    var list = D.AUCTIONS.filter(function (a) {
      if (state.gov && a.gov !== state.gov) return false;
      if (state.pat !== "all" && UI.patternKey(a.number) !== state.pat) return false;
      if (state.q) {
        var q = normNum(state.q);
        if (a.number.indexOf(q) === -1) return false;
      }
      return true;
    });
    list.sort(function (x, y) {
      if (state.sort === "highest") return y.current - x.current;
      if (state.sort === "lowest") return x.current - y.current;
      return x.endsAt - y.endsAt;
    });
    return list;
  }

  function render() {
    document.title = SP.t("auctions.title") + " — " + SP.t("brand.ministry");
    var grid = document.getElementById("auctions-grid");
    var empty = document.getElementById("f-empty");
    var list = filtered();
    grid.innerHTML = list.map(UI.auctionCardHTML).join("");
    empty.style.display = list.length ? "none" : "";
    document.getElementById("f-count").innerHTML =
      "<strong>" + SP.numDigits(String(list.length)) + "</strong> " + SP.t("common.results");
  }

  function renderGovOptions() {
    var sel = document.getElementById("f-gov");
    var cur = sel.value;
    sel.innerHTML = '<option value="">' + SP.t("gov.all") + "</option>" +
      D.GOVS.map(function (g) {
        return '<option value="' + g.id + '">' + (SP.state.lang === "ar" ? g.ar : g.en) + "</option>";
      }).join("");
    sel.value = cur;
  }

  document.getElementById("f-search").addEventListener("input", function (e) {
    state.q = e.target.value.trim();
    render();
  });
  document.getElementById("f-gov").addEventListener("change", function (e) {
    state.gov = e.target.value;
    render();
  });
  document.getElementById("f-pattern").addEventListener("change", function (e) {
    state.pat = e.target.value;
    render();
  });
  document.getElementById("f-sort").addEventListener("change", function (e) {
    state.sort = e.target.value;
    render();
  });

  SP.onChange.push(render);
  renderGovOptions();
  render();
  SP.startTicker();
})();
