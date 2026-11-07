/* Registration: 3-step mock flow (identity -> deposit -> approved) */
(function () {
  "use strict";

  var SP = window.SP;
  var D = window.PLATE_DATA;
  var UI = window.PLATE_UI;

  var REQUIRED_DEPOSIT = 2000000;
  var current = 1;

  function toDigits(str) {
    var AR = "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669";
    return String(str).replace(/[\u0660-\u0669]/g, function (c) { return AR.indexOf(c); });
  }

  function showStep(n) {
    current = n;
    document.getElementById("step-1").style.display = n === 1 ? "" : "none";
    document.getElementById("step-2").style.display = n === 2 ? "" : "none";
    document.getElementById("step-3").style.display = n === 3 ? "" : "none";
    var sts = document.querySelectorAll("#stepper .st");
    for (var i = 0; i < sts.length; i++) {
      var s = parseInt(sts[i].getAttribute("data-st"), 10);
      sts[i].classList.toggle("is-active", s === n);
      sts[i].classList.toggle("is-done", s < n);
    }
  }

  function validate1() {
    var name = document.getElementById("r-name").value.trim();
    var phone = toDigits(document.getElementById("r-phone").value).trim();
    var email = document.getElementById("r-email").value.trim();
    var doc = toDigits(document.getElementById("r-docnum").value).trim();
    var ok = name.length >= 5 && /^09\d{8}$/.test(phone) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && doc.length === 10;
    document.getElementById("reg-err").style.display = ok ? "none" : "";
    return ok;
  }

  function doneHTML() {
    var t = SP.t;
    var u = SP.user();
    var rail = (document.querySelector('input[name="r-rail"]:checked') || {}).value || "bank";
    var ref = "REG-" + Date.now().toString(36).toUpperCase().slice(-6);
    var seal =
      '<svg class="seal" width="84" height="84" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="22" fill="#0f2e24" stroke="#b8963e" stroke-width="2.5"/>' +
      '<circle cx="24" cy="24" r="16.5" fill="none" stroke="#b8963e" stroke-width="1"/>' +
      '<polygon points="' + UI.starPoints(24, 24, 11) + '" fill="#b8963e"/>' +
      "</svg>";
    return (
      '<div class="done-panel">' + seal +
      '<h2>' + t("reg.done.title") + "</h2>" +
      '<p style="color:var(--c-gray-700)">' + t("reg.done.d") + "</p>" +
      '<p><span class="chip chip-ok">' + t("reg.verified") + "</span></p>" +
      '<p class="text-muted" style="margin-top:var(--sp-3)">' +
      t("reg.name") + ": <strong>" + (u.name || "—") + "</strong><br>" +
      t("reg.deposit.amt") + ": <strong>" + SP.fmtSYP(u.deposit || 0) + "</strong><br>" +
      t("cert.no") + ': <strong dir="ltr">' + ref + "</strong></p>" +
      '<p style="margin-top:var(--sp-4)"><a class="btn btn-gold" href="auctions.html">' + t("reg.done.cta") + "</a></p>" +
      "</div>"
    );
  }

  document.getElementById("btn-next1").addEventListener("click", function () {
    if (validate1()) showStep(2);
  });
  document.getElementById("btn-back2").addEventListener("click", function () {
    showStep(1);
  });
  document.getElementById("btn-pay").addEventListener("click", function () {
    var raw = toDigits(document.getElementById("r-deposit").value);
    var amt = parseInt(raw.replace(/[^\d]/g, ""), 10) || 0;
    var err = document.getElementById("reg-err2");
    if (amt < REQUIRED_DEPOSIT) {
      err.textContent = SP.t("detail.deposit.req") + " " + SP.fmtSYP(REQUIRED_DEPOSIT);
      err.style.display = "";
      return;
    }
    err.style.display = "none";
    var name = document.getElementById("r-name").value.trim();
    SP.saveUser({ verified: true, name: name, deposit: amt });
    UI.toast(SP.t("reg.paid"));
    showStep(3);
    document.getElementById("step-3").innerHTML = doneHTML();
  });

  SP.onChange.push(function () {
    if (current === 3) document.getElementById("step-3").innerHTML = doneHTML();
  });

  showStep(1);
})();
