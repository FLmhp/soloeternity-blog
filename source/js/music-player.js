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
    var container = document.getElementById("solo-music-player");
    if (!container) return;

    var config = window.SoloEternity || {};
    var audio = config.music || [];
    if (!audio.length) {
      container.innerHTML = '<p class="solo-muted">尚未配置音乐文件。</p>';
      return;
    }

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
