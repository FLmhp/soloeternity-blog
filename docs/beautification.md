# 博客美化与前端增强文档

本文记录当前仓库实际启用的 Fluid 主题视觉增强、动态页面组件和维护原则。最后核验：`2026-07-15`。

## 1. 设计原则

- 保留 Hexo + Fluid 的页面结构，不复制整套主题模板。
- 导航使用英文，页面标题和正文使用简体中文。
- 新增页面继续使用 Fluid `layout: page`，保持 banner、正文宽度和页脚一致。
- 卡片采用半透明毛玻璃，而不是不透明深色块。
- 动画只增强反馈，不能阻塞正文、导航或辅助功能。
- 音乐、Live2D、Memos、Gallery、Anime 等重资源延迟加载。
- 媒体优先 R2，运行时必须同源的资源保留在静态站。
- 所有页面必须同时检查桌面、移动端、亮色和暗色主题。

## 2. 资源入口

### 2.1 JavaScript

`_config.fluid.yml` 当前注册：

```yaml
custom_js:
  - /js/site-config-v3.js?v=4
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
  - /js/hitokoto-cooldown.js
  - /js/memos-feed-v5.js?v=7
  - /js/gallery-feed-v1.js
  - /js/anime-feed-v4.js
  - /js/aplayer-1.10.1.min.js
  - /js/music-dock-v6.js?v=7
  - /js/analytics-v2.js
```

实际文件名以配置为准。修改脚本后应同步更新查询参数版本，避免 Cloudflare 和浏览器继续使用旧文件。

### 2.2 CSS

```yaml
custom_css:
  - /css/custom.css
  - /css/pages-glass-v9.css?v=13
  - /css/aplayer-1.10.1.min.css
  - /css/fish.css
  - /css/glassbackground.css
  - /css/gradient.css
  - /css/indexing-hover.css
  - /css/loader.css
  - /css/macpanel
  - /css/scrollanimation.css
  - /css/scrollbar.css
  - /css/selection.css
  - /css/svg-neon.css?v=2
```

`pages-glass-v9.css` 是新增页面、音乐播放器、动态卡片和 Anime 卡片的统一外观层。不要在每个页面重复创建一套近似的背景和边框样式。

### 2.3 Hexo 注入

`scripts/injects.js` 负责：

- 全屏固定背景容器 `#web_bg`
- 首页加载动画
- 首页樱花
- SVG/霓虹导航标题脚本
- Live2D 本地 autoload
- 需要早于主题脚本存在的 DOM

注入应限制页面作用域。首页专用樱花和加载器不能无条件注入全部页面。

## 3. 功能总览

| 功能 | 入口 | 范围 |
| --- | --- | --- |
| 建站时间 | `duration.js` + footer | 全站 |
| 标签页标题变化 | `title.js` | 全站 |
| 副标题渐变 | `gradient.css` | 首页 banner |
| 点击烟花 | `fireworks.js` | 全站 |
| 樱花飘落 | `sakura.js` | 首页 |
| 页脚鱼池 | `fishes.js` / `fish.js` / `fish.css` | 页脚 |
| 彩虹加载器 | `loader.js` / `loader.css` | 首页 |
| 顶部渐变进度条 | `custom.js` / `custom.css` | 全站 |
| 固定背景 | `backgroundize.js` | 全站 |
| 毛玻璃卡片 | `glassbackground.css` / `pages-glass-v9.css` | 全站与新增页 |
| 鼠标星星 | `stars.js` | 桌面端 |
| SVG 描边和霓虹标题 | `svg-neon.js` / `svg-neon.css` | 全站 navbar brand |
| 打字礼花 | `typing-effect.js` | 输入框 |
| 首页文章滑入 | `scrollanimation.js` / CSS | 首页 |
| 渐变滚动条 | `scrollbar.css` | 全站 |
| Hitokoto | `hitokoto-cooldown.js` | Quotes |
| Memos Feed | `memos-feed-v5.js` | Essays/Moments |
| Gallery Feed | `gallery-feed-v1.js` | Gallery |
| Bangumi Feed | `anime-feed-v4.js` | Anime |
| 音乐播放器 | APlayer + `music-dock-v6.js` | 全站 |
| Live2D | 本地 widget | 全站，首次隐藏 |
| 行为分析 | `analytics-v2.js` | 全站 |

## 4. 建站时间

`source/js/duration.js` 以固定建站时间计算天、小时、分、秒，再写入页脚。

维护要求：

- 起始时间必须带明确时区或按 `Asia/Shanghai` 解释。
- 不要用构建时间作为建站时间。
- DOM 不存在时脚本应安全退出。
- 使用 `setInterval` 每秒更新即可，不需要更高频率。

页面在后台时可暂停高频更新以减少资源消耗，但当前每秒一次开销很小。

## 5. 浏览器标题效果

`title.js` 监听 `visibilitychange`：

- 用户切换到其他标签页时显示趣味标题。
- 用户返回时恢复原始标题。

脚本必须缓存真实 `document.title`，不能覆盖文章标题、SEO 标题或永久保留趣味文案。

## 6. 副标题渐变

`gradient.css` 为首页 Typed 副标题设置动画渐变：

```css
background-image: linear-gradient(90deg, #14d8c4, #43b7ff, #ff7a59);
background-clip: text;
color: transparent;
```

注意：

- 保证浅色和深色背景上的对比度。
- Typed 光标单独设置颜色，不要继承透明文字。
- `prefers-reduced-motion` 下关闭持续位移动画。

## 7. 烟花、星星和打字礼花

三个效果都创建短生命周期粒子：

- 点击烟花：鼠标/触摸点击触发。
- 小星星：指针移动触发。
- 打字礼花：文本输入触发。

维护原则：

- 元素使用 `pointer-events: none`。
- 设置最大粒子数量和自动回收。
- 移动端降低数量。
- 在 `prefers-reduced-motion: reduce` 下关闭。
- 不把粒子层放到导航和表单之上截获事件。

## 8. 首页樱花

樱花只在首页注入。它与背景大图、Live2D 和鼠标粒子叠加时可能增加合成开销。

建议限制：

- 标签页不可见时停止动画。
- 移动端减少花瓣数。
- 不使用超大透明 PNG。
- z-index 低于导航、评论框和 Live2D 控件。

## 9. 页脚鱼池

鱼池容器由脚本追加到 footer 周围，使用 CSS 控制高度和层级。

它不能覆盖：

- 建站时间
- Busuanzi 统计
- RSS 链接
- 回到顶部按钮
- 移动端底部安全区

页面内容很短时也要保证 footer 不被固定背景吞没。

## 10. 彩虹加载和顶部进度条

### 10.1 首页加载动画

首页加载器在页面可用后淡出。必须有超时兜底，即使某个外部资源失败也不能永久遮住页面。

### 10.2 顶部进度条

顶部渐变条表达页面加载/滚动进度：

- fixed 定位在 viewport 顶部。
- 高度保持轻量，不影响 navbar 布局。
- 颜色使用站点青蓝橙体系。
- 完成后淡出。
- 不依赖大型第三方库。

## 11. 固定背景

`#web_bg` 在正文后方固定全屏显示。页面 banner 图或页面专属背景由脚本映射到背景层。

背景图来源：

- 生产优先：R2 `images/backgrounds/*.webp`
- 本地镜像：`source/img/backgrounds/`

优化：

- 桌面背景建议不超过 2560 px 宽。
- 转 WebP，控制在约 300-800 KiB；复杂插画可适当放宽。
- 首屏背景应预加载，非当前页面背景不要预加载。
- 使用 `background-size: cover` 和稳定的焦点位置。
- 移动端可提供单独裁剪版本。

## 12. 毛玻璃系统

统一变量示例：

```css
:root {
  --glass-bg: rgb(7 13 28 / 68%);
  --glass-border: rgb(255 255 255 / 20%);
  --glass-shadow: 0 18px 50px rgb(0 0 0 / 24%);
  --glass-blur: 18px;
}
```

卡片：

```css
background: var(--glass-bg);
border: 1px solid var(--glass-border);
box-shadow: var(--glass-shadow);
backdrop-filter: blur(var(--glass-blur)) saturate(125%);
```

新增页面统一要求：

- banner 高度与 Fluid 普通 page 一致。
- 正文卡片起始位置与归档/分类页接近，不贴住 navbar。
- 页面简介只有一段，避免操作提示堆积。
- 亮色主题提高白色透明度，暗色主题提高深色透明度。
- 不支持 backdrop-filter 时仍有可读实色 fallback。
- 卡片内文字对比度不低于可读标准。

## 13. 导航标题 SVG 描边与霓虹

`svg-neon.js` 将 `.navbar-brand strong` 转为描边动画或添加霓虹类。

当前行为：

- 首页先播放 SVG 描边渐显，再进入霓虹循环。
- 其他页面直接显示霓虹标题，避免左上角退回普通文字。
- 移动端缩短动画并保持标题不换行。

脚本执行失败时必须保留原始站点标题作为 fallback，不能让品牌标题消失。

## 14. 首页文章滑入

`scrollanimation.js` 观察 `.index-card`，进入 viewport 后添加展示 class。

使用 IntersectionObserver，不在滚动事件中逐帧读取布局。`prefers-reduced-motion` 下卡片直接显示。

文章卡片封面必须有：

- 正确 `alt`
- 固定比例或尺寸，降低 CLS
- WebP
- R2 可访问 URL
- 加载失败时不破坏标题区域

## 15. 滚动条

`scrollbar.css` 同时设置页面和 Markdown 表格滚动条。

只对支持 `::-webkit-scrollbar` 的浏览器生效；Firefox 使用标准 `scrollbar-color`。不要把滚动条宽度设得过窄，移动端使用系统滚动。

## 16. Essays 与 Moments

`memos-feed-v5.js`：

- 请求 Memos 公共 API。
- 根据页面 `data` 和标签区分 `#essay` / `#moment`。
- 兼容多个 API 路径。
- 使用本地 Marked 渲染 Markdown。
- 清洗 HTML。
- 渲染附件、地点、引用和被引用关系。
- 将 UTC 时间转为访客本地时区。

样式要求：

- 正文完整显示，而不是只取纯文本。
- 引用摘要只显示纯文本，整个引用块可点击。
- 附件图片不显示文件名。
- 地点和关系信息作为弱化元数据。
- 页面顶部不显示“打开 Memos”等无关提示。

## 17. Quotes 与 Hitokoto

一言类型固定为：`a`、`b`、`c`、`d`、`h`、`j`、`k`。

正文和来源使用不同字体栈，例如：

```css
.quote-text {
  font-family: "STKaiti", "KaiTi", serif;
}

.quote-source {
  font-family: "STXingkai", "FZKai-Z03", serif;
}
```

交互：

- 加载中显示动画。
- 单击加载下一条。
- 请求过程中锁定按钮。
- 请求结束后继续冷却 3 秒。
- 快速点击只保留一个请求。
- 请求失败使用本地语句。

## 18. Gallery

`gallery-feed-v1.js` 读取 Chevereto 公开相册 HTML：

1. 请求 `/explore/albums`。
2. 提取相册 URL、标题和封面。
3. 请求相册页。
4. 提取简介、标签和图片。
5. 在博客毛玻璃卡片中展示。

图片使用 lazy loading。相册封面应设置固定宽高比。由于依赖 Chevereto HTML，升级 Chevereto 后必须回归测试选择器。

## 19. Anime

`anime-feed-v4.js` 使用 Bangumi API，用户为 `soloeternity`。

功能：

- 读取动画收藏的五种状态。
- 默认展示“在看”。
- 统计收藏、看过和完成率。
- 卡片封面悬停缩放。
- 右上角显示“★ 评分”。
- 点击跳转 Bangumi 条目。
- sessionStorage 缓存约 30 分钟。
- 图片 lazy loading。

卡片布局：

- 预览图和正文分区稳定。
- 标题使用较小字号和行数限制，避免遮挡。
- 进度行与标题之间保留间距。
- 标签区与进度行之间保留间距。
- 移动端改为单列或窄双列。
- 外部 API 失败时只替换数据区域，不覆盖整页。

## 20. 音乐播放器

播放器基于本地 APlayer `1.10.1` 和 `music-dock-v6.js`。

### 20.1 数据

`site-config-v3.js` 定义曲目：

- R2 MP3
- R2 WebP 封面
- 本地同源 LRC

音频设置 `preload: none`，播放器在 `window.load` 后初始化。

### 20.2 外观

- 整体圆角。
- 封面圆角。
- 外边框与内部元素保留单倍间距。
- 收起歌单后底部 padding 不叠加。
- 背景为与当前主题一致的半透明毛玻璃。
- 标题、歌词和进度条不被渐变光晕遮挡。
- 歌词区域关闭 APlayer 自带的上下白色渐变伪元素。
- 歌单展开时不覆盖文章目录。

关键覆盖：

```css
.aplayer-lrc::before,
.aplayer-lrc::after {
  display: none !important;
}
```

### 20.3 功能

- 切换歌曲
- 拖动进度
- 音量
- 顺序、随机、循环模式
- 歌单展开/收起
- 播放器隐藏
- localStorage 记忆显示状态
- Umami 音乐行为事件

不要删除 APlayer 内部结构后再重新实现播放逻辑。样式覆盖和外部控制器应保持最小。

## 21. Live2D

本地运行资源：

```text
themes/fluid/source/live2d-widget/
source/live2d-models/
```

R2 备份：

```text
live2d/models/
```

行为：

- 首次访问默认隐藏。
- 右下角按钮唤出。
- 默认模型 IceGirl。
- 另有四个来自 `zenghongtu/live2d-model-assets` 的替代模型。
- 当前模型和显示状态使用 localStorage 跨页面同步。
- 只加载当前模型，不预加载全部模型。

层级：

- 模型高于正文卡片，但不遮挡导航和翻译按钮。
- 控件可点击。
- 移动端默认隐藏，避免占据正文。
- `z-index` 修改要同时测试 Waline、APlayer、回到顶部和移动导航。

## 22. Waline 评论区

Fluid 当前使用 `@waline/client 2.15.8`，服务端为 `1.41.3`。

样式优化：

- 评论容器使用与正文一致的毛玻璃变量。
- 输入框、按钮、用户卡片和分页保持主题对比度。
- 不隐藏审核、登录和可访问性状态。
- 文章 placeholder 为“欢迎大家来评论区灌水喵~”。
- 留言板 placeholder 保持单独文案。

评论邮件通过服务器 Waline 主题脚本按路径区分文章和留言板，属于服务端逻辑，不应在 CSS/前端伪造。

## 23. Umami 行为和性能

`analytics-v2.js` 使用事件委托，记录真正有分析价值的动作，不对每次鼠标移动发事件。

已跟踪：导航、搜索、主题、一言、音乐、Live2D、Anime、外链、下载、友链、评论开始、复制、阅读深度和参与时长。

性能原则：

- Umami 脚本 defer。
- 不把事件发送放在渲染关键路径。
- 事件属性避免邮箱、评论正文等个人数据。
- 同类事件使用稳定命名，避免后台碎片化。

## 24. 性能优化

Umami 曾观察到 P95：LCP 约 `22.81 s`、FCP 约 `22.71 s`、TTFB 约 `6.67 s`、INP 约 `303 ms`、CLS 约 `0.181`。这不是单次本地测速，而是包含不同地区、代理和设备的真实样本。

优先级：

1. 缩小首屏背景并提供移动端版本。
2. 验证 R2 Cloudflare Cache Rule 和 `CF-Cache-Status: HIT`。
3. 本地托管或减少 Google Fonts，避免跨境字体阻塞。
4. Live2D 只在用户打开后加载模型。
5. 音频不预加载，封面延迟到播放器初始化。
6. Anime/Memos/Gallery 在首屏稳定后请求。
7. 图片设置尺寸，降低 CLS。
8. 首页只预加载当前 banner，不预加载其他页面背景。
9. 使用版本化 JS/CSS 长缓存，HTML 保持可更新。
10. 按页面、国家、设备和网络分组比较优化前后数据。

## 25. 可访问性和降级

- 所有交互支持键盘。
- 图片提供有效 alt。
- 按钮有 aria-label。
- 颜色不是唯一状态提示。
- `prefers-reduced-motion` 关闭大部分粒子和持续动画。
- JS 失败时正文和导航仍可使用。
- 外部 API 失败时只显示局部错误。
- 亮/暗主题均保持文字对比度。

## 26. 修改和验证

修改 JS/CSS：

1. 编辑 `source/js`、`source/css` 或 `scripts/injects.js`。
2. 更新 `_config.fluid.yml` 查询参数版本。
3. 构建。
4. 先在本地检查控制台和布局。
5. 发布后清理对应 Cloudflare URL 缓存，而不是全站无差别清理。

```powershell
pnpm clean
pnpm build
pnpm server
```

检查页面：

- 首页
- 普通文章和长目录文章
- 归档/分类/标签
- Essays/Moments/Quotes
- Gallery/Anime
- Friends/Message/About
- 移动端导航
- 明暗主题
- 低动态偏好

## 27. 常见问题

### 样式未更新

- 查询参数版本未变。
- Cloudflare 命中旧文件。
- 浏览器缓存。
- Actions 未发布当前 commit。

### 毛玻璃变成黑块

- 页面命中了旧 CSS。
- `backdrop-filter` 不支持且 fallback 太深。
- 页面自定义选择器优先级覆盖统一变量。
- 暗色主题重复叠加背景。

### Live2D 遮挡

- widget z-index 过高。
- 页面卡片 z-index 误设为更高堆叠上下文。
- 移动端没有默认隐藏。

### 音乐歌词光晕

- APlayer `.aplayer-lrc::before/after` 没有被关闭。
- 旧 CSS 缓存。
- 父容器另有渐变伪元素。

### 动态页面无内容

- Memos 非公开或标签错误。
- CORS。
- API 版本变化。
- Feed JS 旧缓存。
