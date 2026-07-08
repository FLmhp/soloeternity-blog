(function () {
  window.SoloEternity = Object.assign(window.SoloEternity || {}, {
    assetsBase: "https://assets.soloeternity.me",
    memosBase: "https://memos.soloeternity.me",
    memosTag: "moment",
    hitokotoEndpoint: "https://v1.hitokoto.cn/?encode=json",
    quotesFallback: [
      { text: "愿你有足够的云翳，来造成一个美丽的黄昏。", from: "本地语录" },
      { text: "文字是慢速的备份，Git 是它的时间机器。", from: "SoloEternity" },
      { text: "把服务自托管，不是为了孤岛，而是为了在浪潮退去时仍能开灯。", from: "SoloEternity" }
    ],
    music: [
      {
        name: "夜航占位曲目",
        artist: "SoloEternity",
        url: "https://assets.soloeternity.me/music/night-voyage.mp3",
        cover: "https://assets.soloeternity.me/images/gallery/cover.jpg"
      }
    ]
  });
})();
