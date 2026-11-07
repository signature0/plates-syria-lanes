/* Landing page */
(function () {
  "use strict";

  function countUp(el, target) {
    if (!el) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.textContent = window.SP.fmtInt(target); return; }
    var t0 = null, dur = 900;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = window.SP.fmtInt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function renderStats() {
    var D = window.PLATE_DATA;
    var raised = 0;
    D.RESULTS.forEach(function (r) { raised += r.hammer; });
    countUp(document.getElementById("stat-auctions"), D.AUCTIONS.length);
    countUp(document.getElementById("stat-plates"), D.AUCTIONS.length + D.MARKET_SEED.length);
    countUp(document.getElementById("stat-raised"), raised);
    countUp(document.getElementById("stat-users"), 1284);
    /* step numbers respect numerals toggle */
    var nums = document.querySelectorAll("[data-num]");
    for (var i = 0; i < nums.length; i++) {
      nums[i].textContent = window.SP.numDigits(nums[i].getAttribute("data-num"));
    }
  }

  function renderUpcoming() {
    var grid = document.getElementById("upcoming-grid");
    if (!grid) return;
    var next = window.PLATE_DATA.AUCTIONS.slice().sort(function (a, b) {
      return a.endsAt - b.endsAt;
    }).slice(0, 4);
    grid.innerHTML = next.map(window.PLATE_UI.auctionCardHTML).join("");
  }

  function renderGovs() {
    var row = document.getElementById("gov-chips");
    if (!row) return;
    row.innerHTML = window.PLATE_DATA.GOVS.map(function (g) {
      var name = window.SP.state.lang === "ar" ? g.ar : g.en;
      return '<a class="filter-chip" style="cursor:pointer" href="governorate.html?g=' + g.id + '">' + name + "</a>";
    }).join("");
  }

  function render() {
    document.title = window.SP.t("nav.home") + " — " + window.SP.t("brand.ministry");
    renderStats();
    renderUpcoming();
    renderGovs();
  }

  window.SP.onChange.push(render);
  render();
  window.SP.startTicker();

  /* ---------- promo slider ---------- */
  (function () {
    var root = document.getElementById("promo-slider");
    if (!root) return;
    var track = root.querySelector(".hs-track");
    var slides = track.children, idx = 0, timer = null;
    var dots = root.querySelector(".hs-dots");
    for (var d = 0; d < slides.length; d++) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "slide " + (d + 1));
      (function (n) { b.addEventListener("click", function (ev) { ev.preventDefault(); ev.stopPropagation(); go(n); rest(); }); })(d);
      dots.appendChild(b);
    }
    function go(n) {
      idx = (n + slides.length) % slides.length;
      for (var q = 0; q < slides.length; q++) slides[q].classList.toggle("is-active", q === idx);
      var bs = dots.children;
      for (var k = 0; k < bs.length; k++) bs[k].setAttribute("aria-selected", k === idx ? "true" : "false");
    }
    function rest() { if (timer) clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 6000); }
    root.querySelector(".hs-next").addEventListener("click", function (ev) { ev.preventDefault(); ev.stopPropagation(); go(idx + 1); rest(); });
    root.querySelector(".hs-prev").addEventListener("click", function (ev) { ev.preventDefault(); ev.stopPropagation(); go(idx - 1); rest(); });
    root.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    root.addEventListener("mouseleave", rest);
    var sx = null;
    root.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 42) { go(idx + (dx < 0 ? 1 : -1)); rest(); }
      sx = null;
    }, { passive: true });
    go(0); rest();
  })();

})();
