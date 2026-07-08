# Cloudflare R2 媒体存储

## 目标

- Bucket：`soloeternity-assets`
- 自定义域名：`assets.soloeternity.me`
- 用途：图片、音乐、大附件，不把二进制资源塞进 Git 仓库。

## 目录约定

```text
images/posts/
images/gallery/
music/
avatars/
downloads/
```

文章中直接引用：

```md
![示例图](https://assets.soloeternity.me/images/posts/example.jpg)
```

音乐播放器配置在 `source/js/site-config.js`：

```js
music: [
  {
    name: "歌曲名",
    artist: "作者",
    url: "https://assets.soloeternity.me/music/song.mp3",
    cover: "https://assets.soloeternity.me/images/gallery/cover.jpg"
  }
]
```

## rclone 示例

Cloudflare R2 S3 API endpoint 格式：

```text
https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

上传示例：

```bash
rclone copy ./images r2:soloeternity-assets/images --progress
rclone copy ./music r2:soloeternity-assets/music --progress
```

v1 不做博客内上传后台；先使用 Cloudflare Dashboard、rclone 或 S3 客户端管理文件。
