# Decap CMS OAuth 服务

`/admin/` 是纯静态 Decap CMS 页面，GitHub OAuth 不能把密钥放在前端。需要用 Cloudflare Worker 或独立 OAuth proxy 承接：

- 后台地址：`https://soloeternity.me/admin/`
- OAuth 服务域名：`https://cms-auth.soloeternity.me`
- Decap 配置：`source/admin/config.yml`
- GitHub OAuth callback：`https://cms-auth.soloeternity.me/callback`

## GitHub OAuth App

1. 打开 GitHub Developer settings。
2. 新建 OAuth App。
3. Homepage URL 填 `https://soloeternity.me`。
4. Authorization callback URL 填 `https://cms-auth.soloeternity.me/callback`。
5. 把 Client ID 和 Client Secret 放到 OAuth 服务端环境变量。

## Decap 配置位置

```yaml
backend:
  name: github
  repo: FLmhp/soloeternity-blog
  branch: main
  base_url: https://cms-auth.soloeternity.me
  auth_endpoint: auth
```

如果 GitHub 源码仓库改名，只需要同步修改 `repo`。
