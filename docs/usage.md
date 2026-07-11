# 使用文档

## 1. 开发环境

当前项目使用：

- Node.js `20.x`
- `pnpm@9.15.9`
- Hexo `7.3.0`

## 1.1 当前线上使用状态（2026-07-08）

为了避免“文档和线上不一致”，这里补一份当前实际状态：

- 主站地址：`https://soloeternity.me`
- 评论服务：`https://waline.soloeternity.me`
- 评论后台：`https://waline.soloeternity.me/ui`
- 当前统计来源：`busuanzi`
- 当前评论服务版本：`Waline 1.41.3`
- 当前线上首页静态文件最近发布时间：`2026-06-08`

如果你只是想确认“我改完内容为什么线上没变”，优先看：

1. 本地 `pnpm build` 是否成功
2. `git push origin main` 是否已完成
3. GitHub Actions 是否产生了新的成功 run
4. `/var/www/blog/current/index.html` 的时间是否更新

建议先安装：

```bash
node -v
pnpm -v
```

首次拉取仓库后执行：

```bash
pnpm install
```

---

## 2. 本地预览

### 2.1 启动开发服务器

```bash
pnpm server
```

默认会启动 Hexo 本地服务，一般访问：

```text
http://localhost:4000
```

### 2.2 重新生成静态文件

```bash
pnpm clean
pnpm build
```

生成产物位于：

```text
public/
```

---

## 3. 写文章

### 3.1 新建文章

```bash
npx hexo new post "文章标题"
```

生成文件通常位于：

```text
source/_posts/文章标题.md
```

### 3.2 常用 Front Matter

```yaml
---
title: Ubuntu 安装记录
date: 2026-06-08 20:00:00
updated: 2026-06-08 20:00:00
tags:
  - Ubuntu
  - Linux
categories:
  - 运维
index_img: /img/cover/ubuntu.png
banner_img: /img/post_banner.png
comments: true
---
```

说明：

- `tags` 用于标签页聚合
- `categories` 用于分类页聚合
- `index_img` 控制首页卡片封面
- `banner_img` 控制文章顶部横幅
- `comments: true` 表示允许评论

### 3.3 插入图片

如果图片和文章放在同名目录下，例如：

```text
source/_posts/Java开发环境配置.md
source/_posts/Java开发环境配置/079130c9fab5ff317529c7cdeb24313a.png
```

可以在 Markdown 中直接写：

```md
![安装截图](./Java开发环境配置/079130c9fab5ff317529c7cdeb24313a.png)
```

---

## 4. 页面管理

### 4.1 新建普通页面

```bash
npx hexo new page about
```

页面文件一般位于：

```text
source/about/index.md
```

### 4.2 About 页面启用评论

```yaml
---
title: 关于
comments: true
---
```

Fluid 的 `about.ejs` 会在 `page.comments` 为 `true` 时挂载评论组件。

---

## 5. 配置文件分工

### 5.1 `_config.yml`

Hexo 主配置，重点关注：

- `title`
- `subtitle`
- `url`
- `permalink`
- `language`

当前站点 URL：

```yaml
url: https://soloeternity.me
```

### 5.2 `_config.fluid.yml`

主题配置，重点关注：

- `navbar`
- `index.slogan`
- `fun_features.typing`
- `custom_js`
- `custom_css`
- `footer`
- `waline`
- `web_analytics`

例如评论服务地址：

```yaml
waline:
  serverURL: 'https://waline.soloeternity.me/'
```

---

## 6. 自定义样式与脚本

当前主题自定义入口主要有三种：

### 6.1 `custom_js`

在 `_config.fluid.yml` 中注册：

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

这些文件实际存放在：

```text
source/js/
```

### 6.2 `custom_css`

在 `_config.fluid.yml` 中注册：

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

这些文件实际存放在：

```text
source/css/
```

### 6.3 `scripts/injects.js`

如果某个效果需要往页面结构里注入 HTML 或脚本，可以走 Hexo injector：

```js
hexo.extend.injector.register("body_begin", '<div id="web_bg"></div>');
hexo.extend.injector.register('body_end', '<script src="/js/sakura.js"></script>', 'home');
hexo.extend.injector.register('head_end', '<script src="/live2d-widget/dist/autoload.js"></script>');
```

这种方式适合：

- 全局背景节点
- 首页专属特效
- 全局预加载层
- 第三方小部件

---

## 7. 评论系统使用

### 7.1 访问后台

```text
https://waline.soloeternity.me/ui
```

后台可执行：

- 审核评论
- 删除评论
- 管理用户
- 查看评论状态

当前线上库核验结果：

- 用户数：`1`
- 评论数：`3`
- 计数表：`0`
- 当前管理员邮箱：`2122283196@qq.com`

### 7.2 评论前端配置

当前 Waline 前端配置位于 `_config.fluid.yml`：

```yaml
waline:
  serverURL: 'https://waline.soloeternity.me/'
  path: window.location.pathname
  meta: ['nick', 'mail', 'link']
  requiredMeta: ['nick']
  lang: 'zh-CN'
  pageSize: 10
  commentSorting: 'latest'
```

### 7.3 邮件通知修改

Waline 邮件通知在服务器 `/opt/waline/.env` 中维护。  
修改后需要重启：

```bash
cd /opt/waline
docker compose up -d waline
```

当前线上已确认的 SMTP 基本配置为：

- `SMTP_HOST=smtp.qq.com`
- `SMTP_PORT=465`
- `SMTP_USER=fl-mhp@qq.com`
- `SENDER_NAME=SoloEternity`
- `AUTHOR_EMAIL=fl-mhp@qq.com`

说明：

- QQ 邮箱授权码只保留在服务器 `.env`，不要写回仓库
- 中文模板建议继续使用 `UTF-8` 保存

---

## 8. 网站统计

当前站点统计来源是 `busuanzi`，配置位于 `_config.fluid.yml`：

```yaml
footer:
  statistics:
    enable: true
    source: "busuanzi"
```

文章页阅读量同样使用 `busuanzi`：

```yaml
post:
  meta:
    views:
      enable: true
      source: "busuanzi"
```

说明：

- 本地预览时访问量可能异常偏大，这是正常现象
- 正式部署后会按真实访问逐步恢复正常
- 当前线上首页 HTML 已确认输出 `busuanzi.min.js` 和 `/js/busuanzi-compat.js`
- footer 中 `#busuanzi_container_site_pv` / `#busuanzi_container_site_uv` 默认先隐藏，等待脚本返回后再显示

---

## 9. 发布流程

### 9.1 日常发布命令

```bash
git add .
git commit -m "Add new post"
git push origin main
```

### 9.2 实际自动化动作

推送到 `main` 后，GitHub Actions 会自动：

1. 安装依赖
2. 构建 Hexo
3. 同步 `public/` 到服务器
4. 修正远程目录权限

### 9.3 查看部署状态

```bash
gh run list -R FLmhp/soloeternity-blog --workflow deploy.yml
gh run watch <run-id> -R FLmhp/soloeternity-blog
```

当前可作为参考的最近成功 run：

```text
27130282506
```

---

## 10. 常用运维命令

### 10.1 检查 Caddy

```bash
ssh root@your-server "cd /root/docker/caddy && docker compose run --rm --no-deps --entrypoint caddy caddy2 validate --config /etc/caddy/Caddyfile && docker ps --filter name=caddy"
```

### 10.2 检查 Waline

```bash
ssh root@your-server "cd /opt/waline && docker compose ps"
ssh root@your-server "cd /opt/waline && docker compose logs -f waline"
```

### 10.3 检查线上文件

```bash
ssh root@your-server "ls -la /var/www/blog/current | head"
```

### 10.4 手动回滚静态站

当前工作流是覆盖式发布，所以静态站回滚建议通过：

- 回退 Git 提交重新触发部署
- 或从服务器备份目录恢复

---

## 11. 排障建议

### 11.1 本地页面正常，线上页面异常

优先排查：

1. `pnpm build` 是否报错
2. GitHub Actions 是否成功
3. `/var/www/blog/current` 是否已更新
4. Cloudflare 是否缓存旧页面

### 11.2 评论区不显示

优先排查：

```bash
curl -I https://waline.soloeternity.me
curl -I https://soloeternity.me
```

然后确认：

- `_config.fluid.yml` 的 `waline.serverURL`
- Waline 容器状态
- Caddy 反向代理是否正常

### 11.3 页面样式失效

一般是以下原因：

- `custom_css` 路径写错
- `custom_js` 路径写错
- 文件不在 `source/` 下
- 浏览器缓存旧静态资源

建议先：

```bash
pnpm clean
pnpm build
```

---

## 12. 动态页面与媒体资源

### 12.1 Gallery

`/gallery/` 会自动读取 `https://gallery.soloeternity.me/explore/albums` 的公开相册。相册名称、简介、标签和图片均在 Chevereto 中维护；设为非公开的相册不会展示。

### 12.2 Anime

`/anime/` 读取 Bangumi 用户 `1263468` 的公开动画收藏，按想看、看过、在看、搁置和抛弃筛选。页面只读取公开数据，不需要 OAuth Token；默认仅加载“在看”，点击其他分类时再分页加载。

### 12.3 R2 上传

```bash
rclone copy ./images r2:soloeternity-assets/images --progress
rclone copy ./music r2:soloeternity-assets/music --progress
rclone copy ./live2d r2:soloeternity-assets/live2d --progress
```

图片优先使用 WebP；二维码和 Live2D 透明贴图保留 PNG；音乐使用 MP3、封面使用 WebP、歌词使用 LRC。

### 12.4 文章更新时间

不要手工修改文件时间。CI 会从 Git 历史读取 Markdown 文件最近一次提交时间，只有提交该文章文件后，页面的更新时间才变化。
