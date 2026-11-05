/* =========================================================
   一诺 · 粉丝专题站  ——  交互脚本
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 深浅色切换 ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeBtn");
  var THEME_KEY = "yinuo-theme";

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
    applyTheme("dark");
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

  /* ---------- 移动端菜单 ---------- */
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

  /* ---------- 站内视图切换（目录 → 各章节） ---------- */
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

  /* ---------- 滚动出现动画 ---------- */
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

  /* ---------- 图集大图预览 ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbMedia = document.getElementById("lbMedia");
  var lbTitle = document.getElementById("lbTitle");
  var lbDesc = document.getElementById("lbDesc");
  var lbClose = document.getElementById("lbClose");

  function openLightbox(tile) {
    if (!lightbox) return;
    var title = tile.getAttribute("data-title") || "图片预览";
    var desc = tile.getAttribute("data-desc") || "";
    lbTitle.textContent = title;
    lbDesc.textContent = desc;
    lbMedia.className = "lb-media " + (tile.classList.contains("grad-1") ? "grad-1" : tile.classList.contains("grad-2") ? "grad-2" : tile.classList.contains("grad-3") ? "grad-3" : "grad-4");
    lbMedia.textContent = title;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll(".g-tile").forEach(function (tile) {
    tile.addEventListener("click", function () {
      openLightbox(tile);
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- 赛场历程（手风琴） ---------- */
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

  /* ---------- 招牌英雄（点击切换） ---------- */
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

  /* ---------- 视频弹层 ---------- */
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

  /* ---------- 留言板（本地存储） ---------- */
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
        '<div class="msg-item"><p style="color:var(--text-2)">还没有留言，来写下第一句应援吧。</p></div>';
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

  /* ---------- 回到顶部 ---------- */
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

  /* ---------- 互动玩法：知识问答 ---------- */
  (function () {
    var body = document.getElementById("quizBody");
    var scoreEl = document.getElementById("quizScore");
    var restart = document.getElementById("quizRestart");
    if (!body) return;

    var questions = [
      { q: "一诺的本名是？", opts: ["徐必成", "徐必达", "许必成", "徐一诺"], a: 0, tip: "徐必成，2001 年 12 月 26 日生于江西抚州南丰。" },
      { q: "一诺的生日是？", opts: ["2001.12.26", "2002.01.26", "2001.06.12", "2000.12.26"], a: 0, tip: "2001 年 12 月 26 日。" },
      { q: "一诺的出生地是？", opts: ["江西抚州南丰", "湖南长沙", "四川成都", "浙江杭州"], a: 0, tip: "江西抚州南丰。" },
      { q: "一诺的 ID「一诺」取自？", opts: ["一诺千金", "一生之诺", "一诺倾心", "一诺无辞"], a: 0, tip: "一诺千金。" },
      { q: "一诺在 KPL 的首秀日期是？", opts: ["2018.04.21", "2017.04.21", "2018.09.15", "2019.04.21"], a: 0, tip: "2018 年 4 月 21 日，BA 黑凤梨 vs eStarPro。" },
      { q: "一诺在 KPL 首秀使用的英雄是？", opts: ["花木兰", "关羽", "公孙离", "孙尚香"], a: 0, tip: "花木兰。" },
      { q: "2019 秋季赛，AG 首冠的对手是？", opts: ["QGhappy", "eStarPro", "北京 WB", "重庆狼队"], a: 0, tip: "2019.12.14，4:1 击败 QGhappy。" },
      { q: "2019 秋季赛总决赛的比分是？", opts: ["4:1", "4:2", "4:3", "3:4"], a: 0, tip: "4:1。" },
      { q: "2023 世冠 KIC 总决赛的比分是？", opts: ["4:2", "4:1", "4:3", "3:4"], a: 0, tip: "4:2 击败北京 WB。" },
      { q: "一诺的 FMVP 定制皮肤英雄是？", opts: ["公孙离", "孙尚香", "马可波罗", "敖隐"], a: 0, tip: "公孙离——「云诺千山」。" },
      { q: "2020.05.08，一诺用裴擒虎达成了什么？", opts: ["KPL 1000 击杀", "KPL 2000 击杀", "KPL 4000 助攻", "KPL 600 胜"], a: 0, tip: "KPL 1000 击杀。" },
      { q: "2022.02.20，一诺达成了什么里程碑？", opts: ["KPL 2000 击杀", "KPL 1000 击杀", "KPL 3000 助攻", "KPL 500 胜"], a: 0, tip: "KPL 2000 击杀。" },
      { q: "2025.03.02，一诺达成了什么里程碑？", opts: ["KPL 4000 助攻", "KPL 2000 击杀", "KPL 600 胜", "KPL 3000 助攻"], a: 0, tip: "KPL 4000 助攻。" },
      { q: "截至 2026 年，一诺的 KPL 冠军数是？", opts: ["7", "6", "8", "5"], a: 0, tip: "七冠六亚。" },
      { q: "2023 年杭州亚运会，一诺参加的项目是？", opts: ["王者荣耀（亚运版）", "英雄联盟", "和平精英", "街霸"], a: 0, tip: "王者荣耀（亚运版），中国队夺金。" }
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
        var title = pct === 100 ? "一诺十级学者" : pct >= 70 ? "资深 i 人" : pct >= 40 ? "路人粉" : "路人";
        body.innerHTML = '<div class="game-done"><strong>' + score + " / " + questions.length + "</strong><p>" + title + " · 正确率 " + pct + "%</p></div>";
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

  /* ---------- 互动玩法：猜英雄 ---------- */
  (function () {
    var body = document.getElementById("guessBody");
    var scoreEl = document.getElementById("guessScore");
    var restart = document.getElementById("guessRestart");
    if (!body) return;

    var rounds = [
      { clue: "2020.05.08，他用这个英雄达成 KPL 1000 击杀。", opts: ["裴擒虎", "公孙离", "孙尚香", "百里守约"], a: 0 },
      { clue: "2023 世冠 FMVP 的定制皮肤给了这个英雄。", opts: ["公孙离", "孙尚香", "马可波罗", "鲁班七号"], a: 0 },
      { clue: "2024 春季赛，这个英雄出场 9 战全胜。", opts: ["敖隐", "公孙离", "狄仁杰", "虞姬"], a: 0 },
      { clue: "2019 秋季赛对阵 TS，他用这个英雄拿下五连绝世。", opts: ["孙尚香", "公孙离", "鲁班七号", "马可波罗"], a: 0 },
      { clue: "2021 败者组决赛第六局，他用这个英雄拿下 MVP。", opts: ["百里守约", "公孙离", "孙尚香", "虞姬"], a: 0 },
      { clue: "2019 秋季赛败者组半决赛决胜局，他的这个英雄「一推」终结比赛。", opts: ["公孙离", "孙尚香", "马可波罗", "敖隐"], a: 0 },
      { clue: "2020 春决下半场，他用这个英雄拿下三杀，把比赛拖入巅峰对决。", opts: ["公孙离", "孙尚香", "鲁班七号", "百里守约"], a: 0 },
      { clue: "2024 年总决赛，这个英雄的第一视角名场面被粉丝反复回看。", opts: ["鲁班七号", "公孙离", "孙尚香", "敖隐"], a: 0 }
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
        body.innerHTML = '<div class="game-done"><strong>' + score + " / " + rounds.length + "</strong><p>猜英雄完成</p></div>";
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

  /* ---------- 互动玩法：荣誉配对 ---------- */
  (function () {
    var body = document.getElementById("matchBody");
    var scoreEl = document.getElementById("matchScore");
    var restart = document.getElementById("matchRestart");
    if (!body) return;

    var pairs = [
      { event: "KPL 首秀", year: "2018" },
      { event: "首夺 KPL 冠军", year: "2019" },
      { event: "达成 2000 击杀", year: "2022" },
      { event: "首夺 FMVP", year: "2023" },
      { event: "夏冠 + 年总双冠", year: "2024" },
      { event: "捧起第七冠", year: "2025" },
      { event: "爱知·名古屋亚运会", year: "2026" }
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
        if (matched === pairs.length) scoreEl.textContent = "全对！";
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

  /* ---------- 互动玩法：今日一诺 ---------- */
  (function () {
    var body = document.getElementById("quoteBody");
    var draw = document.getElementById("quoteDraw");
    if (!body) return;

    var quotes = [
      "「别人都看不懂，我在打的时候一直都是巅峰，最强大的是自己。」",
      "「你运气很好，想怎么玩就怎么玩。」",
      "「老头射手」——他这样自嘲自己。",
      "「输比赛会内耗，有无数个夜晚想不打了，但醒来还是坚持走下去。」",
      "「一诺千金。」",
      "「想赢，就要比别人多练一点。」",
      "「我会等到属于我的那一天。」"
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

  /* ---------- 动态效果：滚动进度条 ---------- */
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

  /* ---------- 动态效果：目录卡 3D 倾斜 ---------- */
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

  /* ---------- 动态效果：数据数字滚动 ---------- */
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

  /* ---------- 动态效果：Hero 视差 ---------- */
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

  /* ---------- 动态效果：点击波纹 ---------- */
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

  /* ---------- 动态效果：章节卡通装饰 ---------- */
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

  /* ---------- 专辑化：目录页码 + 章节编号 ---------- */
  (function () {
    document.querySelectorAll(".hub-card .hub-num").forEach(function (el) {
      if (el.textContent.indexOf("P.") === 0) return;
      el.textContent = "P." + el.textContent;
    });

    var chapters = ["about", "story", "timeline", "highlights", "stats", "quotes", "play", "gallery", "message"];
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
        pn.textContent = "0" + (i + 1) + " / 09";
        sec.appendChild(pn);
      }
    });
  })();

  /* ---------- 年份 ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
