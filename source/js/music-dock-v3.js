(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement("script");
      el.src = src;
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var config = window.SoloEternity || {};
    var audio = config.music || [];
    if (!audio.length || document.getElementById("solo-music-dock")) return;

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

    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css";
    document.head.appendChild(css);

    loadScript("https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js").then(function () {
      new window.APlayer({
        container: container,
        fixed: false,
        autoplay: false,
        lrcType: 3,
        listFolded: true,
        audio: audio
      });
    }).catch(function () {
      container.innerHTML = '<p class="solo-muted">音乐播放器加载失败。</p>';
    });
  });
})();
