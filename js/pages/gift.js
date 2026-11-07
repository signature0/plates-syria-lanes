/* Gift certificate: live preview + code generation (mock) */
(function () {
  "use strict";

  var SP = window.SP;
  var D = window.PLATE_DATA;
  var UI = window.PLATE_UI;

  var PREMIUM = ["77777", "99999", "55555", "00001", "11111", "44444", "88888", "12321"];

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

  SP.onChange.push(render);
  renderOptions();
  render();
})();
