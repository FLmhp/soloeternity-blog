// 加载Live2D看板娘
(function() {
  // 创建script标签加载autoload.js
  var script = document.createElement("script");
  script.src = "https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0-rc.6/dist/autoload.js";
  script.onload = function() {
    // Live2D加载完成后的初始化配置
    if (typeof window.initWidget === 'function') {
      window.initWidget({
        waifuPath: "https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0-rc.6/dist/waifu-tips.json",
        cdnPath: "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/",
        tools: ["hitokoto", "asteroids", "switch-model", "switch-texture", "photo", "info", "quit"]
      });
    }
  };
  document.body.appendChild(script);
})();