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
      { q: "一诺的生日是？", opts: ["2001.12.26", "2002.01.26", "2001.06.12", "2000.12.26"], a: 0, tip: "2001 年 12 月 26 日，ID「一诺」取自「一诺千金」。" },
      { q: "一诺在 KPL 的首秀英雄是？", opts: ["花木兰", "关羽", "公孙离", "孙尚香"], a: 0, tip: "2018.04.21 首秀，用花木兰对阵 eStarPro。" },
      { q: "2023 世冠 KIC 总决赛，AG 的比分是？", opts: ["4:2", "4:1", "4:3", "3:4"], a: 0, tip: "4:2 击败北京 WB，一诺拿下 FMVP。" },
      { q: "一诺的 FMVP 定制皮肤英雄是？", opts: ["公孙离", "孙尚香", "马可波罗", "敖隐"], a: 0, tip: "公孙离——「云诺千山」。" },
      { q: "2020.05.08，一诺用裴擒虎达成了什么？", opts: ["KPL 1000 击杀", "KPL 2000 击杀", "KPL 4000 助攻", "KPL 600 胜"], a: 0, tip: "用裴擒虎达成 KPL 1000 击杀。" },
      { q: "截至 2026 年，一诺的 KPL 冠军数是？", opts: ["7", "6", "8", "5"], a: 0, tip: "七冠六亚。" },
      { q: "一诺的 ID「一诺」含义是？", opts: ["一诺千金", "一生之诺", "一诺倾心", "一诺无辞"], a: 0, tip: "一诺千金。" }
    ];

    var idx = 0, score = 0, locked = false;

    function renderQuiz() {
      if (idx >= questions.length) {
        var pct = Math.round((score / questions.length) * 100);
        var title = pct === 100 ? "一诺十级学者" : pct >= 70 ? "资深 i 人" : pct >= 40 ? "路人粉" : "路人";
        body.innerHTML = '<div class="game-done"><strong>' + score + " / " + questions.length + "</strong><p>" + title + " · 正确率 " + pct + "%</p></div>";
        scoreEl.textContent = score + " / " + questions.length;
        return;
      }
      var q = questions[idx];
      var html = '<p class="game-q">' + (idx + 1) + ". " + q.q + '</p><div class="game-opts">';
      q.opts.forEach(function (o, i) {
        html += '<button class="game-opt" data-i="' + i + '">' + o + "</button>";
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
            b.classList.add(bi === q.a ? "ok" : bi === i ? "no" : "dim");
            b.disabled = true;
          });
          if (i === q.a) score++;
          var tip = document.createElement("p");
          tip.className = "game-tip";
          tip.textContent = q.tip;
          body.appendChild(tip);
          setTimeout(function () {
            idx++;
            locked = false;
            renderQuiz();
          }, 1300);
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
      { clue: "2021 败者组决赛第六局，他用这个英雄拿下 MVP。", opts: ["百里守约", "公孙离", "孙尚香", "虞姬"], a: 0 }
    ];

    var idx = 0, score = 0, locked = false;

    function renderGuess() {
      if (idx >= rounds.length) {
        body.innerHTML = '<div class="game-done"><strong>' + score + " / " + rounds.length + "</strong><p>猜英雄完成</p></div>";
        scoreEl.textContent = score + " / " + rounds.length;
        return;
      }
      var r = rounds[idx];
      var html = '<p class="game-q">' + (idx + 1) + ". " + r.clue + '</p><div class="game-opts">';
      r.opts.forEach(function (o, i) {
        html += '<button class="game-opt" data-i="' + i + '">' + o + "</button>";
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
            b.classList.add(bi === r.a ? "ok" : bi === i ? "no" : "dim");
            b.disabled = true;
          });
          if (i === r.a) score++;
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

  /* ---------- 年份 ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
