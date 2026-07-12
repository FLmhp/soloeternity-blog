(function () {
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

    if (!window.APlayer) {
      container.innerHTML = '<p class="solo-muted">音乐播放器加载失败。</p>';
      return;
    }

      var player = new window.APlayer({
        container: container,
        fixed: false,
        autoplay: false,
        lrcType: 3,
        loop: "all",
        order: "list",
        volume: 0.7,
        preload: "metadata",
        listFolded: false,
        listMaxHeight: "180px",
        audio: audio
      });

      var controls = document.createElement("div");
      controls.className = "solo-music-controls";
      controls.innerHTML = '<button type="button" data-music-mode title="切换播放模式">列表</button>' +
        '<button type="button" data-music-prev aria-label="上一首">&#9664;&#10073;</button>' +
        '<button type="button" data-music-play aria-label="播放或暂停">&#9654;</button>' +
        '<button type="button" data-music-next aria-label="下一首">&#10073;&#9654;</button>' +
        '<label title="音量"><span aria-hidden="true">&#128266;</span><input type="range" min="0" max="1" step="0.05" value="0.7" aria-label="音量"></label>';
      container.appendChild(controls);

      var modes = [
        { label: "列表", order: "list", loop: "all" },
        { label: "随机", order: "random", loop: "all" },
        { label: "单曲", order: "list", loop: "one" }
      ];
      var modeIndex = 0;
      controls.querySelector("[data-music-mode]").addEventListener("click", function (event) {
        modeIndex = (modeIndex + 1) % modes.length;
        var mode = modes[modeIndex];
        player.options.order = mode.order;
        player.options.loop = mode.loop;
        event.currentTarget.textContent = mode.label;
      });
      controls.querySelector("[data-music-prev]").addEventListener("click", function () { player.skipBack(); });
      controls.querySelector("[data-music-play]").addEventListener("click", function () { player.toggle(); });
      controls.querySelector("[data-music-next]").addEventListener("click", function () { player.skipForward(); });
      controls.querySelector("input").addEventListener("input", function (event) {
        player.audio.volume = Number(event.target.value);
      });

      var playButton = controls.querySelector("[data-music-play]");
      player.on("play", function () { playButton.innerHTML = "&#10073;&#10073;"; });
      player.on("pause", function () { playButton.innerHTML = "&#9654;"; });

      var trackedControls = [
        [".aplayer-icon-play", "music-play-toggle"],
        [".aplayer-icon-menu", "music-playlist-toggle"],
        [".aplayer-bar-wrap", "music-seek"]
      ];
      trackedControls.forEach(function (item) {
        var element = container.querySelector(item[0]);
        if (element) element.setAttribute("data-umami-event", item[1]);
      });
      container.querySelectorAll(".aplayer-list li").forEach(function (item, index) {
        item.setAttribute("data-umami-event", "music-track-select");
        item.setAttribute("data-umami-event-track", audio[index].name);
      });
  });
})();
