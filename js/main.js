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

  function openVideo() {
    if (!videoModal || !vmVideo) return;
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
      openVideo();
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

  /* ---------- 年份 ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
