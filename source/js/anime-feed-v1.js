(function () {
  var endpoint = "https://api.bgm.tv/calendar";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function render(container, days, selected) {
    var items = days.reduce(function (result, day) {
      if (selected === "all" || String(day.weekday.id) === selected) {
        day.items.forEach(function (item) { result.push(item); });
      }
      return result;
    }, []);
    container.querySelector("[data-anime-list]").innerHTML = items.map(function (item) {
      var image = item.images && (item.images.large || item.images.common || item.images.medium);
      return '<article class="solo-anime-card"><a href="https://bgm.tv/subject/' + item.id + '" target="_blank" rel="noopener">' +
        (image ? '<img loading="lazy" decoding="async" referrerpolicy="no-referrer" src="' + escapeHtml(image) + '" alt="' + escapeHtml(item.name_cn || item.name) + '">' : "") +
        '<div><h3>' + escapeHtml(item.name_cn || item.name) + "</h3>" +
        (item.name_cn ? "<p>" + escapeHtml(item.name) + "</p>" : "") +
        '<span>评分 ' + escapeHtml(item.rating && item.rating.score ? item.rating.score : "暂无") + "</span></div></a></article>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.querySelector("[data-anime-calendar]");
    if (!container) return;
    fetch(endpoint, { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("Bangumi request failed");
        return response.json();
      })
      .then(function (days) {
        container.innerHTML = '<div class="solo-anime-filters"><button class="active" data-anime-day="all">全部</button>' +
          days.map(function (day) {
            return '<button data-anime-day="' + day.weekday.id + '">' + escapeHtml(day.weekday.cn) + "</button>";
          }).join("") + '</div><div class="solo-anime-grid" data-anime-list></div>';
        container.addEventListener("click", function (event) {
          var button = event.target.closest("[data-anime-day]");
          if (!button) return;
          container.querySelectorAll("[data-anime-day]").forEach(function (item) { item.classList.remove("active"); });
          button.classList.add("active");
          render(container, days, button.dataset.animeDay);
        });
        render(container, days, "all");
      })
      .catch(function () {
        container.innerHTML = '<p class="solo-muted">Bangumi 放送表暂时无法加载。</p>';
      });
  });
})();
