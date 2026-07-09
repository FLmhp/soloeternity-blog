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

  function formatDate(value) {
    if (!value) return "";
    var raw = value;
    if (typeof value === "number" && value < 1000000000000) raw = value * 1000;
    var date = new Date(raw);
    if (Number.isNaN(date.getTime())) return String(value);

    var parts = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(date).reduce(function (result, part) {
      result[part.type] = part.value;
      return result;
    }, {});

    return parts.year + "-" + parts.month + "-" + parts.day + " " + parts.hour + ":" + parts.minute;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function stripTag(content, tag) {
    return String(content)
      .replace(new RegExp("(^|\\s)#" + escapeRegExp(tag) + "(?=\\s|$)", "gi"), " ")
      .replace(/#[A-Za-z0-9_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hasTag(item, tag) {
    if (Array.isArray(item.tags) && item.tags.indexOf(tag) !== -1) return true;
    return new RegExp("(^|\\s)#" + escapeRegExp(tag) + "(\\b|\\s|$)", "i").test(contentOf(item));
  }

  function render(container, items, tag, plain) {
    var moments = items.filter(function (item) {
      return hasTag(item, tag);
    });

    if (!moments.length) {
      container.innerHTML = '<p class="solo-muted">暂无内容。</p>';
      return;
    }

    container.innerHTML = moments.map(function (item) {
      var rawContent = plain ? stripTag(contentOf(item), tag) : contentOf(item);
      var content = escapeHtml(rawContent).replace(/\n/g, "<br>");
      if (!plain) content = content.replace(/#([A-Za-z0-9_-]+)/g, '<span class="solo-tag">#$1</span>');
      var date = formatDate(dateOf(item));
      return '<article class="solo-memo-item"><time>' + date + '</time><p>' + content + "</p></article>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.querySelector("[data-memos-feed]");
    if (!container) return;

    var config = window.SoloEternity || {};
    var base = (config.memosBase || "").replace(/\/$/, "");
    var tag = container.getAttribute("data-memos-tag") || config.memosTag || "moment";
    var plain = container.getAttribute("data-memos-plain") === "true";
    var endpoints = [
      base + '/api/v1/memos?filter=visibility%3D%3D%22PUBLIC%22&pageSize=20',
      base + "/api/v1/memos?pageSize=20",
      base + "/api/v1/memo?rowStatus=NORMAL&limit=20"
    ];

    function tryEndpoint(index) {
      if (!endpoints[index]) {
        container.innerHTML = '<p class="solo-muted">暂时无法读取 Memos。</p>';
        return;
      }

      fetch(endpoints[index], { cache: "no-store" })
        .then(function (response) {
          if (!response.ok) throw new Error("memos request failed");
          return response.json();
        })
        .then(function (payload) {
          render(container, normalizeItems(payload), tag, plain);
        })
        .catch(function () {
          tryEndpoint(index + 1);
        });
    }

    tryEndpoint(0);
  });
})();
