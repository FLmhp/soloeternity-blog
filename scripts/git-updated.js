const { execFileSync } = require('node:child_process');
const path = require('node:path');

hexo.extend.filter.register('before_post_render', (post) => {
  if (!post.full_source) return post;
  try {
    const source = path.relative(hexo.base_dir, post.full_source);
    const timestamp = execFileSync('git', ['log', '-1', '--format=%cI', '--', source], {
      cwd: hexo.base_dir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    if (timestamp) post.updated = new Date(timestamp);
  } catch (_) {
    // A source archive without Git history falls back to Hexo's published date.
  }
  return post;
});
