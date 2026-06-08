'use strict';

// Adapt Fluid's legacy container markup to the current busuanzi.min.js IDs.
(function () {
  if (window.__busuanziCompatInit) {
    return;
  }

  window.__busuanziCompatInit = true;

  var mappings = [
    ['busuanzi_container_site_pv', 'busuanzi_site_pv'],
    ['busuanzi_container_site_uv', 'busuanzi_site_uv'],
    ['busuanzi_container_page_pv', 'busuanzi_page_pv'],
    ['busuanzi_container_page_uv', 'busuanzi_page_uv']
  ];

  var maxAttempts = 100;
  var attempts = 0;

  function revealLoadedCounters() {
    var pending = false;

    mappings.forEach(function (pair) {
      var container = document.getElementById(pair[0]);
      var value = document.getElementById(pair[1]);

      if (!container || !value) {
        return;
      }

      if (value.textContent.trim()) {
        container.style.display = 'inline';
      } else {
        pending = true;
      }
    });

    attempts += 1;
    if (!pending || attempts >= maxAttempts) {
      window.clearInterval(timer);
    }
  }

  var timer = window.setInterval(revealLoadedCounters, 200);
  revealLoadedCounters();
})();
