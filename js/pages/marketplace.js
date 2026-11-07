/* Marketplace: 3 listing modes, offer form, pattern + governorate filters,
   user listings (localStorage), buy/sold mock. */
(function () {
  "use strict";

  var SP = window.SP;
  var D = window.PLATE_DATA;
  var UI = window.PLATE_UI;

  var MKT = {
    userListings: function () { return SP.ls.get("sp.listings", []); },
    saveUserListings: function (l) { SP.ls.set("sp.listings", l); },
    soldSet: function () { return SP.ls.get("sp.sold", []); },
    markSold: function (id) { var s = MKT.soldSet(); if (s.indexOf(id) === -1) s.push(id); SP.ls.set("sp.sold", s); },
    offers: function () { return SP.ls.get("sp.offers", {}); },
    saveOffer: function (id, o) { var m = MKT.offers(); m[id] = o; SP.ls.set("sp.offers", m); },
    all: function () { return D.MARKET_SEED.concat(MKT.userListings()); },
    getListing: function (id) {
      var all = MKT.all();
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
      return null;
    }
  };
  window.MKT = MKT;

  var state = { pat: "all", gov: "" };

  function parseNum(str) {
    var clean = String(str).replace(/[^0-9\u0660-\u0669]/g, "");
    clean = clean.replace(/[\u0660-\u0669]/g, function (d) {
      return "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669".indexOf(d);
    });
    return clean;
  }
  function parseMoney(str) { return parseInt(parseNum(str), 10) || 0; }

  function filtered() {
    return MKT.all().filter(function (l) {
      if (state.gov && l.gov !== state.gov) return false;
      if (state.pat !== "all" && UI.patternKey(l.number) !== state.pat) return false;
      return true;
    });
  }

  function render() {
    document.title = SP.t("mkt.title") + " — " + SP.t("brand.ministry");
    var grid = document.getElementById("mkt-grid");
    var empty = document.getElementById("mkt-empty");
    var sold = MKT.soldSet();
    var offers = MKT.offers();
    var list = filtered();
    grid.innerHTML = list.map(function (l) {
      return UI.listingCardHTML(l, {
        actions: true,
        sold: sold.indexOf(l.id) !== -1,
        pending: !!offers[l.id]
      });
    }).join("");
    empty.style.display = list.length ? "none" : "";
    document.getElementById("m-count").innerHTML =
      "<strong>" + SP.numDigits(String(list.length)) + "</strong> " + SP.t("common.results");

    var mine = MKT.userListings();
    var myRoot = document.getElementById("my-listings");
    myRoot.innerHTML = mine.length
      ? '<div class="grid grid-3">' + mine.map(function (l) {
          return "<div>" + UI.listingCardHTML(l, { actions: false }) +
            '<div class="mt-4"><button class="btn btn-ghost btn-sm" type="button" data-remove="' + l.id + '">' +
            SP.t("common.remove") + "</button></div></div>";
        }).join("") + "</div>"
      : '<p class="text-muted">' + SP.t("mkt.your.empty") + "</p>";
  }

  function renderGovOptions() {
    var sel = document.getElementById("m-gov");
    var cur = sel.value;
    sel.innerHTML = '<option value="">' + SP.t("gov.all") + "</option>" +
      D.GOVS.map(function (g) {
        return '<option value="' + g.id + '">' + (SP.state.lang === "ar" ? g.ar : g.en) + "</option>";
      }).join("");
    sel.value = cur;

    var lsel = document.getElementById("l-gov");
    lsel.innerHTML = D.GOVS.map(function (g) {
      return '<option value="' + g.id + '">' + (SP.state.lang === "ar" ? g.ar : g.en) + "</option>";
    }).join("");
  }

  function currentMode() {
    var r = document.querySelector('input[name="l-mode"]:checked');
    return r ? r.value : "fixed";
  }

  function syncModeFields() {
    var mode = currentMode();
    var fields = document.querySelectorAll("[data-mode]");
    for (var i = 0; i < fields.length; i++) {
      fields[i].style.display = fields[i].getAttribute("data-mode").indexOf(mode) !== -1 ? "" : "none";
    }
  }

  function showErr(show) {
    var el = document.getElementById("mkt-err");
    el.style.display = show ? "" : "none";
    if (show) el.textContent = SP.t("mkt.err");
  }

  function publish(e) {
    e.preventDefault();
    var num = parseNum(document.getElementById("l-num").value);
    var price = parseMoney(document.getElementById("l-price").value);
    var inc = parseMoney(document.getElementById("l-increment").value);
    var seller = document.getElementById("l-seller").value.trim();
    var endRaw = document.getElementById("l-end").value;
    var mode = currentMode();
    var endsAt = endRaw ? new Date(endRaw + "T12:00:00").getTime() : 0;

    var ok = num.length === 5 && seller.length > 0;
    if (ok) {
      for (var i = 0; i < MKT.all().length; i++) {
        if (MKT.all()[i].number === num) { ok = false; break; }
      }
    }
    if (ok && (mode === "fixed" || mode === "auction")) ok = price > 0;
    if (ok && mode === "auction") ok = endsAt > Date.now() && inc > 0;

    if (!ok) { showErr(true); return; }
    showErr(false);

    var listing = {
      id: "U-" + Date.now(),
      gov: document.getElementById("l-gov").value,
      number: num,
      mode: mode,
      seller: seller,
      mine: true
    };
    if (mode === "fixed") listing.price = price;
    if (mode === "auction") { listing.price = price; listing.endsAt = endsAt; listing.increment = inc; }

    var mine = MKT.userListings();
    mine.push(listing);
    MKT.saveUserListings(mine);
    document.getElementById("l-num").value = "";
    document.getElementById("l-price").value = "";
    document.getElementById("l-increment").value = "";
    document.getElementById("l-seller").value = "";
    document.getElementById("l-end").value = "";
    UI.toast(SP.t("mkt.published"));
    render();
  }

  /* ---------- events ---------- */
  document.querySelectorAll("#mkt-pats [data-pat]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      state.pat = chip.getAttribute("data-pat");
      document.querySelectorAll("#mkt-pats [data-pat]").forEach(function (c) {
        c.setAttribute("aria-pressed", String(c === chip));
      });
      render();
    });
  });
  document.getElementById("m-gov").addEventListener("change", function (e) {
    state.gov = e.target.value;
    render();
  });
  document.querySelectorAll('input[name="l-mode"]').forEach(function (r) {
    r.addEventListener("change", syncModeFields);
  });
  document.getElementById("publish-form").addEventListener("submit", publish);

  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;

    var buy = t.closest("[data-buy]");
    if (buy) {
      MKT.markSold(buy.getAttribute("data-buy"));
      UI.toast(SP.t("mkt.buy.done"));
      render();
      return;
    }
    var off = t.closest("[data-offer]");
    if (off) {
      var form = document.querySelector('[data-offerform="' + off.getAttribute("data-offer") + '"]');
      if (form) form.style.display = form.style.display === "none" ? "" : "none";
      return;
    }
    var osub = t.closest("[data-offersubmit]");
    if (osub) {
      var id2 = osub.getAttribute("data-offersubmit");
      var form2 = document.querySelector('[data-offerform="' + id2 + '"]');
      var amt = parseMoney(form2 ? form2.querySelector("input").value : "");
      if (!amt) { UI.toast(SP.t("mkt.offer.invalid"), "warn"); return; }
      var msg = form2.querySelector("textarea") ? form2.querySelector("textarea").value.trim() : "";
      MKT.saveOffer(id2, { amount: amt, msg: msg, at: Date.now() });
      UI.toast(SP.t("mkt.offer.sent"));
      render();
      return;
    }
    var rem = t.closest("[data-remove]");
    if (rem) {
      var id3 = rem.getAttribute("data-remove");
      var mine = MKT.userListings().filter(function (l) { return l.id !== id3; });
      MKT.saveUserListings(mine);
      UI.toast(SP.t("mkt.removed"));
      render();
    }
  });

  /* min date for auction end */
  (function () {
    var today = new Date();
    var iso = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
    var el = document.getElementById("l-end");
    if (el) el.min = iso;
  })();

  SP.onChange.push(render);
  renderGovOptions();
  syncModeFields();
  render();
  SP.startTicker();
})();
