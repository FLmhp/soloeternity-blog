(function () {
  function normalizeItems(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.memos)) return payload.memos;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && Array.isArray(payload.data.memos)) return payload.data.memos;
    return [];
  }

  function contentOf(item) {
    return item.content || item.snippet || item.memo || "";
  }

  function dateOf(item) {
    return item.displayTime || item.createTime || item.createdTs || item.created_at || "";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function hasTag(item, tag) {
    if (Array.isArray(item.tags) && item.tags.indexOf(tag) !== -1) return true;
    return new RegExp("(^|\\s)#" + tag + "(\\b|\\s|$)").test(contentOf(item));
  }

  function render(container, items, tag) {
    var moments = items.filter(function (item) {
      return hasTag(item, tag);
    });

    if (!moments.length) {
      container.innerHTML = '<p class="solo-muted">暂无公开动态。请在 Memos 发布带 #' + tag + " 的公开内容。</p>";
      return;
    }

    container.innerHTML = moments.map(function (item) {
      var content = escapeHtml(contentOf(item))
        .replace(/#([A-Za-z0-9_-]+)/g, '<span class="solo-tag">#$1</span>')
        .replace(/\n/g, "<br>");
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
      base + '/api/v1/memos?filter=visibility%3D%3D%22PUBLIC%22&pageSize=20',
      base + "/api/v1/memos?pageSize=20",
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
