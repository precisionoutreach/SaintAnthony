/* =========================================================================
   Connect page — prayer requests + newsletter.
   Honest delivery: POSTs to the endpoint configured in config.js; if none,
   falls back to composing an email; if no email either, points to the
   office phone. A request is never silently dropped.
   ========================================================================= */

(function () {
  "use strict";
  const P = window.PARISH;
  const $ = (s, r) => (r || document).querySelector(s);

  function mode(endpoint) {
    if (endpoint) return "endpoint";
    if (P.email) return "mailto";
    return "phone";
  }

  async function postForm(endpoint, data) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
  }

  /* ---------- prayer requests ---------- */
  const prayer = $("#prayer-form");
  if (prayer) {
    const m = mode(P.forms.prayerEndpoint);
    if (m === "phone") {
      $("#prayer-fallback").hidden = false;
      prayer.querySelector("button[type=submit]").disabled = true;
    }
    prayer.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        formType: "Prayer request",
        name: $("#pr-name").value.trim(),
        email: $("#pr-email").value.trim(),
        intention: prayer.querySelector("input[name=intention]:checked").value,
        request: $("#pr-text").value.trim(),
      };
      if (!data.request) { toast("Please write the names or request to be prayed for."); return; }
      const btn = prayer.querySelector("button[type=submit]");
      if (m === "endpoint") {
        btn.disabled = true; btn.textContent = "Sending…";
        try {
          await postForm(P.forms.prayerEndpoint, data);
          prayer.reset();
          $("#prayer-done").hidden = false;
          prayer.hidden = true;
        } catch (_) {
          toast("Couldn’t send just now — please try again, or call the office at " + P.phone + ".");
        } finally { btn.disabled = false; btn.textContent = "Send prayer request"; }
      } else if (m === "mailto") {
        const body = "Intention: " + data.intention + "\n" +
          (data.name ? "From: " + data.name + "\n" : "") +
          (data.email ? "Email: " + data.email + "\n" : "") +
          "\n" + data.request;
        location.href = "mailto:" + P.email +
          "?subject=" + encodeURIComponent("Prayer request") +
          "&body=" + encodeURIComponent(body);
      }
    });
  }

  /* ---------- newsletter ---------- */
  const news = $("#news-form");
  if (news) {
    const m = mode(P.forms.newsletterEndpoint);
    if (m === "phone") {
      $("#news-fallback").hidden = false;
      news.querySelector("button").disabled = true;
    }
    news.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("#news-email").value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast("Please enter a valid email address."); return; }
      if (m === "endpoint") {
        const btn = news.querySelector("button");
        btn.disabled = true;
        try {
          await postForm(P.forms.newsletterEndpoint, { formType: "Newsletter signup", email });
          news.reset();
          toast("You’re on the list — welcome!");
        } catch (_) {
          toast("Couldn’t sign you up just now — please try again later.");
        } finally { btn.disabled = false; }
      } else if (m === "mailto") {
        location.href = "mailto:" + P.email +
          "?subject=" + encodeURIComponent("Newsletter signup") +
          "&body=" + encodeURIComponent("Please add me to the parish email list: " + email);
      }
    });
  }

  /* ---------- contact card fills ---------- */
  const emailRow = $("#contact-email");
  if (emailRow) {
    if (P.email) {
      const a = emailRow.querySelector("a");
      a.textContent = P.email; a.href = "mailto:" + P.email;
    } else emailRow.hidden = true;
  }

  const hours = $("#office-hours");
  if (hours) {
    hours.innerHTML = P.officeHours
      .map((h) => "<tr><th scope=\"row\">" + h.days + "</th><td>" + h.hours + "</td></tr>")
      .join("");
  }

  const minGrid = $("#ministries");
  if (minGrid) {
    minGrid.innerHTML = P.ministries
      .map((m) => '<div class="card card-flat"><h3>' + m.name + '</h3><p class="muted small" style="margin:0">' + m.desc + "</p></div>")
      .join("");
  }
})();
