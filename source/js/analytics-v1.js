(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var events = [
      ["#search-btn", "search-open"],
      ["#color-toggle-btn", "theme-toggle"],
      [".solo-hitokoto", "quote-refresh"],
      [".solo-music-toggle", "music-player-toggle"]
    ];

    document.querySelectorAll("#navbar a[href]").forEach(function (link) {
      link.setAttribute("data-umami-event", "navigation-click");
      link.setAttribute("data-umami-event-path", link.getAttribute("href"));
    });

    events.forEach(function (item) {
      var element = document.querySelector(item[0]);
      if (element) {
        element.setAttribute("data-umami-event", item[1]);
        element.removeAttribute("data-umami-event-path");
      }
    });
  });
})();
