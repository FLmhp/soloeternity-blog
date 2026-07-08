---
title: 写文章
date: 2026-07-08 00:00:00
layout: page
subtitle: 用 Markdown 写作，然后交给 Git 发布
---

在线写作入口会打开 Decap CMS，新文章会提交到 GitHub 并自动发布。

<div class="solo-action-row">
  <a class="solo-button" href="/admin/#/collections/posts/new">新建文章</a>
  <a class="solo-button solo-button-secondary" href="/admin/">进入后台</a>
</div>

<script>
  if (location.hash === "#new") {
    location.replace("/admin/#/collections/posts/new");
  }
</script>
