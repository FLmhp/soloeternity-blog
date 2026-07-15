(function () {
  var galleryBase = "https://gallery.soloeternity.me";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseHtml(html) {
    return new DOMParser().parseFromString(html, "text/html");
  }

  function imageUrl(node) {
    try {
      var data = JSON.parse(decodeURIComponent(node.getAttribute("data-object") || ""));
      return (data.medium && data.medium.url) || (data.image && data.image.url) || node.dataset.thumb;
    } catch (_) {
      return node.dataset.thumb || "";
    }
  }

  function albumDetails(album) {
    return fetch(album.url, { credentials: "omit" })
      .then(function (response) {
        if (!response.ok) throw new Error("album request failed");
        return response.text();
      })
      .then(function (html) {
        var document = parseHtml(html);
        album.tags = Array.from(document.querySelectorAll("a.tag--pop-box"))
          .map(function (node) { return node.textContent.trim(); })
          .filter(Boolean);
        album.images = Array.from(document.querySelectorAll('.list-item[data-type="image"]')).map(function (node) {
          return {
            title: node.dataset.title || album.name,
            url: imageUrl(node),
            link: node.dataset.urlShort || album.url
          };
        }).filter(function (image) { return image.url; });
        return album;
      });
  }

  function render(container, albums) {
    if (!albums.length) {
      container.innerHTML = '<p class="solo-muted">暂无公开相册。</p>';
      return;
    }
    container.innerHTML = albums.map(function (album) {
      var tags = album.tags.map(function (tag) {
        return '<span class="solo-album-tag">' + escapeHtml(tag) + "</span>";
      }).join("");
      var images = album.images.map(function (image) {
        return '<a href="' + escapeHtml(image.link) + '" target="_blank" rel="noopener">' +
          '<img loading="lazy" decoding="async" src="' + escapeHtml(image.url) + '" alt="' + escapeHtml(image.title) + '"></a>';
      }).join("");
      return '<section class="solo-album"><header><h2>' + escapeHtml(album.name) + "</h2>" +
        (album.description ? "<p>" + escapeHtml(album.description) + "</p>" : "") +
        '<div class="solo-album-tags">' + tags + "</div></header>" +
        '<div class="solo-album-grid">' + images + "</div></section>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.querySelector("[data-gallery-albums]");
    if (!container) return;
    fetch(galleryBase + "/explore/albums", { credentials: "omit" })
      .then(function (response) {
        if (!response.ok) throw new Error("album list request failed");
        return response.text();
      })
      .then(function (html) {
        var document = parseHtml(html);
        var albums = Array.from(document.querySelectorAll('.list-item[data-type="album"]')).map(function (node) {
          return {
            name: node.dataset.name || "未命名相册",
            description: node.dataset.description || "",
            url: node.dataset.urlShort || galleryBase + "/album/" + node.dataset.id,
            tags: [],
            images: []
          };
        });
        return Promise.all(albums.map(albumDetails));
      })
      .then(function (albums) { render(container, albums); })
      .catch(function () {
        container.innerHTML = '<p class="solo-muted">相册暂时无法加载。</p>';
      });
  });
})();
