/* Family packages (bundles) */
(function () {
  "use strict";

  var SP = window.SP;
  var D = window.PLATE_DATA;
  var UI = window.PLATE_UI;

  function render() {
    document.title = SP.t("pkg.title") + " — " + SP.t("brand.ministry");
    document.getElementById("pkg-grid").innerHTML = D.PACKAGES.map(function (p) {
      var name = SP.state.lang === "ar" ? p.nameAr : p.nameEn;
      return (
        '<div class="card pkg-card card-pad">' +
        '<div class="ac-meta" style="margin-bottom:var(--sp-2)">' +
        '<span class="mode-badge mode-fixed">' + SP.t("pkg." + p.kind) + "</span>" +
        '<span class="chip">' + SP.govName(p.gov) + "</span></div>" +
        "<h2>" + name + "</h2>" +
        '<div class="pkg-plates">' + p.plates.map(function (n) {
          return "<span>" + SP.numDigits(n) + "</span>";
        }).join("") + "</div>" +
        '<div class="pkg-price">' + SP.fmtSYP(p.price) + "</div>" +
        '<button class="btn btn-primary btn-block" type="button" data-req="' + p.id + '">' + SP.t("pkg.cta") + "</button>" +
        "</div>"
      );
    }).join("");
  }

  document.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest("[data-req]") : null;
    if (b) UI.toast(SP.t("pkg.sent"));
  });

  SP.onChange.push(render);
  render();
})();
