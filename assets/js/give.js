/* =========================================================================
   Give page — one-tap PayPal giving.
   Card details never touch this site; PayPal handles the payment itself.
   Reads everything from window.PARISH.giving (see assets/js/config.js).
   ========================================================================= */

(function () {
  "use strict";
  const G = window.PARISH.giving;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const state = { amount: G.presetAmounts[1] || 50, fund: G.funds[0], monthly: false };
  const configured = Boolean(G.paypal.hostedButtonId || G.paypal.businessEmail);

  /* ----- funds ----- */
  const fundSel = $("#fund");
  G.funds.forEach((f, i) => {
    const opt = document.createElement("option");
    opt.value = f.id; opt.textContent = f.label; if (i === 0) opt.selected = true;
    fundSel.appendChild(opt);
  });
  fundSel.addEventListener("change", () => {
    state.fund = G.funds.find((f) => f.id === fundSel.value) || G.funds[0];
    $("#fund-note").textContent = state.fund.note;
    sync();
  });
  $("#fund-note").textContent = state.fund.note;

  /* ----- amounts ----- */
  const grid = $("#amounts");
  const custom = $("#custom-amount");
  G.presetAmounts.forEach((a) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "amount-btn"; b.textContent = "$" + a;
    b.setAttribute("aria-pressed", String(a === state.amount));
    b.addEventListener("click", () => { state.amount = a; custom.value = ""; sync(); });
    grid.insertBefore(b, grid.querySelector(".amount-custom"));
  });
  custom.addEventListener("input", () => {
    const v = parseFloat(custom.value);
    if (!isNaN(v) && v > 0) state.amount = Math.round(v * 100) / 100;
    sync();
  });

  /* ----- frequency ----- */
  $$("#freq button").forEach((b) => {
    b.addEventListener("click", () => { state.monthly = b.dataset.freq === "monthly"; sync(); });
  });

  /* ----- PayPal link ----- */
  function paypalUrl() {
    const itemName = state.fund.label + (state.monthly ? " (monthly gift)" : "") +
      " — " + window.PARISH.fullName;
    if (G.paypal.hostedButtonId) {
      const u = new URL("https://www.paypal.com/donate/");
      u.searchParams.set("hosted_button_id", G.paypal.hostedButtonId);
      u.searchParams.set("amount", state.amount.toFixed(2));
      return u.toString();
    }
    if (G.paypal.businessEmail) {
      const u = new URL("https://www.paypal.com/donate/");
      u.searchParams.set("business", G.paypal.businessEmail);
      u.searchParams.set("amount", state.amount.toFixed(2));
      u.searchParams.set("currency_code", G.paypal.currency || "USD");
      u.searchParams.set("item_name", itemName);
      u.searchParams.set("no_recurring", "0");
      return u.toString();
    }
    return null;
  }

  function validAmount() { return state.amount >= 1 && state.amount <= 25000; }

  function sync() {
    // amount buttons
    $$(".amount-btn", grid).forEach((b) => {
      b.setAttribute("aria-pressed", String(b.textContent === "$" + state.amount && !custom.value));
    });
    // frequency
    $$("#freq button").forEach((b) =>
      b.setAttribute("aria-pressed", String((b.dataset.freq === "monthly") === state.monthly)));
    // summary + CTA
    const amt = validAmount() ? "$" + (Number.isInteger(state.amount) ? state.amount : state.amount.toFixed(2)) : "—";
    $("#give-summary").textContent = amt + " · " + state.fund.label + " · " + (state.monthly ? "Monthly" : "One-time");
    const cta = $("#give-btn");
    if (!configured) {
      cta.setAttribute("aria-disabled", "true");
      cta.removeAttribute("href");
      $("#give-setup-note").hidden = false;
    } else if (!validAmount()) {
      cta.setAttribute("aria-disabled", "true");
      cta.removeAttribute("href");
    } else {
      cta.removeAttribute("aria-disabled");
      cta.href = paypalUrl();
    }
    // monthly guidance (PayPal shows its own “make this monthly” checkbox)
    $("#monthly-hint").hidden = !state.monthly || !configured;
    // fund note for hosted-button flow (no item_name passthrough)
    $("#fund-hint").hidden = !(configured && G.paypal.hostedButtonId && state.fund.id !== G.funds[0].id);
  }

  $("#give-btn").addEventListener("click", (e) => {
    if ($("#give-btn").getAttribute("aria-disabled") === "true") {
      e.preventDefault();
      toast(configured ? "Please enter an amount of at least $1." :
        "Online giving is nearly ready — see the other ways to give below.");
    }
  });

  /* ----- other ways to give (config-driven) ----- */
  function fillOptional(id, value, hrefPrefix) {
    const row = $(id);
    if (!row) return;
    if (!value) { row.hidden = true; return; }
    const slot = row.querySelector("[data-value]");
    slot.textContent = value;
    if (hrefPrefix && slot.tagName === "A") slot.href = hrefPrefix + value;
  }
  fillOptional("#way-zelle", G.zelle);
  fillOptional("#way-venmo", G.venmo);
  $("#checks-payable").textContent = G.checksPayableTo;

  sync();
})();
