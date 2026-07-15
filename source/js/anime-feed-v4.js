(function () {
  var api = "https://api.bgm.tv/v0/users/soloeternity";
  var cachePrefix = "solo-bangumi:";
  var cacheTtl = 30 * 60 * 1000;
  var statuses = [
    { type: 1, name: "想看" },
    { type: 2, name: "看过" },
    { type: 3, name: "在看" },
    { type: 4, name: "搁置" },
    { type: 5, name: "抛弃" }
  ];
  var cache = {};

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function request(url) {
    try {
      var cached = JSON.parse(sessionStorage.getItem(cachePrefix + url));
      if (cached && Date.now() - cached.time < cacheTtl) return Promise.resolve(cached.data);
    } catch (_) {}
    return fetch(url, { headers: { Accept: "application/json" } }).then(function (response) {
      if (!response.ok) throw new Error("Bangumi request failed");
      return response.json();
    }).then(function (data) {
      try { sessionStorage.setItem(cachePrefix + url, JSON.stringify({ time: Date.now(), data: data })); } catch (_) {}
      return data;
    });
  }

  function collectionUrl(type, limit, offset) {
    return api + "/collections?subject_type=2&type=" + type + "&limit=" + limit + "&offset=" + offset;
  }

  function loadCollection(type, offset, items) {
    return request(collectionUrl(type, 50, offset)).then(function (page) {
      var merged = items.concat(page.data || []);
      return merged.length < page.total
        ? loadCollection(type, offset + page.limit, merged)
        : merged;
    });
  }

  function tagsOf(subject) {
    return (subject.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="solo-anime-tag">' + escapeHtml(tag.name) + "</span>";
    }).join("");
  }

  function renderItems(container, items, status) {
    var list = container.querySelector("[data-anime-list]");
    if (!items.length) {
      list.innerHTML = '<p class="solo-muted">暂无公开记录。</p>';
      return;
    }
    list.innerHTML = items.map(function (item) {
      var subject = item.subject || {};
      var image = subject.images && (subject.images.common || subject.images.medium || subject.images.large);
      var progress = subject.eps ? item.ep_status + "/" + subject.eps + " 集" : "";
      var year = subject.date ? subject.date.slice(0, 4) : "";
      return '<article class="solo-anime-card"><a href="https://bgm.tv/subject/' + subject.id + '" target="_blank" rel="noopener" title="在 Bangumi 查看' + escapeHtml(subject.name_cn || subject.name) + '">' +
        (image ? '<div class="solo-anime-cover">' + (subject.score ? '<span class="solo-anime-score">★ ' + subject.score + '</span>' : '') + '<img loading="lazy" decoding="async" fetchpriority="low" referrerpolicy="no-referrer" src="' + escapeHtml(image) + '" alt="' + escapeHtml(subject.name_cn || subject.name) + '"></div>' : "") +
        '<div class="solo-anime-card-body"><div class="solo-anime-meta"><span>' + status.name + "</span>" +
        (item.rate ? "<span>我的评分 " + item.rate + "</span>" : "") +
        (progress ? "<span>" + progress + "</span>" : "") + "</div>" +
        '<h3>' + escapeHtml(subject.name_cn || subject.name) + "</h3>" +
        (subject.name_cn ? '<p class="solo-anime-original">' + escapeHtml(subject.name) + "</p>" : "") +
        (subject.short_summary ? '<p class="solo-anime-summary">' + escapeHtml(subject.short_summary) + "</p>" : "") +
        '<div class="solo-anime-footer">' + (year ? "<span>" + year + "</span>" : "") + tagsOf(subject) + "</div></div></a></article>";
    }).join("");
  }

  function renderShell(container, user, totals) {
    var total = statuses.reduce(function (sum, status) { return sum + totals[status.type]; }, 0);
    var completed = totals[2];
    var completion = total ? (completed * 100 / total).toFixed(1) : "0.0";
    container.innerHTML = '<section class="solo-anime-profile"><a href="' + escapeHtml(user.url) + '" target="_blank" rel="noopener">' +
      '<img referrerpolicy="no-referrer" src="' + escapeHtml(user.avatar && user.avatar.large) + '" alt="' + escapeHtml(user.nickname) + '">' +
      '<div><strong>' + escapeHtml(user.nickname) + '</strong><span>@' + escapeHtml(user.username) + "</span></div></a>" +
      '<div class="solo-anime-stats"><span><b>' + total + "</b>收藏</span><span><b>" + completed + "</b>看过</span><span><b>" + completion + "%</b>完成率</span></div></section>" +
      '<div class="solo-anime-filters">' + statuses.map(function (status) {
        return '<button' + (status.type === 3 ? ' class="active"' : '') + ' data-anime-type="' + status.type + '">' + status.name + "（" + totals[status.type] + "）</button>";
      }).join("") + '</div><div class="solo-anime-grid" data-anime-list><p class="solo-muted">正在读取在看记录...</p></div>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.querySelector("[data-anime-collection]");
    if (!container) return;
    var requestId = 0;

    function show(type) {
      var status = statuses.find(function (item) { return item.type === type; });
      var current = ++requestId;
      container.querySelector("[data-anime-list]").innerHTML = '<p class="solo-muted">正在读取' + status.name + "记录...</p>";
      var pending = cache[type] || loadCollection(type, 0, []);
      cache[type] = pending;
      pending.then(function (items) {
        cache[type] = Promise.resolve(items);
        if (current === requestId) renderItems(container, items, status);
      }).catch(function () {
        if (current === requestId) container.querySelector("[data-anime-list]").innerHTML = '<p class="solo-muted">Bangumi 收藏暂时无法加载。</p>';
      });
    }

    Promise.all([
      request(api),
      Promise.all(statuses.map(function (status) {
        return request(collectionUrl(status.type, 1, 0)).then(function (page) { return page.total; });
      }))
    ]).then(function (result) {
      var totals = {};
      statuses.forEach(function (status, index) { totals[status.type] = result[1][index]; });
      renderShell(container, result[0], totals);
      container.addEventListener("click", function (event) {
        var button = event.target.closest("[data-anime-type]");
        if (!button || button.classList.contains("active")) return;
        container.querySelectorAll("[data-anime-type]").forEach(function (item) { item.classList.remove("active"); });
        button.classList.add("active");
        show(Number(button.dataset.animeType));
      });
      show(3);
    }).catch(function () {
      container.innerHTML = '<p class="solo-muted">Bangumi 收藏暂时无法加载。</p>';
    });
  });
})();
