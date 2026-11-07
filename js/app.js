/* Lane A — app core: state, i18n, toggles, formatting, ticker.
   Classic scripts (no modules) so the site works from file://. */
(function () {
  "use strict";

  var AR = "٠١٢٣٤٥٦٧٨٩";

  function lsGet(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ }
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

    /* ---------- boot ---------- */
    init: function () {
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
  SP.init();
})();
