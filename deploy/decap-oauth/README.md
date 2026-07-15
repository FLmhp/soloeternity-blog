# Decap CMS GitHub OAuth Worker

Decap CMS 管理页是纯静态页面，不能保存 GitHub Client Secret。生产使用 Cloudflare Worker 作为 OAuth Proxy。

## 当前状态

- 管理页：`https://soloeternity.me/admin/`
- OAuth 域名：`https://cms-auth.soloeternity.me`
- GitHub 仓库：`FLmhp/soloeternity-blog`
- 分支：`main`
- Decap backend：GitHub
- 工作流：`editorial_workflow`
- Worker 根路径返回 `200`
- 无参数访问 `/auth` 返回 `400` 是正常校验行为

不要在本文、仓库或前端源码中保存 Client Secret。已经通过聊天或截图公开过的 Secret 必须在 GitHub 重新生成，并删除旧 Secret。

## 1. GitHub 应用类型

Decap 标准 GitHub backend 最直接的是 **OAuth App**，不是 GitHub App。

OAuth App 只需要：

- Application name
- Homepage URL
- Authorization callback URL
- Client ID
- Client Secret

如果创建页面出现 `Permissions`、`Webhook`、`Post installation`、`Where can this GitHub App be installed`，说明正在创建 GitHub App。除非 Worker 实现明确支持 GitHub App，否则返回 Developer settings -> OAuth Apps 创建 OAuth App。

## 2. OAuth App 配置

GitHub：Settings -> Developer settings -> OAuth Apps -> New OAuth App。

填写：

```text
Application name: SoloEternity Decap CMS
Homepage URL: https://soloeternity.me
Authorization callback URL: https://cms-auth.soloeternity.me/callback
```

创建后保存 Client ID，并生成新的 Client Secret。Secret 只写入 Worker secret。

## 3. Worker 变量

建议 bindings：

```text
GITHUB_CLIENT_ID       普通环境变量
GITHUB_CLIENT_SECRET   Secret
ALLOWED_ORIGIN         https://soloeternity.me
OAUTH_REDIRECT_URI     https://cms-auth.soloeternity.me/callback
```

Worker 需要实现：

- `GET /auth`：生成 state，重定向到 GitHub authorize。
- `GET /callback`：校验 state，用 code 换 token。
- 返回 Decap 支持的 `postMessage` 页面。
- 只允许博客 Origin。
- 不在日志中输出 token、code 或 Secret。

## 4. 自定义域名

Cloudflare Workers -> Worker -> Settings -> Domains & Routes -> Add Custom Domain：

```text
cms-auth.soloeternity.me
```

该域名应由 Worker 管理，不要再创建指向 `107.151.246.42` 的 A 记录。源站 Caddy 对这个域名只返回 404，用于发现误配置。

## 5. Decap 配置

`source/admin/config.yml`：

```yaml
backend:
  name: github
  repo: FLmhp/soloeternity-blog
  branch: main
  base_url: https://cms-auth.soloeternity.me
  auth_endpoint: auth

publish_mode: editorial_workflow
```

管理页脚本在 `source/admin/index.html` 引入 Decap CMS v3。

## 6. 授权流程测试

1. 用无痕窗口打开 `/admin/`。
2. 点击 GitHub 登录。
3. 授权窗口域名应是 `github.com`。
4. Callback 应回到 `cms-auth.soloeternity.me/callback`。
5. 弹窗通过 `postMessage` 把 token 交给 `/admin/` 后关闭。
6. Decap 能列出文章。
7. 新建草稿，确认 GitHub 出现分支/PR。
8. 发布，确认 merge 到 `main`。
9. 确认 Actions 发布成功。

## 7. 常见错误

### 弹窗打不开

- 浏览器拦截弹窗。
- `/auth` 没有返回重定向。
- Worker 自定义域名未生效。

### callback mismatch

GitHub OAuth App 的 callback 必须逐字符等于：

```text
https://cms-auth.soloeternity.me/callback
```

检查 HTTPS、子域名、路径和末尾斜杠。

### state mismatch

- Worker 多实例没有共享 state。
- Cookie 的 SameSite/Secure 配置错误。
- 用户重复打开多个授权窗口。
- 授权耗时超过 state 过期时间。

### 登录成功但无仓库权限

- GitHub 用户没有仓库写权限。
- OAuth scope 不足。
- 仓库名或 owner 错误。
- 组织策略限制第三方 OAuth。

### CORS/postMessage 错误

- allowed origin 不是精确的 `https://soloeternity.me`。
- Worker 返回了 `*` 与凭据组合。
- callback 页面向错误 origin 发送消息。

## 8. 安全

- 立即轮换曾公开的 Client Secret。
- Secret 使用 `wrangler secret put` 或 Dashboard Secret binding。
- 限制允许 Origin。
- 校验 OAuth state。
- 不把 access token 写入 KV、日志或错误页面。
- Worker 日志只记录请求 ID、状态码和脱敏错误。
- 定期检查 GitHub OAuth App 授权和 Worker 部署历史。

## 9. 更新 Worker

推荐使用 Wrangler：

```bash
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler deploy
npx wrangler tail
```

部署后重新测试完整授权，而不是只检查根路径 `200`。

