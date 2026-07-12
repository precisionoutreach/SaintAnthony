/* =========================================================================
   Liturgical calendar engine
   -------------------------------------------------------------------------
   Computes Orthodox Pascha (Julian computus, projected onto the civil
   Gregorian calendar) and derives the movable feasts from it. Fixed feasts
   follow the New (Revised Julian) Calendar used by the Antiochian
   Archdiocese. Valid for civil years 1900–2099 (the +13-day Julian offset).
   ========================================================================= */

(function () {
  "use strict";

  /** Orthodox Pascha for a given year, as a UTC-midnight Date (Gregorian). */
  function pascha(year) {
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31); // 3 = March, 4 = April (Julian)
    const day = ((d + e + 114) % 31) + 1;         // Julian-calendar date
    // Julian → Gregorian: +13 days for 1900–2099
    return new Date(Date.UTC(year, month - 1, day + 13));
  }

  function addDays(date, days) {
    return new Date(date.getTime() + days * 86400000);
  }

  /** All notable days for one civil year, unsorted. */
  function yearFeasts(year) {
    const P = pascha(year);
    const fixed = (m, d, name, kind, note) => ({
      date: new Date(Date.UTC(year, m - 1, d)), name, kind, note,
    });
    const movable = (offset, name, kind, note) => ({
      date: addDays(P, offset), name, kind, note,
    });

    return [
      // ——— Movable cycle (relative to Pascha) ———
      movable(-70, "Triodion Begins", "season", "Publican & Pharisee — the Church turns toward Great Lent"),
      movable(-56, "Meatfare Sunday", "season", "Sunday of the Last Judgment — farewell to meat"),
      movable(-49, "Forgiveness Sunday", "season", "Cheesefare — mutual forgiveness before the Fast"),
      movable(-48, "Great Lent Begins", "fast", "Clean Monday — the Fast of the Forty Days"),
      movable(-8,  "Lazarus Saturday", "feast", "Christ raises Lazarus from the dead"),
      movable(-7,  "Palm Sunday", "great", "The Entrance of our Lord into Jerusalem"),
      movable(-2,  "Great & Holy Friday", "fast", "The Crucifixion and Burial of our Lord"),
      movable(0,   "GREAT AND HOLY PASCHA", "pascha", "The Resurrection of our Lord Jesus Christ — the Feast of Feasts"),
      movable(39,  "Ascension of our Lord", "great", "Christ ascends in glory, forty days after Pascha"),
      movable(49,  "Pentecost", "great", "The descent of the Holy Spirit — the birthday of the Church"),
      movable(56,  "Apostles' Fast Begins", "fast", "Monday after All Saints, through June 28"),

      // ——— Fixed feasts (New Calendar) ———
      fixed(1, 6,  "Theophany of our Lord", "great", "The Baptism of Christ and Great Blessing of Waters"),
      fixed(1, 17, "ST. ANTHONY THE GREAT", "patronal", "Our patronal feast — the Father of Monastics, c. 251–356"),
      fixed(2, 2,  "Presentation of our Lord", "great", "The Meeting of Christ in the Temple"),
      fixed(3, 25, "Annunciation to the Theotokos", "great", "Gabriel announces the Incarnation"),
      fixed(8, 1,  "Dormition Fast Begins", "fast", "Two weeks of preparation, August 1–14"),
      fixed(8, 6,  "Transfiguration of our Lord", "great", "Christ shines with uncreated light on Tabor"),
      fixed(8, 15, "Dormition of the Theotokos", "great", "The falling-asleep of the Mother of God"),
      fixed(9, 8,  "Nativity of the Theotokos", "great", "The birth of the Mother of God"),
      fixed(9, 14, "Elevation of the Holy Cross", "great", "The universal exaltation of the precious Cross"),
      fixed(11, 15, "Nativity Fast Begins", "fast", "Forty days of preparation for Christmas"),
      fixed(11, 21, "Entrance of the Theotokos", "great", "The Virgin enters the Temple"),
      fixed(12, 25, "Nativity of our Lord", "great", "Christmas — God becomes man"),
    ];
  }

  /**
   * The next `count` notable days on/after `fromDate` (a Date; compared at
   * UTC midnight granularity), looking across year boundaries.
   */
  function upcomingFeasts(fromDate, count) {
    const from = Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate());
    const y = fromDate.getUTCFullYear();
    const all = [...yearFeasts(y), ...yearFeasts(y + 1)]
      .filter((f) => f.date.getTime() >= from)
      .sort((a, b) => a.date - b.date);
    return all.slice(0, count);
  }

  window.Liturgical = { pascha, yearFeasts, upcomingFeasts };
})();
