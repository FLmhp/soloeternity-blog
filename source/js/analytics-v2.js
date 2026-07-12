(function () {
  function track(name, data) {
    if (window.umami && typeof window.umami.track === "function") window.umami.track(name, data);
  }

  function pageType() {
    if (document.querySelector("article.post")) return "post";
    return location.pathname.split("/").filter(Boolean)[0] || "home";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var events = [
      ["#search-btn", "search-open"],
      ["#color-toggle-btn", "theme-toggle"],
      [".solo-hitokoto", "quote-refresh"],
      [".solo-music-toggle", "music-player-toggle"],
      ["#waifu-toggle", "live2d-open"]
    ];

    document.querySelectorAll("#navbar a[href]").forEach(function (link) {
      link.setAttribute("data-umami-event", "navigation-click");
      link.setAttribute("data-umami-event-path", link.getAttribute("href"));
    });

    events.forEach(function (item) {
      var element = document.querySelector(item[0]);
      if (element) element.setAttribute("data-umami-event", item[1]);
    });

    document.addEventListener("click", function (event) {
      var animeFilter = event.target.closest("[data-anime-type]");
      if (animeFilter) track("anime-filter", { status: animeFilter.textContent.trim() });

      var link = event.target.closest("a[href]");
      if (!link) return;
      var url;
      try { url = new URL(link.href, location.href); } catch (_) { return; }
      if (url.hostname && url.hostname !== location.hostname) track("outbound-link", { host: url.hostname });
      if (/\.(zip|7z|rar|pdf|docx?|xlsx?|pptx?)$/i.test(url.pathname)) track("file-download", { file: url.pathname.split("/").pop() });
      if (link.closest(".solo-anime-card")) track("anime-subject-open", { subject: url.pathname.split("/").pop() });
      if (link.closest(".links .card")) track("friend-link-open", { host: url.hostname });
    });

    document.addEventListener("focusin", function commentFocus(event) {
      if (!event.target.closest("#comments textarea, #waline textarea, .wl-editor")) return;
      track("comment-start", { page: location.pathname });
      document.removeEventListener("focusin", commentFocus);
    });

    document.addEventListener("copy", function () {
      if (document.querySelector("article")) track("content-copy", { type: pageType() });
    }, { once: true });

    var depths = { 50: false, 90: false };
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var available = document.documentElement.scrollHeight - innerHeight;
        var percent = available > 0 ? Math.round(scrollY / available * 100) : 100;
        [50, 90].forEach(function (depth) {
          if (percent >= depth && !depths[depth]) {
            depths[depth] = true;
            track("scroll-depth", { depth: depth, type: pageType() });
          }
        });
        ticking = false;
      });
    }, { passive: true });

    [30, 120].forEach(function (seconds) {
      setTimeout(function () {
        if (document.visibilityState === "visible") track("engaged-time", { seconds: seconds, type: pageType() });
      }, seconds * 1000);
    });
  });
})();
