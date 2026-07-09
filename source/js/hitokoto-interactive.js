(function () {
  function pickFallback(config) {
    var list = config.quotesFallback || [];
    return list[Math.floor(Math.random() * list.length)] || { text: "文字正在路上。", from: "SoloEternity" };
  }

  function renderQuote(quote) {
    var text = document.getElementById("hitokoto-text");
    var from = document.getElementById("hitokoto-from");
    if (!text || !from) return;
    var box = text.closest(".solo-hitokoto");
    if (box) box.classList.remove("solo-hitokoto-loading");
    text.textContent = quote.text || quote.hitokoto || "文字正在路上。";
    from.textContent = quote.from || quote.from_who || quote.creator || "一言";
  }

  function loadQuote(config) {
    var box = document.querySelector(".solo-hitokoto");
    if (box) box.classList.add("solo-hitokoto-loading");
    return fetch(config.hitokotoEndpoint || "https://v1.hitokoto.cn/?encode=json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("hitokoto request failed");
        return response.json();
      })
      .then(function (data) {
        renderQuote({
          text: data.hitokoto,
          from: data.from_who ? data.from_who + "《" + data.from + "》" : data.from
        });
      })
      .catch(function () {
        renderQuote(pickFallback(config));
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var config = window.SoloEternity || {};
    var box = document.querySelector(".solo-hitokoto");
    if (!box || !document.getElementById("hitokoto-text")) return;

    box.setAttribute("role", "button");
    box.setAttribute("tabindex", "0");
    box.addEventListener("click", function () { loadQuote(config); });
    box.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") loadQuote(config);
    });
    loadQuote(config);
  });
})();
