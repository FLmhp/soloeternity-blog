(function () {
  function normalizeItems(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.memos)) return payload.memos;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && Array.isArray(payload.data.memos)) return payload.data.memos;
    return [];
  }

  function contentOf(item) {
    return item.content || item.memo || item.snippet || "";
  }

  function dateOf(item) {
    return item.displayTime || item.createTime || item.createdTs || item.created_at || "";
  }

  function render(container, items, tag) {
    var moments = items.filter(function (item) {
      return contentOf(item).indexOf("#" + tag) !== -1;
    });

    if (!moments.length) {
      container.innerHTML = '<p class="solo-muted">暂无公开动态。请在 Memos 发布带 #' + tag + " 的公开内容。</p>";
      return;
    }

    container.innerHTML = moments.map(function (item) {
      var content = contentOf(item).replace(/#\w+/g, '<span class="solo-tag">$&</span>');
      var date = dateOf(item);
      return '<article class="solo-memo-item"><time>' + date + '</time><p>' + content + "</p></article>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.querySelector("[data-memos-feed]");
    if (!container) return;

    var config = window.SoloEternity || {};
    var base = (config.memosBase || "").replace(/\/$/, "");
    var tag = config.memosTag || "moment";
    var endpoints = [
      base + "/api/v1/memos?filter=visibilities%3D%3D%5BPUBLIC%5D&pageSize=20",
      base + "/api/v1/memo?rowStatus=NORMAL&limit=20"
    ];

    function tryEndpoint(index) {
      if (!endpoints[index]) {
        container.innerHTML = '<p class="solo-muted">暂时无法读取 Memos。可先前往 <a href="' + base + '" target="_blank" rel="noopener">Memos</a> 查看。</p>';
        return;
      }

      fetch(endpoints[index], { cache: "no-store" })
        .then(function (response) {
          if (!response.ok) throw new Error("memos request failed");
          return response.json();
        })
        .then(function (payload) {
          render(container, normalizeItems(payload), tag);
        })
        .catch(function () {
          tryEndpoint(index + 1);
        });
    }

    tryEndpoint(0);
  });
})();
