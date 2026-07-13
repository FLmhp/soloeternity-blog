# 美化文档

## 1. 文档目标

本文档只记录当前仓库已经落地的视觉增强和交互特效，包括：

- 建站时间统计
- 浏览器标签恶搞标题
- 副标题颜色渐变
- 鼠标点击烟花特效
- 首页樱花飘落特效
- 页脚养鱼
- 彩虹加载动画
- 背景全屏固定
- 毛玻璃效果面板
- 鼠标移动小星星特效
- 导航栏标题 SVG 描边渐显
- 导航栏标题霓虹灯特效
- 打字礼花特效
- 首页文章滑入动画
- 滚动条自定义渐变样式
- Live2D Widget

说明：

- 你提到的 `live2d-winget`，仓库里实际接入的是 `live2d-widget`
- 你提到的“标签恶搞”，当前实现对应的是浏览器标签页标题恶搞

## 1.1 当前线上启用状态（2026-07-08）

本次核验时，文档中列出的这组美化功能仍然和仓库配置一致：

- `custom_js` 中仍启用了烟花、鱼池、加载动画、滚动卡片、星星、标题恶搞、输入礼花
- `custom_css` 中仍启用了渐变副标题、毛玻璃、滚动条、SVG 霓虹标题等样式
- `scripts/injects.js` 仍在注入 `#web_bg`、首页加载器、首页樱花、首页 SVG 标题特效、Live2D autoload

也就是说，当前这份文档不是“曾经设计过什么”，而是“仓库里现在还在启用什么”。

---

## 2. 特效入口总览

### 2.1 JS 入口

在 `_config.fluid.yml` 的 `custom_js` 中注册：

```yaml
custom_js:
  - /js/anime.min.js
  - /js/custom.js
  - /js/duration.js
  - /js/fireworks.js
  - /js/fishes.js
  - /js/loader.js
  - /js/scrollanimation.js
  - /js/stars.js
  - /js/title.js
  - /js/typing-effect.js
```

### 2.2 CSS 入口

在 `_config.fluid.yml` 的 `custom_css` 中注册：

```yaml
custom_css:
  - /css/custom.css
  - /css/fish.css
  - /css/glassbackground.css
  - /css/gradient.css
  - /css/indexing-hover.css
  - /css/loader.css
  - /css/macpanel
  - /css/scrollanimation.css
  - /css/scrollbar.css
  - /css/selection.css
  - /css/svg-neon.css
```

### 2.3 模板注入入口

`scripts/injects.js` 当前负责注入：

```js
hexo.extend.injector.register('head_end', '<script>if(!localStorage.getItem("waifu-display")){localStorage.setItem("waifu-display",Date.now())}</script><script defer src="/live2d-widget/dist/autoload.js"></script>');
hexo.extend.injector.register("body_begin", '<div id="web_bg"></div>');
hexo.extend.injector.register('body_begin', '<div id="loader-container">...</div>', 'home');
hexo.extend.injector.register('body_end', '<script src="/js/sakura.js"></script>', 'home');
hexo.extend.injector.register('body_end', '<script src="/js/backgroundize.js"></script>');
hexo.extend.injector.register('body_end', '<script src="/js/svg-neon.js?v=2"></script>');
```

---

## 3. 功能对照表

| 功能 | 入口文件 | 作用范围 | 备注 |
| --- | --- | --- | --- |
| 建站时间统计 | `_config.fluid.yml` + `source/js/duration.js` | 全站 footer | 依赖 `#timeDate` 和 `#times` |
| 浏览器标签恶搞标题 | `source/js/title.js` | 全站 | 切换标签页时修改标题和 favicon |
| 副标题颜色渐变 | `source/css/gradient.css` | 首屏 subtitle | 配合 Typed 光标渐变 |
| 鼠标点击烟花 | `_config.fluid.yml:custom_html` + `source/js/fireworks.js` | 全站 | 依赖固定定位 canvas |
| 首页樱花飘落 | `scripts/injects.js` + `source/js/sakura.js` | 首页 | 只注入 `home` |
| 页脚养鱼 | `source/js/fishes.js` + `source/js/fish.js` + `source/css/fish.css` | 页脚 | 自动在 footer 追加容器 |
| 彩虹加载动画 | `scripts/injects.js` + `source/css/loader.css` + `source/js/loader.js` | 首页 | 进入页面后淡出 |
| 背景全屏固定 | `scripts/injects.js` + `source/js/backgroundize.js` | 全站 | 复用 banner 图做全屏背景 |
| 毛玻璃效果面板 | `source/css/glassbackground.css` + `ground_glass` | 内容板 / TOC / navbar | 部分由主题原生支持 |
| 鼠标移动小星星 | `source/js/stars.js` | 全站 | 跟随指针生成彩色星星 |
| 导航栏标题 SVG 描边 | `source/js/svg-neon.js` + `source/css/svg-neon.css` | 首页导航栏 | 替换 `.navbar-brand strong` |
| 导航栏标题霓虹灯 | `source/js/svg-neon.js` + `source/css/svg-neon.css` | 全站导航栏 | 首页完成 SVG 动画后进入霓虹循环，其他页面直接显示霓虹文字 |
| 打字礼花特效 | `source/js/typing-effect.js` | 全站输入区 | 输入时喷射粒子 |
| 首页文章滑入动画 | `source/js/scrollanimation.js` + `source/css/scrollanimation.css` | 首页文章卡片 | 控制 `.index-card` |
| 滚动条渐变样式 | `source/css/scrollbar.css` | 全站 | 包括表格横向滚动条 |
| Live2D Widget | `scripts/injects.js` + `themes/fluid/source/live2d-widget` | 全站 | 当前启用本地 autoload 版本 |

---

## 4. 建站时间统计

### 4.1 入口

`_config.fluid.yml`

```yaml
footer:
  content: |
    <div>
      <span id="timeDate">载入天数...</span>
      <span id="times">载入时分秒...</span>
      <script src="/js/duration.js"></script>
      <a href="/atom.xml" target="_blank" rel="nofollow noopener"><i class="iconfont icon-rss"></i></a>
    </div>
```

`source/js/duration.js`

```js
var startDate = new Date("2025-07-27T12:00:00");
document.getElementById("timeDate").innerHTML = "本站已在夹缝中生存 " + days + " 天 ";
document.getElementById("times").innerHTML = hours + " 小时 " + minutes + " 分 " + seconds + " 秒";
```

### 4.2 修改建站时间

只需要改 `startDate`：

```js
var startDate = new Date("2026-01-01T00:00:00");
```

### 4.3 修改文案

```js
document.getElementById("timeDate").innerHTML = "本站已运行 " + days + " 天 ";
```

---

## 5. 浏览器标签恶搞标题

### 5.1 入口

`source/js/title.js`

```js
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    document.title = '╭(°A°`)╮ 页面崩溃啦 ~';
  } else {
    document.title = '(ฅ>ω<*ฅ) 噫又好啦 ~' + OriginTitle;
  }
});
```

### 5.2 修改文案

直接改这两行即可：

```js
document.title = '你怎么走了 QAQ';
document.title = '欢迎回来 OwO ' + OriginTitle;
```

---

## 6. 副标题颜色渐变

### 6.1 入口

`source/css/gradient.css`

```css
#subtitle {
  background: linear-gradient(-45deg, #ee7752, #ce3e75, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: Gradient 10s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.typed-cursor {
  background: linear-gradient(-45deg, #ee7752, #ce3e75, #23a6d5, #23d5ab);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 6.2 前置条件

副标题节点来自：

```ejs
<span id="subtitle" data-typed-text="<%= subtitle %>"></span>
```

Typed 开关在 `_config.fluid.yml`：

```yaml
fun_features:
  typing:
    enable: true
```

### 6.3 修改渐变色

```css
background: linear-gradient(-45deg, #ff7b7b, #ffd166, #06d6a0, #118ab2);
```

---

## 7. 鼠标点击烟花特效

### 7.1 入口

`_config.fluid.yml`

```yaml
custom_html: <canvas class="fireworks" style="position:fixed;left:0;top:0;z-index:99999999;pointer-events:none;"> </canvas>
```

`source/js/fireworks.js`

```js
var canvasEl = document.querySelector(".fireworks");
```

### 7.2 工作原理

- 页面中先放一个固定定位的 `<canvas>`
- `fireworks.js` 监听点击位置
- `anime.min.js` 驱动粒子扩散和圆环动画

### 7.3 关闭方法

1. 从 `custom_js` 中移除 `/js/fireworks.js`
2. 或把 `custom_html` 里的 `<canvas class="fireworks">` 删除

---

## 8. 首页樱花飘落特效

### 8.1 入口

`scripts/injects.js`

```js
hexo.extend.injector.register('body_end', '<script src="/js/sakura.js"></script>', 'home');
```

`source/js/sakura.js`

```js
canvas.setAttribute('id', 'canvas_sakura');
for (var i = 0; i < 12; i++) {
  // 初始化花瓣
}
```

### 8.2 作用范围

只在 `home` 页面注入。

### 8.3 关闭方法

删除或注释：

```js
hexo.extend.injector.register('body_end', '<script src="/js/sakura.js"></script>', 'home');
```

---

## 9. 页脚养鱼

### 9.1 入口

`source/js/fishes.js`

```js
$("footer").append('<div class="container" id="jsi-flying-fish-container"></div>');
$("body").append('<script src="/js/fish.js"></script>');
$("body").append('<script src="/js/fish-theme.js"></script>');
```

`source/css/fish.css`

```css
#jsi-flying-fish-container {
  position: absolute;
  height: 128px;
  z-index: -1;
}
```

### 9.2 主题联动

`source/js/fish-theme.js` 会跟随明暗主题切换鱼池背景色。

### 9.3 调整数目与范围

`source/js/fish.js`

```js
FISH_COUNT : 3,
POINT_INTERVAL : 5,
THRESHOLD : 50,
```

可直接调整：

- `FISH_COUNT`：鱼数量基数
- `height`：鱼池可见高度

---

## 10. 彩虹加载动画

### 10.1 入口

`scripts/injects.js`

```js
hexo.extend.injector.register('body_begin', `
<div id="loader-container">
  <div id="loader" class="loader"></div>
  ...
</div>`, 'home');
```

`source/css/loader.css`

```css
.loader-line-wrap:nth-child(1) .loader-line { border-color: hsl(0, 80%, 60%); }
.loader-line-wrap:nth-child(2) .loader-line { border-color: hsl(60, 80%, 60%); }
.loader-line-wrap:nth-child(3) .loader-line { border-color: hsl(120, 80%, 60%); }
.loader-line-wrap:nth-child(4) .loader-line { border-color: hsl(180, 80%, 60%); }
.loader-line-wrap:nth-child(5) .loader-line { border-color: hsl(240, 80%, 60%); }
```

`source/js/loader.js`

```js
$("#loader-container").fadeOut(300);
```

### 10.2 作用范围

当前只在首页显示。

---

## 11. 背景全屏固定

### 11.1 入口

`scripts/injects.js`

```js
hexo.extend.injector.register("body_begin", '<div id="web_bg"></div>');
hexo.extend.injector.register("body_end", '<script src="/js/backgroundize.js"></script>');
```

`source/js/backgroundize.js`

```js
document.querySelector('#web_bg').setAttribute(
  'style',
  `background-image: ${document.querySelector('.banner').style.background.split(' ')[0]};position: fixed;width: 100%;height: 100%;z-index: -1;background-size: cover;`
);
```

### 11.2 效果说明

- 读取当前页面 `.banner` 的背景图
- 写入到全局的 `#web_bg`
- 把原始 banner 背景清空
- 形成“首屏横幅图变全屏固定背景”的视觉效果

---

## 12. 毛玻璃效果面板

### 12.1 CSS 毛玻璃

`source/css/glassbackground.css`

```css
#board {
  backdrop-filter: blur(15px);
}

#toc {
  backdrop-filter: blur(15px);
}
```

### 12.2 主题自带导航栏毛玻璃

`_config.fluid.yml`

```yaml
navbar:
  ground_glass:
    enable: true
    px: 3
```

### 12.3 调整模糊强度

```css
backdrop-filter: blur(24px);
```

或：

```yaml
ground_glass:
  px: 6
```

---

## 13. 鼠标移动小星星特效

### 13.1 入口

`source/js/stars.js`

```js
document.addEventListener("mousemove", o);
this.character = "*";
var r = ["#f94a70","#ffd12b","#49c99a","#1f90ed"];
```

### 13.2 修改字符

如果想把 `*` 改成别的字符：

```js
this.character = "✦";
```

### 13.3 修改颜色

```js
var r = ["#ff7eb6", "#7afcff", "#feff9c", "#fff740"];
```

---

## 14. 导航栏标题 SVG 描边渐显

### 14.1 入口

`themes/fluid/layout/_partials/header/navigation.ejs`

```ejs
<a class="navbar-brand" href="<%= url_for() %>">
  <strong><%= theme.navbar.blog_title || config.title %></strong>
</a>
```

`source/js/svg-neon.js` 会把上面的 `<strong>` 替换为：

- 一个 SVG 描边动画层
- 一个文字霓虹层

### 14.2 关键代码

```js
const container = document.createElement('span');
container.className = 'navbar-title-container';
container.appendChild(svg);
container.appendChild(navbarTitle);
```

### 14.3 动画参数

```js
path.style.animation = 'navbarSvgDraw 16s ease-in-out 0s forwards, navbarSvgFade 2s 4s forwards';
```

如果想缩短描边动画：

```js
path.style.animation = 'navbarSvgDraw 8s ease-in-out 0s forwards, navbarSvgFade 1s 3s forwards';
```

---

## 15. 导航栏标题霓虹灯特效

### 15.1 入口

`source/css/svg-neon.css`

```css
.navbar-brand .navbar-title {
  --c: lightseagreen;
  text-shadow: 0 0 10px var(--c), 0 0 20px var(--c), 0 0 40px var(--c), 0 0 80px var(--c), 0 0 160px var(--c);
  animation: neoneffect 5s linear infinite;
}
```

### 15.2 修改霓虹主色

```css
--c: #7df9ff;
```

### 15.3 修改循环速度

```css
animation: neoneffect 2.5s linear infinite;
```

---

## 16. 打字礼花特效

### 16.1 入口

`source/js/typing-effect.js`

```js
POWERMODE.colorful = !0;
POWERMODE.shake = !1;
document.body.addEventListener("input", POWERMODE);
```

### 16.2 效果说明

这个特效并不是首页副标题打字机，而是：

- 在输入框、文本框或可选中文本输入时
- 在光标位置喷射彩色粒子

也就是典型的 `input powermode` 效果。

### 16.3 关闭方法

从 `custom_js` 中移除：

```yaml
- /js/typing-effect.js
```

---

## 17. 首页文章滑入动画

### 17.1 入口

`source/js/scrollanimation.js`

```js
const cards = document.querySelectorAll('.index-card')
card.setAttribute('style', `--state: ${(card.getBoundingClientRect().top - origin) < 0 ? 1 : 0};`)
```

`source/css/scrollanimation.css`

```css
.index-card {
  transition: all 0.5s;
  transform: scale(calc(1.5 - 0.5 * var(--state)));
  opacity: var(--state);
}
```

### 17.2 效果说明

- 首页文章卡片进入视口前更大且透明
- 滚动到阈值后恢复正常尺寸和透明度

---

## 18. 滚动条自定义渐变样式

### 18.1 入口

`source/css/scrollbar.css`

```css
html::-webkit-scrollbar-thumb,
body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #30a9de, #2f4154) !important;
}
```

表格横向滚动条也做了单独处理：

```css
.markdown-body table::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #30a9de, #2f4154) !important;
}
```

### 18.2 修改配色

```css
background: linear-gradient(180deg, #ff7b7b, #6c5ce7) !important;
```

---

## 19. Live2D Widget

### 19.1 当前启用方式

`scripts/injects.js`

```js
hexo.extend.injector.register('head_end', '<script src="/live2d-widget/dist/autoload.js"></script>');
```

也就是说，当前实际启用的是仓库内的：

```text
themes/fluid/source/live2d-widget/dist/autoload.js
```

看板娘首次访问默认折叠，只显示右下角唤出按钮。当前模型为 IceGirl、让·巴尔、俾斯麦、半人马和翔鹤；后四个模型来自 `zenghongtu/live2d-model-assets`。

### 19.2 可选备用方案

仓库里还保留了一个未启用的远程 CDN 版本：

```js
// source/js/live2d.js
script.src = "https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0-rc.6/dist/autoload.js";
```

当前 `_config.fluid.yml` 中该入口仍是注释状态：

```yaml
# - /js/live2d.js
```

### 19.3 关闭 Live2D

直接删掉或注释 `scripts/injects.js` 中这一行：

```js
hexo.extend.injector.register('head_end', '<script src="/live2d-widget/dist/autoload.js"></script>');
```

---

## 20. 常见修改策略

### 20.1 暂时关闭单个特效

优先做法是从 `_config.fluid.yml` 里移除对应文件：

```yaml
custom_js:
  - /js/fireworks.js
```

删掉这一行即可关闭烟花。

### 20.2 关闭模板注入类特效

如果是 `loader`、`sakura`、`background`、`live2d` 这类依赖 `injects.js` 的功能，就去改：

```text
scripts/injects.js
```

### 20.3 修改后验证

```bash
pnpm clean
pnpm build
pnpm server
```

重点检查：

- 首页首屏
- 导航栏标题
- footer 鱼池
- 评论输入区
- 文章列表卡片动画

---

## 21. 推荐维护习惯

1. 先改 `source/js` / `source/css`，再改 `_config.fluid.yml` 的注册列表。
2. 文案类调整尽量集中到单个脚本，例如 `duration.js`、`title.js`。
3. 涉及中文字符串的环境变量文件优先用 `UTF-8` 保存。
4. 视觉增强脚本尽量避免重复操作 DOM，优先按页面作用域注入。

---

## 22. 新增页面视觉规范

- 自定义页面统一使用 Fluid 的 `layout: page` 和 80% Banner 高度，正文板块起始位置与归档页一致。
- Glass 卡片统一由 `source/css/pages-glass-v9.css?v=10` 提供半透明背景、描边、阴影和 `backdrop-filter`。
- Gallery 相册和 Anime 条目沿用同一套圆角、毛玻璃和深色模式规则，不创建独立主题。
- 页面背景统一从 R2 的 `images/backgrounds/*.webp` 读取，本地镜像保存在 `source/img/backgrounds/`。
