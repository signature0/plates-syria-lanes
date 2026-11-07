/* Lane A — app core: state, i18n, toggles, formatting, ticker.
   Classic scripts (no modules) so the site works from file://. */
(function () {
  "use strict";

  var AR = "٠١٢٣٤٥٦٧٨٩";

  /* localStorage with in-memory fallback (file:// in some engines, private mode) */
  var memStore = {};
  var haveLS = false;
  try { localStorage.setItem("__sp_test", "1"); localStorage.removeItem("__sp_test"); haveLS = true; } catch (e) { haveLS = false; }

  function lsGet(key, fallback) {
    if (haveLS) {
      try {
        var v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { /* fall through to memory */ }
    }
    return key in memStore ? memStore[key] : fallback;
  }
  function lsSet(key, val) {
    memStore[key] = val;
    if (haveLS) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ } }
  }

  var SP = {
    state: {
      lang: lsGet("sp.lang", "ar"),
      nums: lsGet("sp.nums", "ar") /* 'ar' = ١٢٣ , 'en' = 123 */
    },
    onChange: [],

    /* ---------- i18n ---------- */
    t: function (key) {
      var dict = window.I18N[SP.state.lang] || window.I18N.ar;
      return dict[key] !== undefined ? dict[key] : (window.I18N.ar[key] !== undefined ? window.I18N.ar[key] : key);
    },

    applyI18n: function () {
      var lang = SP.state.lang;
      var dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", dir);

      var nodes = document.querySelectorAll("[data-i18n]");
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].textContent = SP.t(nodes[i].getAttribute("data-i18n"));
      }
      var ph = document.querySelectorAll("[data-i18n-ph]");
      for (var j = 0; j < ph.length; j++) {
        ph[j].setAttribute("placeholder", SP.t(ph[j].getAttribute("data-i18n-ph")));
      }
      var aria = document.querySelectorAll("[data-i18n-aria]");
      for (var k = 0; k < aria.length; k++) {
        aria[k].setAttribute("aria-label", SP.t(aria[k].getAttribute("data-i18n-aria")));
      }
      var title = document.querySelector("title[data-i18n]");
      if (title) document.title = SP.t(title.getAttribute("data-i18n"));

      var bl = document.getElementById("btn-lang");
      if (bl) {
        bl.textContent = SP.t("lang.btn");
        bl.setAttribute("aria-label", SP.t("toggle.lang"));
      }
      var nb = document.getElementById("btn-nums");
      if (nb) {
        nb.textContent = SP.state.nums === "ar" ? SP.t("nums.btn.en") : SP.t("nums.btn.ar");
        nb.setAttribute("aria-label", SP.t("toggle.nums"));
      }
    },

    emit: function () {
      SP.onChange.forEach(function (fn) {
        try { fn(); } catch (e) { /* page callback error must not kill core */ }
      });
    },

    /* ---------- numerals ---------- */
    numDigits: function (str) {
      var s = String(str);
      if (SP.state.nums === "en") return s;
      return s.replace(/[0-9]/g, function (d) { return AR[+d]; });
    },

    fmtInt: function (n) {
      var s = Math.round(Number(n)).toString();
      var neg = s.charAt(0) === "-";
      if (neg) s = s.slice(1);
      var out = "";
      while (s.length > 3) {
        out = "," + s.slice(-3) + out;
        s = s.slice(0, -3);
      }
      s = s + out;
      if (neg) s = "-" + s;
      if (SP.state.nums === "ar") s = SP.numDigits(s.replace(/,/g, "٬"));
      return s;
    },

    fmtSYP: function (n) {
      return SP.fmtInt(n) + " " + SP.t("cur");
    },

    fmtDate: function (iso) {
      /* iso = YYYY-MM-DD */
      var p = iso.split("-");
      var s = p.length === 3 ? (p[2] + "/" + p[1] + "/" + p[0]) : iso;
      return SP.numDigits(s);
    },

    fmtCountdown: function (ms, endedLabel) {
      if (ms <= 0) return endedLabel || SP.t("card.ended");
      var s = Math.floor(ms / 1000);
      var h = Math.floor(s / 3600);
      var m = Math.floor((s % 3600) / 60);
      var sec = s % 60;
      var mm = (m < 10 ? "0" : "") + m;
      var ss = (sec < 10 ? "0" : "") + sec;
      var txt = h > 0 ? (h + ":" + mm + ":" + ss) : (mm + ":" + ss);
      return SP.numDigits(txt);
    },

    /* ---------- governorates ---------- */
    govAr: function (id) { return window.PLATE_UI.govById(id).ar; },
    govName: function (id) {
      var g = window.PLATE_UI.govById(id);
      return SP.state.lang === "ar" ? g.ar : g.en;
    },

    toast: function (msg, type) { window.PLATE_UI.toast(msg, type); },

    /* ---------- watchlist ---------- */
    watchSet: function () { return lsGet("sp.watch", []); },
    toggleWatch: function (id) {
      var set = SP.watchSet();
      var i = set.indexOf(id);
      var on;
      if (i === -1) { set.push(id); on = true; } else { set.splice(i, 1); on = false; }
      lsSet("sp.watch", set);
      var btns = document.querySelectorAll('[data-watch="' + id + '"]');
      for (var b = 0; b < btns.length; b++) {
        btns[b].setAttribute("aria-pressed", String(on));
        btns[b].setAttribute("aria-label", SP.t(on ? "card.watching" : "card.watch"));
      }
      SP.toast(SP.t(on ? "toast.watch.on" : "toast.watch.off"));
    },

    /* ---------- user / KYC mock ---------- */
    user: function () {
      return lsGet("sp.user", {
        verified: true,
        name: "user.demo",
        deposit: 5000000
      });
    },
    saveUser: function (u) { lsSet("sp.user", u); },

    /* ---------- countdown ticker for list pages ---------- */
    _tick: null,
    startTicker: function () {
      if (SP._tick) return;
      function run() {
        var els = document.querySelectorAll("[data-countdown]");
        var now = Date.now();
        for (var i = 0; i < els.length; i++) {
          var el = els[i];
          var ts = parseInt(el.getAttribute("data-countdown"), 10) || 0;
          var left = ts - now;
          el.textContent = SP.fmtCountdown(left, el.getAttribute("data-ended-label"));
          el.classList.toggle("is-soon", left > 0 && left < 120000);
          el.classList.toggle("is-ended", left <= 0);
        }
      }
      run();
      SP._tick = setInterval(run, 1000);
    },

    /* ---------- site chrome (header + footer, injected once) ---------- */
    NAV: [
      { href: "index.html", key: "nav.home", id: "home" },
      { href: "auctions.html", key: "nav.auctions", id: "auctions" },
      { href: "governorate.html", key: "nav.governorates", id: "governorates" },
      { href: "marketplace.html", key: "nav.marketplace", id: "marketplace" },
      { href: "tools.html", key: "nav.tools", id: "tools" },
      { href: "results.html", key: "nav.results", id: "results" }
    ],

    chromeHeader: function (page) {
      var t = SP.t;
      var nav = SP.NAV.map(function (n) {
        var cur = n.id === page ? ' aria-current="page"' : "";
        return '<a href="' + n.href + '"' + cur + ' data-i18n="' + n.key + '">' + t(n.key) + "</a>";
      }).join("");
      var header =
        '<header class="site-header">' +
        '<div class="container header-top">' +
        '<a class="brand" href="index.html">' +
        '<svg class="brand-emblem" width="42" height="42" viewBox="0 0 48 48" aria-hidden="true">' +
        '<circle cx="24" cy="24" r="22" fill="#0f2e24" stroke="#b8963e" stroke-width="2.5"/>' +
        '<circle cx="24" cy="24" r="16.5" fill="none" stroke="#b8963e" stroke-width="1"/>' +
        '<polygon points="24,12 26.96,19.92 35.41,20.29 26.96,25.55 31.05,33.71 24,29.04 16.95,33.71 21.04,25.55 12.59,20.29 21.04,19.92" fill="#b8963e"/>' +
        "</svg>" +
        '<span class="brand-text"><strong data-i18n="brand.ministry">' + t("brand.ministry") + "</strong>" +
        '<small data-i18n="brand.bureau">' + t("brand.bureau") + "</small></span>" +
        "</a>" +
        '<div class="header-actions">' +
        '<button id="btn-lang" class="toggle-btn" type="button" data-i18n-aria="toggle.lang" aria-label="' + t("toggle.lang") + '">' + t("lang.btn") + "</button>" +
        '<button id="btn-nums" class="toggle-btn" type="button" data-i18n-aria="toggle.nums" aria-label="' + t("toggle.nums") + '">' + (SP.state.nums === "ar" ? t("nums.btn.en") : t("nums.btn.ar")) + "</button>" +
        '<button id="btn-menu" class="menu-btn" type="button" aria-expanded="false" data-i18n-aria="nav.menu" aria-label="' + t("nav.menu") + '">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' +
        "</button></div></div>" +
        '<nav id="site-nav" class="site-nav" aria-label="main"><div class="container">' + nav +
        '<a href="register.html" class="nav-cta" data-i18n="nav.register">' + t("nav.register") + "</a>" +
        "</div></nav></header>";
      return header;
    },

    chromeFooter: function () {
      var t = SP.t;
      var footer =
        '<footer class="site-footer"><div class="container footer-grid">' +
        "<div>" +
        '<div class="footer-brand">' +
        '<svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">' +
        '<circle cx="24" cy="24" r="22" fill="#0a241c" stroke="#b8963e" stroke-width="2.5"/>' +
        '<polygon points="24,12 26.96,19.92 35.41,20.29 26.96,25.55 31.05,33.71 24,29.04 16.95,33.71 21.04,25.55 12.59,20.29 21.04,19.92" fill="#b8963e"/>' +
        "</svg>" +
        "<div><strong data-i18n=\"brand.ministry\">" + t("brand.ministry") + "</strong><br>" +
        '<small data-i18n="brand.bureau">' + t("brand.bureau") + "</small></div></div>" +
        '<p class="mb-0" style="font-size:var(--fs-sm)" data-i18n="footer.tagline">' + t("footer.tagline") + "</p>" +
        "</div>" +
        "<div><h4 data-i18n=\"footer.quick\">" + t("footer.quick") + "</h4>" +
        '<ul class="footer-links">' +
        '<li><a href="auctions.html" data-i18n="nav.auctions">' + t("nav.auctions") + "</a></li>" +
        '<li><a href="governorate.html" data-i18n="nav.governorates">' + t("nav.governorates") + "</a></li>" +
        '<li><a href="marketplace.html" data-i18n="nav.marketplace">' + t("nav.marketplace") + "</a></li>" +
        '<li><a href="tools.html" data-i18n="nav.tools">' + t("nav.tools") + "</a></li>" +
        '<li><a href="results.html" data-i18n="nav.results">' + t("nav.results") + "</a></li>" +
        '<li><a href="packages.html" data-i18n="pkg.title">' + t("pkg.title") + "</a></li>" +
        '<li><a href="gift.html" data-i18n="gift.title">' + t("gift.title") + "</a></li>" +
        "</ul></div>" +
        "<div><h4 data-i18n=\"footer.contacts\">" + t("footer.contacts") + "</h4>" +
        '<ul class="footer-contact">' +
        '<li><span class="lbl" data-i18n="footer.email">' + t("footer.email") + '</span><a href="mailto:vip.plates@mot.gov.sy" dir="ltr">vip.plates@mot.gov.sy</a></li>' +
        '<li><span class="lbl" data-i18n="footer.phone">' + t("footer.phone") + '</span><span dir="ltr">+963 11 000 0000</span></li>' +
        '<li><span class="lbl" data-i18n="footer.address">' + t("footer.address") + '</span><span data-i18n="footer.address.val">' + t("footer.address.val") + "</span></li>" +
        "</ul></div>" +
        '<div><h4 data-i18n="footer.hours">' + t("footer.hours") + "</h4>" +
        '<ul class="footer-contact"><li data-i18n="footer.hours.val">' + t("footer.hours.val") + "</li></ul></div>" +
        "</div>" +
        '<div class="container footer-bar">' +
        '<span data-i18n="footer.rights">' + t("footer.rights") + "</span>" +
        '<span class="footer-note" data-i18n="footer.prototype">' + t("footer.prototype") + "</span>" +
        "</div></footer>";
      return footer;
    },

    /* ---------- boot ---------- */
    init: function () {
      var hdr = document.getElementById("hdr");
      if (hdr) hdr.outerHTML = SP.chromeHeader(document.body.getAttribute("data-page") || "");
      var ftr = document.getElementById("ftr");
      if (ftr) ftr.outerHTML = SP.chromeFooter();
      SP.applyI18n();

      var bl = document.getElementById("btn-lang");
      if (bl) {
        bl.addEventListener("click", function () {
          SP.state.lang = SP.state.lang === "ar" ? "en" : "ar";
          lsSet("sp.lang", SP.state.lang);
          SP.applyI18n();
          SP.emit();
        });
      }
      var nb = document.getElementById("btn-nums");
      if (nb) {
        nb.addEventListener("click", function () {
          SP.state.nums = SP.state.nums === "ar" ? "en" : "ar";
          lsSet("sp.nums", SP.state.nums);
          SP.applyI18n();
          SP.emit();
        });
      }
      var mb = document.getElementById("btn-menu");
      if (mb) {
        mb.addEventListener("click", function () {
          var nav = document.getElementById("site-nav");
          var open = nav.classList.toggle("is-open");
          mb.setAttribute("aria-expanded", String(open));
        });
      }

      /* delegated watch buttons */
      document.addEventListener("click", function (ev) {
        var w = ev.target && ev.target.closest ? ev.target.closest("[data-watch]") : null;
        if (w) SP.toggleWatch(w.getAttribute("data-watch"));
      });
    }
  };

  window.SP = SP;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { SP.init(); });
  } else {
    SP.init();
  }
})();
