/* =========================================================================
   Shared app logic: next-service countdown, schedule render, feasts,
   install prompt, service worker, toasts.  No dependencies.
   ========================================================================= */

(function () {
  "use strict";
  const P = window.PARISH;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------- time-zone helpers (parish local time, America/Chicago) ---- */

  function wallParts(tz, date) {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    });
    const p = Object.fromEntries(dtf.formatToParts(date).map((x) => [x.type, x.value]));
    return {
      y: +p.year, m: +p.month, d: +p.day,
      hh: p.hour === "24" ? 0 : +p.hour, mm: +p.minute, ss: +p.second,
    };
  }

  function tzOffsetMs(tz, date) {
    const w = wallParts(tz, date);
    return Date.UTC(w.y, w.m - 1, w.d, w.hh, w.mm, w.ss) - Math.floor(date.getTime() / 1000) * 1000;
  }

  /** UTC instant for a wall-clock time in `tz` (2-pass DST convergence). */
  function zonedToUtc(tz, y, m, d, hh, mm) {
    let ts = Date.UTC(y, m - 1, d, hh, mm);
    for (let i = 0; i < 2; i++) ts = Date.UTC(y, m - 1, d, hh, mm) - tzOffsetMs(tz, new Date(ts));
    return new Date(ts);
  }

  /** Upcoming service occurrences from the weekly schedule. */
  function nextServices(count) {
    const tz = P.timeZone, now = new Date(), w = wallParts(tz, now), out = [];
    for (let i = 0; i < 15; i++) {
      const day = new Date(Date.UTC(w.y, w.m - 1, w.d + i));
      for (const s of P.services) {
        if (s.day !== day.getUTCDay()) continue;
        const [hh, mm] = s.time.split(":").map(Number);
        const start = zonedToUtc(tz, day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), hh, mm);
        const end = start.getTime() + (s.durationMin || 60) * 60000;
        if (end > now.getTime()) out.push({ ...s, start });
      }
    }
    out.sort((a, b) => a.start - b.start);
    return out.slice(0, count);
  }

  function fmtTime(date) {
    return new Intl.DateTimeFormat("en-US", { timeZone: P.timeZone, hour: "numeric", minute: "2-digit" }).format(date);
  }
  function fmtDay(date) {
    return new Intl.DateTimeFormat("en-US", { timeZone: P.timeZone, weekday: "long" }).format(date);
  }

  function relativeLabel(svc) {
    const now = new Date();
    if (svc.start <= now) return "Happening now";
    const tz = P.timeZone, a = wallParts(tz, now), b = wallParts(tz, svc.start);
    const dayDiff = Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000);
    if (dayDiff === 0) return "Today";
    if (dayDiff === 1) return "Tomorrow";
    return "in " + dayDiff + " days";
  }

  /* ---------- widgets ---------- */

  function renderNextService() {
    const el = $("[data-next-service]");
    if (!el) return;
    const draw = () => {
      const list = nextServices(1);
      if (!list.length) { el.hidden = true; return; }
      const s = list[0];
      $("[data-ns-name]", el).textContent = s.name;
      $("[data-ns-when]", el).textContent =
        (relativeLabel(s) === "Today" ? "Today" : fmtDay(s.start)) + " · " + fmtTime(s.start);
      $("[data-ns-count]", el).textContent = relativeLabel(s);
      el.hidden = false;
    };
    draw();
    setInterval(draw, 60000);
  }

  function renderSchedule() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    $$("[data-schedule]").forEach((tbody) => {
      const rows = [...P.services]
        .sort((a, b) => (a.day === b.day ? a.time.localeCompare(b.time) : ((a.day + 6) % 7) - ((b.day + 6) % 7)))
        .map((s) => {
          const [hh, mm] = s.time.split(":").map(Number);
          const h12 = ((hh + 11) % 12) + 1, ampm = hh >= 12 ? "PM" : "AM";
          const t = h12 + ":" + String(mm).padStart(2, "0") + " " + ampm;
          return '<tr><th scope="row">' + days[s.day] + '</th><td class="t">' + t + "</td><td>" + s.name + "</td></tr>";
        });
      tbody.innerHTML = rows.join("");
    });
  }

  function renderFeasts() {
    $$("[data-feasts]").forEach((holder) => {
      const count = +holder.dataset.feasts || 3;
      const feasts = window.Liturgical.upcomingFeasts(new Date(), count);
      const mon = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
      const badge = { pascha: ["badge-gold", "Pascha"], patronal: ["badge-gold", "Our Feast"], great: ["badge-gold", "Great Feast"], fast: ["badge-wine", "Fast"], season: ["", "Season"], feast: ["", "Feast"] };
      holder.innerHTML = feasts.map((f) => {
        const [cls, label] = badge[f.kind] || ["", ""];
        return '<li class="feast feast--' + f.kind + '">' +
          '<span class="feast-date"><span class="m">' + mon.format(f.date) + '</span><span class="d">' + f.date.getUTCDate() + "</span></span>" +
          '<span><span class="feast-name">' + f.name + '</span><br><span class="feast-note">' + f.note + "</span></span>" +
          '<span class="badge ' + cls + '">' + label + "</span></li>";
      }).join("");
    });
  }

  function renderToday() {
    const el = $("[data-today]");
    if (!el) return;
    el.textContent = new Intl.DateTimeFormat("en-US", {
      timeZone: P.timeZone, weekday: "long", month: "long", day: "numeric", year: "numeric",
    }).format(new Date());
  }

  /* ---------- toast ---------- */
  let toastEl, toastTimer;
  window.toast = function (msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3800);
  };

  /* ---------- install ("Get the app") ---------- */
  let deferredPrompt = null;
  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $$("[data-install]").forEach((b) => (b.hidden = false));
  });

  function wireInstallButtons() {
    $$("[data-install]").forEach((btn) => {
      if (isStandalone()) { btn.hidden = true; return; }
      btn.addEventListener("click", async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
        } else {
          const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
          toast(ios
            ? "In Safari: tap the Share button, then “Add to Home Screen.”"
            : "In your browser menu, choose “Install app” / “Add to Home Screen.”");
        }
      });
    });
  }

  /* ---------- share ---------- */
  function wireShare() {
    $$("[data-share]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const data = { title: document.title, url: location.href };
        try {
          if (navigator.share) await navigator.share(data);
          else { await navigator.clipboard.writeText(location.href); toast("Link copied — share it with a friend."); }
        } catch (_) { /* user cancelled */ }
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  function wireReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) return; // stay visible
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          en.target.removeAttribute("data-armed");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08 });
    els.forEach((e) => { e.setAttribute("data-armed", ""); io.observe(e); });
  }

  /* ---------- service worker ---------- */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {/* offline support is progressive */});
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderNextService();
    renderSchedule();
    renderFeasts();
    renderToday();
    wireInstallButtons();
    wireShare();
    wireReveal();
    $$("[data-year]").forEach((e) => (e.textContent = new Date().getFullYear()));
    $$("[data-phone]").forEach((e) => { e.textContent = P.phone; if (e.tagName === "A") e.href = "tel:+1" + P.phone.replace(/\D/g, ""); });
    $$("[data-directions]").forEach((a) => { a.href = "https://maps.google.com/?q=" + encodeURIComponent(P.address.mapQuery); });
  });
})();
