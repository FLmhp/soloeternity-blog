(function () {
  function pickFallback(config) {
    var list = config.quotesFallback || [];
    return list[Math.floor(Math.random() * list.length)] || { text: "文字正在路上。", from: "SoloEternity" };
  }

  function renderQuote(quote) {
    var text = document.getElementById("hitokoto-text");
    var from = document.getElementById("hitokoto-from");
    if (!text || !from) return;
    text.textContent = quote.text || quote.hitokoto || "文字正在路上。";
    from.textContent = quote.from || quote.from_who || quote.creator || "一言";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var config = window.SoloEternity || {};
    if (!document.getElementById("hitokoto-text")) return;

    fetch(config.hitokotoEndpoint || "https://v1.hitokoto.cn/?encode=json", { cache: "no-store" })
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
  });
})();
