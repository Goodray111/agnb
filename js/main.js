/* =========================================================
   Yinuo Fan Site — interaction script
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeBtn");
  var THEME_KEY = "yinuo-theme-v2";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) themeBtn.textContent = theme === "dark" ? "🌙" : "☀️";
  }

  var savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_KEY);
  } catch (e) {}

  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
  } else {
    applyTheme("light");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- In-page view switching (directory -> chapters) ---------- */
  var views = document.querySelectorAll(".view");
  var backHub = document.getElementById("backHub");
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function setActiveNav(id) {
    navAnchors.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + id);
    });
  }

  function showView(id) {
    if (!document.getElementById(id)) id = "home";
    views.forEach(function (v) {
      v.classList.toggle("is-active", v.id === id);
    });
    if (backHub) backHub.classList.toggle("show", id !== "home");
    setActiveNav(id);
    window.scrollTo(0, 0);
    var activeView = document.getElementById(id);
    if (activeView) {
      activeView.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("in");
      });
    }
    if (id === "stats") animateStats();
    try {
      history.replaceState(null, "", "#" + id);
    } catch (e) {}
  }

  document.querySelectorAll("[data-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showView(btn.getAttribute("data-target"));
    });
  });

  navAnchors.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      if (document.getElementById(id)) {
        e.preventDefault();
        showView(id);
      }
    });
  });

  if (location.hash) {
    var initialHash = location.hash.slice(1);
    if (document.getElementById(initialHash)) showView(initialHash);
  }

  /* ---------- Scroll reveal animation ---------- */
  if ("IntersectionObserver" in window) {
    var revealSelectors = [
      ".section-head",
      ".profile-card",
      ".about-text",
      ".tl-item",
      ".h-card",
      ".stat-card",
      ".hero-pool",
      ".g-tile",
      ".quote-card",
      ".message-wrap > *"
    ];
    var revealEls = document.querySelectorAll(revealSelectors.join(","));

    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  }

  /* ---------- Gallery full-size preview(see "Gallery lightbox" below) ---------- */

  /* ---------- Career timeline (accordion) ---------- */
  var accItems = document.querySelectorAll(".tl-acc-item");

  if (accItems.length) {
    accItems.forEach(function (item) {
      var head = item.querySelector(".tl-acc-head");
      if (!head) return;
      head.addEventListener("click", function () {
        var wasOpen = item.classList.contains("is-open");
        accItems.forEach(function (i) {
          i.classList.remove("is-open");
          var h = i.querySelector(".tl-acc-head");
          if (h) h.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          item.classList.add("is-open");
          head.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------- Signature heroes (click to switch) ---------- */
  var heroChips = document.querySelectorAll(".chip[data-hero]");
  var heroPanels = document.querySelectorAll(".hero-detail-panel");

  if (heroChips.length && heroPanels.length) {
    heroChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var key = chip.getAttribute("data-hero");
        heroChips.forEach(function (c) {
          c.classList.toggle("is-active", c === chip);
        });
        heroPanels.forEach(function (p) {
          p.classList.toggle("is-active", p.getAttribute("data-hero") === key);
        });
      });
    });
  }

  /* ---------- Video modal ---------- */
  var videoModal = document.getElementById("videoModal");
  var vmVideo = document.getElementById("vmVideo");
  var vmClose = document.getElementById("vmClose");

  var vmLink = document.getElementById("vmLink");

  function openVideo(src) {
    if (!videoModal || !vmVideo) return;
    if (src) {
      vmVideo.src = src;
      if (vmLink) vmLink.setAttribute("href", src);
    }
    videoModal.classList.add("open");
    videoModal.setAttribute("aria-hidden", "false");
    var p = vmVideo.play();
    if (p && p.catch) p.catch(function () {});
  }

  function closeVideo() {
    if (!videoModal || !vmVideo) return;
    vmVideo.pause();
    videoModal.classList.remove("open");
    videoModal.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll(".play-btn[data-video]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openVideo(btn.getAttribute("data-video"));
    });
  });
  if (vmClose) vmClose.addEventListener("click", closeVideo);
  if (videoModal) {
    videoModal.addEventListener("click", function (e) {
      if (e.target === videoModal) closeVideo();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeVideo();
  });

  /* ---------- Message board (local storage) ---------- */
  var msgForm = document.getElementById("msgForm");
  var msgList = document.getElementById("msgList");
  var MSG_KEY = "yinuo-messages";

  function loadMessages() {
    try {
      var raw = localStorage.getItem(MSG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveMessages(list) {
    try {
      localStorage.setItem(MSG_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function formatTime(ts) {
    var d = new Date(ts);
    var pad = function (n) { return String(n).padStart(2, "0"); };
    return pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderMessages() {
    if (!msgList) return;
    var list = loadMessages();

    if (!list.length) {
      msgList.innerHTML =
        '<div class="msg-item"><p style="color:var(--text-2)">No messages yet — leave the first word of support.</p></div>';
      return;
    }

    msgList.innerHTML = list
      .map(function (m) {
        return (
          '<article class="msg-item">' +
          "<header><strong>" +
          escapeHtml(m.name) +
          "</strong><time>" +
          formatTime(m.time) +
          "</time></header>" +
          "<p>" +
          escapeHtml(m.text) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  if (msgForm) {
    msgForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameEl = document.getElementById("msgName");
      var textEl = document.getElementById("msgText");
      var name = nameEl.value.trim();
      var text = textEl.value.trim();
      if (!name || !text) return;

      var list = loadMessages();
      list.unshift({ name: name, text: text, time: Date.now() });
      saveMessages(list);

      nameEl.value = "";
      textEl.value = "";
      renderMessages();
    });
  }

  renderMessages();

  /* ---------- Back to top ---------- */
  var backTop = document.getElementById("backTop");

  function onScroll() {
    if (!backTop) return;
    backTop.classList.toggle("show", window.scrollY > 480);
  }

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Play: quiz ---------- */
  (function () {
    var body = document.getElementById("quizBody");
    var scoreEl = document.getElementById("quizScore");
    var restart = document.getElementById("quizRestart");
    if (!body) return;

    var questions = [
      { q: "What is Yinuo's real name?", opts: ["Xu Bicheng", "Xu Bida", "Xu Bichen", "Xu Yinuo"], a: 0, tip: "Xu Bicheng, born 26 December 2001 in Nanfeng, Fuzhou, Jiangxi." },
      { q: "When is Yinuo's birthday?", opts: ["2001.12.26", "2002.01.26", "2001.06.12", "2000.12.26"], a: 0, tip: "26 December 2001." },
      { q: "Where was Yinuo born?", opts: ["Nanfeng, Fuzhou, Jiangxi", "Changsha, Hunan", "Chengdu, Sichuan", "Hangzhou, Zhejiang"], a: 0, tip: "Nanfeng, Fuzhou, Jiangxi." },
      { q: "What does the ID \"Yinuo\" come from?", opts: ["yi nuo qian jin (a promise worth a thousand gold)", "a lifelong promise", "one promise, one heart", "one promise, no excuse"], a: 0, tip: "yi nuo qian jin." },
      { q: "When was Yinuo's KPL debut?", opts: ["2018.04.21", "2017.04.21", "2018.09.15", "2019.04.21"], a: 0, tip: "21 April 2018, BA Heifengli vs eStarPro." },
      { q: "Which hero did Yinuo use in his KPL debut?", opts: ["Hua Mulan", "Guan Yu", "Gongsun Li", "Sun Shangxiang"], a: 0, tip: "Hua Mulan." },
      { q: "Who did AG beat for their first title in the 2019 Autumn?", opts: ["QGhappy", "eStarPro", "Beijing WB", "Chongqing Wolves"], a: 0, tip: "2019.12.14, beat QGhappy 4:1." },
      { q: "What was the score of the 2019 Autumn Grand Final?", opts: ["4:1", "4:2", "4:3", "3:4"], a: 0, tip: "4:1." },
      { q: "What was the score of the 2023 World Cup KIC Grand Final?", opts: ["4:2", "4:1", "4:3", "3:4"], a: 0, tip: "Beat Beijing WB 4:2." },
      { q: "Which hero has Yinuo's FMVP custom skin?", opts: ["Gongsun Li", "Sun Shangxiang", "Marco Polo", "Ao Yin"], a: 0, tip: "Gongsun Li — \"Yun Nuo Qian Shan\"." },
      { q: "What did Yinuo achieve with Pei Qinhu on 2020.05.08?", opts: ["1000 KPL kills", "2000 KPL kills", "4000 KPL assists", "600 KPL wins"], a: 0, tip: "1000 KPL kills." },
      { q: "What milestone did Yinuo reach on 2022.02.20?", opts: ["2000 KPL kills", "1000 KPL kills", "3000 KPL assists", "500 KPL wins"], a: 0, tip: "2000 KPL kills." },
      { q: "What milestone did Yinuo reach on 2025.03.02?", opts: ["4000 KPL assists", "2000 KPL kills", "600 KPL wins", "3000 KPL assists"], a: 0, tip: "4000 KPL assists." },
      { q: "How many KPL titles has Yinuo won as of 2026?", opts: ["7", "6", "8", "5"], a: 0, tip: "Seven titles, six runner-up finishes." },
      { q: "Which event did Yinuo compete in at the 2023 Hangzhou Asian Games?", opts: ["Honor of Kings (Asian Games edition)", "League of Legends", "Game for Peace", "Street Fighter"], a: 0, tip: "Honor of Kings (Asian Games edition); Team China won gold." }
    ];

    var idx = 0, score = 0, locked = false;

    function shuffleArr(a) {
      var arr = a.slice();
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }

    function renderQuiz() {
      if (idx >= questions.length) {
        var pct = Math.round((score / questions.length) * 100);
        var title = pct === 100 ? "Yinuo Expert" : pct >= 70 ? "Big Fan" : pct >= 40 ? "Casual Fan" : "Passer-by";
        body.innerHTML = '<div class="game-done"><strong>' + score + " / " + questions.length + "</strong><p>" + title + " · Accuracy " + pct + "%</p></div>";
        scoreEl.textContent = score + " / " + questions.length;
        return;
      }
      var q = questions[idx];
      var opts = shuffleArr(q.opts.map(function (o, i) { return { t: o, ok: i === q.a }; }));
      var correct = 0;
      var html = '<p class="game-q">' + (idx + 1) + ". " + q.q + '</p><div class="game-opts">';
      opts.forEach(function (o, i) {
        if (o.ok) correct = i;
        html += '<button class="game-opt" data-i="' + i + '">' + o.t + "</button>";
      });
      html += "</div>";
      body.innerHTML = html;
      scoreEl.textContent = score + " / " + questions.length;
      body.querySelectorAll(".game-opt").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (locked) return;
          locked = true;
          var i = parseInt(btn.getAttribute("data-i"), 10);
          body.querySelectorAll(".game-opt").forEach(function (b) {
            var bi = parseInt(b.getAttribute("data-i"), 10);
            b.classList.add(bi === correct ? "ok" : bi === i ? "no" : "dim");
            b.disabled = true;
          });
          if (i === correct) score++;
          var tip = document.createElement("p");
          tip.className = "game-tip";
          tip.textContent = q.tip;
          body.appendChild(tip);
          setTimeout(function () {
            idx++;
            locked = false;
            renderQuiz();
          }, 1400);
        });
      });
    }

    if (restart) {
      restart.addEventListener("click", function () {
        idx = 0;
        score = 0;
        locked = false;
        renderQuiz();
      });
    }
    renderQuiz();
  })();

  /* ---------- Play: guess the hero ---------- */
  (function () {
    var body = document.getElementById("guessBody");
    var scoreEl = document.getElementById("guessScore");
    var restart = document.getElementById("guessRestart");
    if (!body) return;

    var rounds = [
      { clue: "On 2020.05.08 he reached 1000 KPL kills with this hero.", opts: ["Pei Qinhu", "Gongsun Li", "Sun Shangxiang", "Baili Shouyue"], a: 0 },
      { clue: "The 2023 World Cup FMVP custom skin went to this hero.", opts: ["Gongsun Li", "Sun Shangxiang", "Marco Polo", "Luban No.7"], a: 0 },
      { clue: "In the 2024 Spring this hero went 9-0.", opts: ["Ao Yin", "Gongsun Li", "Di Renjie", "Yu Ji"], a: 0 },
      { clue: "Against TS in the 2019 Autumn he got a pentakill with this hero.", opts: ["Sun Shangxiang", "Gongsun Li", "Luban No.7", "Marco Polo"], a: 0 },
      { clue: "In game six of the 2021 lower-bracket final he took MVP with this hero.", opts: ["Baili Shouyue", "Gongsun Li", "Sun Shangxiang", "Yu Ji"], a: 0 },
      { clue: "In the deciding game of the 2019 Autumn lower-bracket semifinal, this hero's \"push\" ended the match.", opts: ["Gongsun Li", "Sun Shangxiang", "Marco Polo", "Ao Yin"], a: 0 },
      { clue: "In the second half of the 2020 Spring final he got a triple kill with this hero to force a peak matchup.", opts: ["Gongsun Li", "Sun Shangxiang", "Luban No.7", "Baili Shouyue"], a: 0 },
      { clue: "In the 2024 Annual Finals, this hero's first-person highlight was replayed again and again by fans.", opts: ["Luban No.7", "Gongsun Li", "Sun Shangxiang", "Ao Yin"], a: 0 }
    ];

    var idx = 0, score = 0, locked = false;

    function shuffleArr(a) {
      var arr = a.slice();
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }

    function renderGuess() {
      if (idx >= rounds.length) {
        body.innerHTML = '<div class="game-done"><strong>' + score + " / " + rounds.length + "</strong><p>Guess the Hero complete</p></div>";
        scoreEl.textContent = score + " / " + rounds.length;
        return;
      }
      var r = rounds[idx];
      var opts = shuffleArr(r.opts.map(function (o, i) { return { t: o, ok: i === r.a }; }));
      var correct = 0;
      var html = '<p class="game-q">' + (idx + 1) + ". " + r.clue + '</p><div class="game-opts">';
      opts.forEach(function (o, i) {
        if (o.ok) correct = i;
        html += '<button class="game-opt" data-i="' + i + '">' + o.t + "</button>";
      });
      html += "</div>";
      body.innerHTML = html;
      scoreEl.textContent = score + " / " + rounds.length;
      body.querySelectorAll(".game-opt").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (locked) return;
          locked = true;
          var i = parseInt(btn.getAttribute("data-i"), 10);
          body.querySelectorAll(".game-opt").forEach(function (b) {
            var bi = parseInt(b.getAttribute("data-i"), 10);
            b.classList.add(bi === correct ? "ok" : bi === i ? "no" : "dim");
            b.disabled = true;
          });
          if (i === correct) score++;
          scoreEl.textContent = score + " / " + rounds.length;
          setTimeout(function () {
            idx++;
            locked = false;
            renderGuess();
          }, 1100);
        });
      });
    }

    if (restart) {
      restart.addEventListener("click", function () {
        idx = 0;
        score = 0;
        locked = false;
        renderGuess();
      });
    }
    renderGuess();
  })();

  /* ---------- Play: honor matching ---------- */
  (function () {
    var body = document.getElementById("matchBody");
    var scoreEl = document.getElementById("matchScore");
    var restart = document.getElementById("matchRestart");
    if (!body) return;

    var pairs = [
      { event: "KPL debut", year: "2018" },
      { event: "First KPL title", year: "2019" },
      { event: "Reached 2000 kills", year: "2022" },
      { event: "First FMVP", year: "2023" },
      { event: "Summer + Annual Finals double", year: "2024" },
      { event: "Lifted the 7th title", year: "2025" },
      { event: "Aichi-Nagoya Asian Games", year: "2026" }
    ];
    var left = [], right = [], selLeft = null, matched = 0, locked = false;

    function shuffle(a) {
      var arr = a.slice();
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }

    function render() {
      body.innerHTML = '<div class="match-cols"><div class="match-col" id="matchLeft"></div><div class="match-col" id="matchRight"></div></div>';
      var l = document.getElementById("matchLeft");
      var r = document.getElementById("matchRight");
      left.forEach(function (p, i) {
        var b = document.createElement("button");
        b.className = "match-item";
        b.setAttribute("data-i", i);
        b.textContent = p.event;
        b.addEventListener("click", function () { pickLeft(i, b); });
        l.appendChild(b);
      });
      right.forEach(function (p, i) {
        var b = document.createElement("button");
        b.className = "match-item";
        b.setAttribute("data-i", i);
        b.textContent = p.year;
        b.addEventListener("click", function () { pickRight(i, b); });
        r.appendChild(b);
      });
      scoreEl.textContent = matched + " / " + pairs.length;
    }

    function pickLeft(i, btn) {
      if (locked || btn.classList.contains("matched")) return;
      document.querySelectorAll("#matchLeft .match-item").forEach(function (b) {
        b.classList.remove("sel");
      });
      btn.classList.add("sel");
      selLeft = i;
    }

    function pickRight(i, btn) {
      if (locked || btn.classList.contains("matched") || selLeft === null) return;
      var lBtn = document.querySelector('#matchLeft .match-item[data-i="' + selLeft + '"]');
      if (!lBtn) return;
      var li = selLeft;
      locked = true;
      if (left[li].year === right[i].year) {
        lBtn.classList.remove("sel");
        lBtn.classList.add("matched");
        btn.classList.add("matched");
        selLeft = null;
        matched++;
        scoreEl.textContent = matched + " / " + pairs.length;
        locked = false;
        if (matched === pairs.length) scoreEl.textContent = "All correct!";
      } else {
        lBtn.classList.add("wrong");
        btn.classList.add("wrong");
        setTimeout(function () {
          lBtn.classList.remove("wrong", "sel");
          btn.classList.remove("wrong");
          selLeft = null;
          locked = false;
        }, 500);
      }
    }

    function reset() {
      left = shuffle(pairs);
      right = shuffle(pairs);
      selLeft = null;
      matched = 0;
      locked = false;
      render();
    }

    if (restart) restart.addEventListener("click", reset);
    reset();
  })();

  /* ---------- Play: today's Yinuo ---------- */
  (function () {
    var body = document.getElementById("quoteBody");
    var draw = document.getElementById("quoteDraw");
    if (!body) return;

    var quotes = [
      "\"Nobody else can see it — when I'm playing, I'm always at my peak. The strongest is myself.\"",
      "\"You're lucky — play however you want.\"",
      "\"Old man marksman\" — how he jokes about himself.",
      "\"Losing eats away at me; there were countless nights I wanted to quit, but I woke up and kept going.\"",
      "\"A promise worth a thousand gold.\"",
      "\"If you want to win, you have to practice a little more than others.\"",
      "\"I will wait for the day that belongs to me.\""
    ];
    var last = -1;

    function showQuote() {
      var i = Math.floor(Math.random() * quotes.length);
      if (quotes.length > 1 && i === last) i = (i + 1) % quotes.length;
      last = i;
      body.innerHTML = '<div class="quote-box flip">' + quotes[i] + "</div>";
    }

    if (draw) draw.addEventListener("click", showQuote);
    showQuote();
  })();

  /* ---------- Effect: scroll progress bar ---------- */
  (function () {
    var bar = document.getElementById("scrollProgress");
    if (!bar) return;
    function updateBar() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, p)) + "%";
    }
    window.addEventListener("scroll", updateBar, { passive: true });
    window.addEventListener("resize", updateBar);
    updateBar();
  })();

  /* ---------- Effect: 3D tilt on directory cards ---------- */
  (function () {
    var cards = document.querySelectorAll(".hub-card");
    if (!cards.length) return;
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(600px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-3px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  })();

  /* ---------- Effect: stat number roll ---------- */
  function animateStats() {
    document.querySelectorAll(".stat-card b").forEach(function (b) {
      if (b.dataset.done) return;
      var text = b.textContent;
      var num = parseInt(text, 10);
      if (isNaN(num)) return;
      var suffix = text.replace(/^[0-9]+/, "");
      var start = performance.now();
      function tick(now) {
        var t = Math.min(1, (now - start) / 900);
        var val = Math.round(num * (1 - Math.pow(1 - t, 3)));
        b.textContent = val + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else {
          b.textContent = text;
          b.dataset.done = "1";
        }
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- Effect: hero parallax ---------- */
  (function () {
    var hero = document.querySelector(".hero");
    var poster = document.querySelector(".hero-media img");
    if (!hero || !poster) return;
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      poster.style.transform = "perspective(1000px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) scale(1.02)";
    });
    hero.addEventListener("mouseleave", function () {
      poster.style.transform = "";
    });
  })();

  /* ---------- Effect: click ripple ---------- */
  (function () {
    document.addEventListener("click", function (e) {
      var target = e.target && e.target.closest
        ? e.target.closest(".hub-card, .game-opt, .hero-cta, .game-foot button, .msg-submit")
        : null;
      if (!target) return;
      var r = target.getBoundingClientRect();
      var s = document.createElement("span");
      s.className = "ripple";
      s.style.left = (e.clientX - r.left) + "px";
      s.style.top = (e.clientY - r.top) + "px";
      target.appendChild(s);
      setTimeout(function () { s.remove(); }, 650);
    });
  })();

  /* ---------- Effect: section cartoon decorations ---------- */
  (function () {
    var map = {
      about: ["🎯", "✨"],
      story: ["📖", "⭐"],
      timeline: ["🏆", "⏳"],
      highlights: ["⚡", "👑"],
      stats: ["📊", "🏆"],
      quotes: ["💬", "✨"],
      play: ["🎮", "🎲"],
      gallery: ["📸", "⭐"],
      message: ["💌", "❤️"]
    };
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (!sec) return;
      var deco = document.createElement("span");
      deco.className = "sec-deco";
      deco.setAttribute("aria-hidden", "true");
      map[id].forEach(function (emoji, i) {
        var s = document.createElement("span");
        s.className = "sd-item";
        s.textContent = emoji;
        s.style.animationDelay = (i * 0.7) + "s";
        deco.appendChild(s);
      });
      sec.appendChild(deco);
    });
  })();

  /* ---------- Album styling: directory page numbers + chapter numbers ---------- */
  (function () {
    document.querySelectorAll(".hub-card .hub-num").forEach(function (el) {
      if (el.textContent.indexOf("P.") === 0) return;
      el.textContent = "P." + el.textContent;
    });

    var chapters = ["about", "story", "timeline", "highlights", "stats", "schedule", "quotes", "play", "gallery", "message", "watch"];
    chapters.forEach(function (id, i) {
      var sec = document.getElementById(id);
      if (!sec) return;
      var label = sec.querySelector(".section-label");
      if (label && label.textContent.indexOf("CH.") !== 0) {
        label.textContent = "CH." + (i + 1) + " · " + label.textContent;
      }
      if (!sec.querySelector(".chapter-page")) {
        var pn = document.createElement("span");
        pn.className = "chapter-page";
        var pad2 = function (n) { return n < 10 ? "0" + n : "" + n; };
        pn.textContent = pad2(i + 1) + " / " + pad2(chapters.length);
        sec.appendChild(pn);
      }
    });
  })();

  /* ---------- Gallery lightbox ---------- */
  (function () {
    var lb = document.getElementById("lightbox");
    var img = document.getElementById("lbImg");
    var count = document.getElementById("lbCount");
    if (!lb || !img) return;

    var tiles = Array.prototype.slice.call(document.querySelectorAll(".g-tile"));
    var current = 0;

    function show(i) {
      if (!tiles.length) return;
      current = (i + tiles.length) % tiles.length;
      var a = tiles[current];
      img.src = a.getAttribute("href");
      var im = a.querySelector("img");
      img.alt = im ? im.alt : "";
      if (count) count.textContent = (current + 1) + " / " + tiles.length;
    }

    function open(i) {
      show(i);
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
    }

    function close() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      img.removeAttribute("src");
    }

    tiles.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        open(i);
      });
    });

    var lbClose = document.getElementById("lbClose");
    var lbPrev = document.getElementById("lbPrev");
    var lbNext = document.getElementById("lbNext");
    if (lbClose) lbClose.addEventListener("click", close);
    if (lbPrev) lbPrev.addEventListener("click", function () { show(current - 1); });
    if (lbNext) lbNext.addEventListener("click", function () { show(current + 1); });
    lb.addEventListener("click", function (e) {
      if (e.target === lb) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  })();

  /* ---------- Hexagon comparison chart ---------- */
  (function () {
    var svg = document.getElementById("radarChart");
    if (!svg) return;

    var dims = ["Kills", "Survival", "Economy", "Damage", "Teamfight", "KDA"];
    var players = [
      { color: "#ff4a5a", values: [92, 84, 95, 93, 88, 94] },
      { color: "#4a9eff", values: [89, 82, 91, 90, 86, 89] },
      { color: "#8a8a8a", values: [78, 74, 80, 78, 76, 77] }
    ];
    var cx = 210, cy = 195, R = 132, n = dims.length;

    function point(i, r) {
      var ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
    }

    var html = "";
    [0.2, 0.4, 0.6, 0.8, 1].forEach(function (k) {
      var pts = [];
      for (var i = 0; i < n; i++) pts.push(point(i, R * k).join(","));
      html += '<polygon points="' + pts.join(" ") + '" fill="none" stroke="rgba(255,255,255,0.09)" />';
    });
    for (var i = 0; i < n; i++) {
      var p = point(i, R);
      html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="rgba(255,255,255,0.09)" />';
    }
    for (var j = 0; j < n; j++) {
      var lp = point(j, R + 24);
      html += '<text x="' + lp[0] + '" y="' + lp[1] + '" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="rgba(255,255,255,0.62)">' + dims[j] + "</text>";
    }
    players.forEach(function (pl) {
      var pts = [];
      for (var k = 0; k < n; k++) pts.push(point(k, R * (pl.values[k] / 100)).join(","));
      html += '<polygon points="' + pts.join(" ") + '" fill="' + pl.color + '" fill-opacity="0.13" stroke="' + pl.color + '" stroke-width="2" />';
    });
    svg.innerHTML = html;
  })();

  /* ---------- Per-section scrolling ticker ---------- */
  (function () {
    var data = {
      about: ["Xu Bicheng", "2001.12.26", "Nanfeng, Fuzhou, Jiangxi", "Marksman", "Chengdu AG Super Play", "Gongsun Li · Yun Nuo Qian Shan"],
      story: ["Police-academy boy", "BA Heifengli", "Old man marksman", "A promise worth gold", "From substitute to FMVP"],
      timeline: ["2018 debut", "2019 first title", "2023 FMVP", "2024 double", "2025 three titles", "2026 Asian Games"],
      highlights: ["Gongsun Li decisive push", "Sun Shangxiang pentakill", "World Cup FMVP", "Annual Finals FMVP", "Yun Nuo Qian Shan"],
      stats: ["7 titles 6 runner-up", "1104 games", "671 wins", "185 MVPs", "1000 kills", "2000 kills", "4000 assists"],
      schedule: ["KPL 2026", "Challenger Cup", "Esports World Cup", "Asian Games", "Recent matches"],
      quotes: ["A promise worth gold", "Old man marksman", "The strongest is myself", "In the name of love"],
      play: ["Quiz", "Guess the Hero", "Honor Matching", "Today's Yinuo"],
      gallery: ["Trophy moment", "Debut", "Finals poster", "MVP portrait"],
      watch: ["KPL 2026", "Official room 55", "Match replays", "Esports World Cup"],
      message: ["Leave a word of support", "Leave your name", "In the name of love"],
      end: ["Thanks for reading", "VOL.01 · 2026", "Youthful Yinuo, Unwavering"]
    };

    Object.keys(data).forEach(function (id) {
      var sec = document.getElementById(id);
      if (!sec) return;
      var head = sec.querySelector(".section-head");
      if (!head) return;
      if (sec.querySelector(".ticker-inline")) return;

      var wrapEl = document.createElement("div");
      wrapEl.className = "ticker ticker-inline";
      wrapEl.setAttribute("aria-hidden", "true");

      var track = document.createElement("div");
      track.className = "ticker-track";
      var items = data[id].concat(data[id]);
      items.forEach(function (txt) {
        var s = document.createElement("span");
        s.textContent = txt;
        track.appendChild(s);
      });

      wrapEl.appendChild(track);
      head.insertAdjacentElement("afterend", wrapEl);
    });
  })();

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
