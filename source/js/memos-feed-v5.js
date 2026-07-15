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

  function loadMarkdownParser() {
    if (window.marked) return Promise.resolve();

    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "/js/vendor/marked-15.0.12.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function safeUrl(value, allowMail) {
    try {
      var protocol = new URL(value, window.location.href).protocol;
      return protocol === "http:" || protocol === "https:" || (allowMail && protocol === "mailto:");
    } catch (_) {
      return false;
    }
  }

  function renderMarkdown(value) {
    if (!window.marked) return escapeHtml(value).replace(/\n/g, "<br>");

    var template = document.createElement("template");
    template.innerHTML = window.marked.parse(value, { breaks: true, gfm: true });

    var allowedTags = new Set([
      "A", "BLOCKQUOTE", "BR", "CODE", "DEL", "EM", "H1", "H2", "H3", "H4", "H5", "H6",
      "HR", "IMG", "LI", "OL", "P", "PRE", "STRONG", "TABLE", "TBODY", "TD", "TH", "THEAD", "TR", "UL"
    ]);
    var blockedTags = new Set([
      "BASE", "BUTTON", "EMBED", "FORM", "IFRAME", "INPUT", "LINK", "MATH", "META", "OBJECT",
      "OPTION", "SCRIPT", "SELECT", "STYLE", "SVG", "TEXTAREA"
    ]);

    template.content.querySelectorAll("*").forEach(function (element) {
      if (blockedTags.has(element.tagName)) {
        element.remove();
      } else if (!allowedTags.has(element.tagName)) {
        element.replaceWith.apply(element, Array.from(element.childNodes));
      }
    });

    var allowedAttributes = {
      A: ["href", "title"],
      CODE: ["class"],
      IMG: ["alt", "src", "title"],
      OL: ["start"],
      TD: ["align"],
      TH: ["align"]
    };
    template.content.querySelectorAll("*").forEach(function (element) {
      var attributes = allowedAttributes[element.tagName] || [];
      Array.from(element.attributes).forEach(function (attribute) {
        if (!attributes.includes(attribute.name)) element.removeAttribute(attribute.name);
      });
    });
    template.content.querySelectorAll("a[href]").forEach(function (link) {
      if (!safeUrl(link.getAttribute("href"), true)) link.removeAttribute("href");
      else if (link.origin !== window.location.origin) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    });
    template.content.querySelectorAll("img[src]").forEach(function (image) {
      if (!safeUrl(image.getAttribute("src"), false)) image.remove();
      else image.loading = "lazy";
    });
    return template.innerHTML;
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function hasTag(item, tag) {
    if (Array.isArray(item.tags) && item.tags.indexOf(tag) !== -1) return true;
    return new RegExp("(^|\\s)#" + escapeRegExp(tag) + "(\\b|\\s|$)", "i").test(contentOf(item));
  }

  function memoId(name) {
    return String(name || "").replace(/^memos\//, "");
  }

  function snippet(item) {
    return contentOf(item).replace(/\s+/g, " ").trim();
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
        return '<figure><img loading="lazy" src="' + url + '" alt="' + filename + '"></figure>';
      }
      return '<a class="solo-memo-file" href="' + url + '" target="_blank" rel="noopener">打开附件</a>';
    }).join("") + "</div>";
  }

  function renderRelations(item, byName, base) {
    var relations = item.relations || [];
    var groups = { "引用": [], "被引用": [] };
    relations.forEach(function (relation) {
      var type = relation.memo && relation.memo.name === item.name ? "引用" : "被引用";
      var memo = type === "引用" ? relation.relatedMemo : relation.memo;
      if (!memo || !memo.name) return;
      var full = byName[memo && memo.name] || memo || {};
      var text = snippet(full) || memoId(full.name);
      if (text) groups[type].push('<a href="' + base + "/m/" + memoId(full.name) + '" target="_blank" rel="noopener">' + escapeHtml(text) + "</a>");
    });

    return Object.keys(groups).map(function (title) {
      if (!groups[title].length) return "";
      return '<div class="solo-memo-relation"><div>' + title + "(" + groups[title].length + ")</div>" + groups[title].join("") + "</div>";
    }).join("");
  }

  function renderLocation(item) {
    if (!item.location) return "";
    var location = item.location.placeholder || [item.location.latitude, item.location.longitude].filter(Boolean).join(", ");
    return location ? '<div class="solo-memo-meta">地点：' + escapeHtml(location) + "</div>" : "";
  }

  function render(container, items, tag, base) {
    var byName = items.reduce(function (result, item) {
      if (item.name) result[item.name] = item;
      return result;
    }, {});
    var moments = items.filter(function (item) {
      return hasTag(item, tag);
    });

    if (!moments.length) {
      container.innerHTML = '<p class="solo-muted">暂无内容。</p>';
      return;
    }

    container.innerHTML = moments.map(function (item) {
      var content = renderMarkdown(contentOf(item));
      var date = formatDate(dateOf(item));
      return '<article class="solo-memo-item"><time>' + date + '</time><div class="solo-memo-markdown">' + content + "</div>" +
        renderAttachments(base, item) + renderRelations(item, byName, base) + renderLocation(item) + "</article>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.querySelector("[data-memos-feed]");
    if (!container) return;

    var config = window.SoloEternity || {};
    var base = (config.memosBase || "").replace(/\/$/, "");
    var tag = container.getAttribute("data-memos-tag") || config.memosTag || "moment";
    var markdownReady = loadMarkdownParser();
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
          markdownReady.then(function () {
            render(container, normalizeItems(payload), tag, base);
          }, function () {
            render(container, normalizeItems(payload), tag, base);
          });
        })
        .catch(function () {
          tryEndpoint(index + 1);
        });
    }

    tryEndpoint(0);
  });
})();
