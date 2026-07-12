/* =========================================================================
   St. Anthony the Great Orthodox Church — SITE CONFIGURATION
   =========================================================================
   This is the ONE file the parish office edits. Every page reads from it.
   After editing, just save and re-deploy — no build step required.
   ========================================================================= */

window.PARISH = {
  name: "St. Anthony the Great",
  fullName: "St. Anthony the Great Orthodox Christian Church",
  jurisdiction: "Antiochian Orthodox Christian Archdiocese of North America",
  diocese: "Diocese of Wichita and Mid-America",
  pastor: "Fr. Anthony Baba",

  address: {
    street: "7202 FM 2920",
    city: "Spring",
    state: "TX",
    zip: "77379",
    // Used for map links ("Get Directions")
    mapQuery: "St. Anthony the Great Orthodox Church, 7202 FM 2920, Spring, TX 77379",
  },

  phone: "(281) 251-6000",

  // Parish office email. Leave "" to hide email everywhere (forms will
  // show the phone number instead). Example: "office@stanthonythegreat.org"
  email: "",

  officeHours: [
    { days: "Monday", hours: "Closed" },
    { days: "Tuesday – Thursday", hours: "9:00 AM – 4:00 PM" },
    { days: "Friday", hours: "9:00 AM – Noon" },
  ],

  timeZone: "America/Chicago",

  /* ----------------------------------------------------------------------
     WEEKLY SERVICES
     day: 0=Sunday … 6=Saturday.  time: 24h "HH:MM" local (America/Chicago)
     ---------------------------------------------------------------------- */
  services: [
    { day: 6, time: "17:00", name: "Great Vespers", durationMin: 60 },
    { day: 0, time: "09:00", name: "Orthros (Matins)", durationMin: 60 },
    { day: 0, time: "10:00", name: "Divine Liturgy", durationMin: 90 },
  ],
  scheduleNote:
    "Feast-day Liturgies, Vespers, and Lenten services are announced weekly — see the parish calendar and bulletin.",

  /* ----------------------------------------------------------------------
     ONLINE GIVING — PayPal
     ----------------------------------------------------------------------
     The parish already has a PayPal account (it's used on the current
     website). To activate one-tap giving here, fill in EITHER:

       hostedButtonId — from PayPal: Log in → Pay & Get Paid → PayPal
                        buttons → your Donate button → the code contains
                        hosted_button_id=XXXXXXXXXX  (best option: supports
                        PayPal's recurring/monthly checkbox)

       businessEmail  — the email of the parish PayPal account (fallback;
                        builds a classic donate link with amount prefilled)

     Leave both "" and the Give page shows a friendly "coming online soon"
     state with the other ways to give — nothing breaks.
     ---------------------------------------------------------------------- */
  giving: {
    paypal: {
      hostedButtonId: "",
      businessEmail: "",
      currency: "USD",
    },
    // Optional extras — shown on the Give page only if filled in.
    zelle: "",        // e.g. "giving@stanthonythegreat.org"
    venmo: "",        // e.g. "@StAnthonySpring"
    checksPayableTo: "St. Anthony the Great Orthodox Church",
    funds: [
      { id: "general",  label: "General Fund & Tithe", note: "Supports worship, ministries, clergy, and daily parish life" },
      { id: "building", label: "Building Fund",        note: "Caring for and expanding our parish home" },
      { id: "memorial", label: "Memorials & Thanksgiving", note: "In memory of a loved one, or in thanksgiving" },
      { id: "candles",  label: "Candles & Altar Offerings", note: "Candles, prosphora, altar flowers and supplies" },
    ],
    presetAmounts: [25, 50, 100, 250],
  },

  /* ----------------------------------------------------------------------
     FORMS (prayer requests, newsletter, contact)
     ----------------------------------------------------------------------
     Point these at a form endpoint (Formspree, Basin, Netlify Forms, etc.)
     e.g. "https://formspree.io/f/xxxxxxx". If left "", the form falls back
     to opening an email (when `email` above is set) or shows the office
     phone number. Nothing is ever silently dropped.
     ---------------------------------------------------------------------- */
  forms: {
    prayerEndpoint: "",
    newsletterEndpoint: "",
  },

  social: {
    facebook: "https://www.facebook.com/stanthonyspringtx/",
    youtube: "https://www.youtube.com/@stanthonythegreat7202",
    // Livestream link shown on Home ("Watch live"). YouTube channel by default.
    live: "https://www.youtube.com/@stanthonythegreat7202/streams",
  },

  links: {
    archdiocese: "https://www.antiochian.org/",
    dailyReadings: "https://www.antiochian.org/liturgicday",
    currentSite: "https://www.stanthonythegreat.org/",
    calendarPage: "https://www.stanthonythegreat.org/calendar",
  },

  ministries: [
    { name: "Church School", desc: "Sunday catechism for children and youth, September through May." },
    { name: "Teen SOYO", desc: "Fellowship, service, and faith for teens of the archdiocese." },
    { name: "Antiochian Women", desc: "Service, hospitality, and sisterhood in Christ." },
    { name: "Young Adult Ministry", desc: "Community and study for college students and young professionals." },
    { name: "Choir & Chanters", desc: "Lead the parish in the sung prayer of the Church." },
    { name: "Altar Servers", desc: "Boys and men serving in the holy altar." },
  ],
};
