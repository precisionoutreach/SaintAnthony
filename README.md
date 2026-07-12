# St. Anthony the Great Orthodox Church — Website & Parish App

A mobile-first website **and installable app** for [St. Anthony the Great
Orthodox Christian Church](https://www.stanthonythegreat.org/) in Spring, Texas
(Antiochian Orthodox Christian Archdiocese, Diocese of Wichita and Mid-America).

One codebase, no build step, no framework, no database — plain HTML/CSS/JS that
any static host serves for free, and that parishioners can install on their
phones like a native app.

## What's inside

| Page | What it does |
|---|---|
| `index.html` | Home — live **next-service countdown**, quick actions, schedule, upcoming feasts |
| `visit.html` | Plan Your Visit — first-Sunday walkthrough, honest FAQs for newcomers |
| `about.html` | Parish story (1982 → today), Fr. Anthony, our patron saint, the Archdiocese |
| `services.html` | Weekly services + a **computed Orthodox liturgical calendar** (Pascha and the movable cycle are calculated for any year — nothing to update annually) |
| `give.html` | **Tithes & donations via PayPal** — funds, preset/custom amounts, one-time or monthly |
| `connect.html` | Prayer requests, parish office info, email list, ministries, social links |
| `offline.html` | Shown by the app when there's no signal (schedule + phone still available) |

**App features:** installable PWA (Add to Home Screen on iOS / Install App on
Android), offline support via service worker, bottom tab bar navigation,
dark mode, add-services-to-calendar (`assets/services.ics`), one-tap
directions and calling.

## ⚙️ The one file to edit: `assets/js/config.js`

All parish-editable data lives in **`assets/js/config.js`** — contact info,
office hours, service times, funds, ministries, social links. Edit, save,
redeploy. Every page updates.

### 🟡 Activate online giving (do this first)

The Give page is fully built but ships **deliberately unconnected** — it shows
a friendly "online giving is nearly ready" notice until you add the parish's
real PayPal account. The parish already has PayPal (it's on the current
website); you just need one value:

1. Log in to the parish PayPal account → **Pay & Get Paid → PayPal buttons**
   → open your **Donate** button → copy the `hosted_button_id` value
   (looks like `ABCDE12345XYZ`).
2. In `assets/js/config.js`, paste it:

   ```js
   paypal: {
     hostedButtonId: "ABCDE12345XYZ",   // ← here
     businessEmail: "",
     currency: "USD",
   },
   ```

   *(No button ID handy? Set `businessEmail` to the parish PayPal email
   instead — that also enables fund designation to pass through
   automatically.)*
3. Redeploy. The Give button goes live, with amount prefill and PayPal's
   own monthly-donation option. Card numbers never touch this site — PayPal
   handles the entire payment.

Optional: set `zelle` / `venmo` in the same section and those rows appear on
the Give page automatically.

### Connect the forms (prayer requests & email list)

Forms are honest: with nothing configured they direct people to the office
phone — nothing is silently dropped. To take submissions online, create two
free forms at [Formspree](https://formspree.io) (or Basin, etc.) and paste the
endpoints:

```js
forms: {
  prayerEndpoint: "https://formspree.io/f/xxxxxxxx",
  newsletterEndpoint: "https://formspree.io/f/yyyyyyyy",
},
```

Also set `email: "office@..."` in config to enable email fallbacks and show
the office email on the Connect page.

## Deploying

Any static host works. Two easy paths:

- **GitHub Pages** — repo Settings → Pages → deploy from branch → done.
  (`.nojekyll` is already included.)
- **Netlify / Cloudflare Pages / Vercel** — "new site from Git", no build
  command, publish directory = repo root.

To use the real domain, point `www.stanthonythegreat.org` at the host
(CNAME) and it's live. All paths are relative, so the site also works from a
subpath while testing.

**After any edit**, bump the version string in `sw.js`
(`stanthony-v1.0.0` → `v1.0.1`) so installed apps refresh their offline cache
promptly. (Pages and `config.js` are network-first, so text/giving changes
reach phones immediately either way.)

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## For parishioners: installing the app

- **iPhone/iPad:** open the site in Safari → Share → **Add to Home Screen**.
- **Android:** open in Chrome → menu → **Install app** (or tap "Get the app"
  on the home page).

## Content note for the parish office

Parish facts (address, phone, schedule, history dates, clergy, ministries)
were drawn from the parish's public listings in July 2026. Please review
`assets/js/config.js` and the About/Visit pages once and adjust anything
that's changed — everything is plain text and safe to edit.

---

*Built with care for the parish of St. Anthony the Great. Christ is in our midst!*
