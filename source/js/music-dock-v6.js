(function () {
  function initMusicPlayer() {
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

    if (!window.APlayer) {
      container.innerHTML = '<p class="solo-muted">音乐播放器加载失败。</p>';
      return;
    }

    new window.APlayer({
      container: container,
      fixed: false,
      autoplay: false,
      lrcType: 3,
      loop: "all",
      order: "list",
      volume: 0.7,
      preload: "none",
      listFolded: false,
      listMaxHeight: "180px",
      audio: audio
    });

    [
      [".aplayer-icon-play", "music-play-toggle"],
      [".aplayer-icon-order", "music-order-toggle"],
      [".aplayer-icon-loop", "music-loop-toggle"],
      [".aplayer-volume-bar-wrap", "music-volume-change"],
      [".aplayer-icon-menu", "music-playlist-toggle"],
      [".aplayer-bar-wrap", "music-seek"]
    ].forEach(function (item) {
      var element = container.querySelector(item[0]);
      if (element) element.setAttribute("data-umami-event", item[1]);
    });
    container.querySelectorAll(".aplayer-list li").forEach(function (item, index) {
      item.setAttribute("data-umami-event", "music-track-select");
      item.setAttribute("data-umami-event-track", audio[index].name);
    });
  }

  if (document.readyState === "complete") initMusicPlayer();
  else window.addEventListener("load", initMusicPlayer, { once: true });
})();
