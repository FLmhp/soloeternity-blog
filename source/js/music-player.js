(function () {
  function loadAsset(tag, attrs) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement(tag);
      Object.keys(attrs).forEach(function (key) {
        el[key] = attrs[key];
      });
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var config = window.SoloEternity || {};
    var audio = config.music || [];
    if (!audio.length) return;

    var dock = document.createElement("div");
    dock.id = "solo-music-dock";
    dock.innerHTML = '<button class="solo-music-toggle" type="button" aria-label="隐藏音乐播放器">♪</button><div class="solo-music-body" id="solo-music-player"></div>';
    document.body.appendChild(dock);

    var container = document.getElementById("solo-music-player");
    var toggle = dock.querySelector(".solo-music-toggle");
    if (localStorage.getItem("solo-music-hidden") === "1") dock.classList.add("solo-music-hidden");
    toggle.addEventListener("click", function () {
      dock.classList.toggle("solo-music-hidden");
      localStorage.setItem("solo-music-hidden", dock.classList.contains("solo-music-hidden") ? "1" : "0");
    });

    Promise.all([
      loadAsset("link", { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css" }),
      loadAsset("script", { src: "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js" })
    ]).then(function () {
      new window.APlayer({
        container: container,
        fixed: false,
        autoplay: false,
        audio: audio
      });
    }).catch(function () {
      container.innerHTML = '<p class="solo-muted">音乐播放器加载失败。</p>';
    });
  });
})();
