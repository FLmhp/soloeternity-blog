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

  function hasTag(item, tag) {
    if (Array.isArray(item.tags) && item.tags.indexOf(tag) !== -1) return true;
    return new RegExp("(^|\\s)#" + escapeRegExp(tag) + "(\\b|\\s|$)", "i").test(contentOf(item));
  }

  function attachmentUrl(base, attachment) {
    if (attachment.externalLink) return attachment.externalLink;
    if (!attachment.name || !attachment.filename) return "";
    return base + "/file/" + encodeURI(attachment.name) + "/" + encodeURIComponent(attachment.filename);
  }

  function renderAttachments(base, item) {
    var attachments = item.attachments || item.resources || [];
    if (!attachments.length) return "";

    return '<div class="solo-memo-attachments">' + attachments.map(function (attachment) {
      var url = attachmentUrl(base, attachment);
      var filename = escapeHtml(attachment.filename || attachment.name || "附件");
      if (!url) return "";
      if ((attachment.type || "").indexOf("image/") === 0) {
        return '<figure><img loading="lazy" src="' + url + '" alt="' + filename + '"><figcaption>' + filename + "</figcaption></figure>";
      }
      return '<a class="solo-memo-file" href="' + url + '" target="_blank" rel="noopener">' + filename + "</a>";
    }).join("") + "</div>";
  }

  function renderRelations(item) {
    var relations = item.relations || [];
    var refs = relations.map(function (relation) {
      var memo = relation.relatedMemo || relation.memo || {};
      if (memo.name === item.name) memo = relation.memo || {};
      var label = memo.snippet || memo.name || "";
      return label ? escapeHtml(label.replace(/^memos\//, "")) : "";
    }).filter(Boolean);
    if (!refs.length) return "";
    return '<div class="solo-memo-meta">引用：' + refs.join("、") + "</div>";
  }

  function renderLocation(item) {
    if (!item.location) return "";
    var location = item.location.placeholder || [item.location.latitude, item.location.longitude].filter(Boolean).join(", ");
    return location ? '<div class="solo-memo-meta">地点：' + escapeHtml(location) + "</div>" : "";
  }

  function render(container, items, tag, base) {
    var moments = items.filter(function (item) {
      return hasTag(item, tag);
    });

    if (!moments.length) {
      container.innerHTML = '<p class="solo-muted">暂无内容。</p>';
      return;
    }

    container.innerHTML = moments.map(function (item) {
      var content = escapeHtml(contentOf(item))
        .replace(/\n/g, "<br>")
        .replace(/#([A-Za-z0-9_-]+)/g, '<span class="solo-tag">#$1</span>');
      var date = formatDate(dateOf(item));
      return '<article class="solo-memo-item"><time>' + date + '</time><p>' + content + "</p>" +
        renderAttachments(base, item) + renderRelations(item) + renderLocation(item) + "</article>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.querySelector("[data-memos-feed]");
    if (!container) return;

    var config = window.SoloEternity || {};
    var base = (config.memosBase || "").replace(/\/$/, "");
    var tag = container.getAttribute("data-memos-tag") || config.memosTag || "moment";
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
          render(container, normalizeItems(payload), tag, base);
        })
        .catch(function () {
          tryEndpoint(index + 1);
        });
    }

    tryEndpoint(0);
  });
})();
