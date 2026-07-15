const nunjucks = require('nunjucks');

nunjucks.configure().addFilter('pageTitle', (url = '') => {
  try {
    return decodeURIComponent(url).split('/').filter(Boolean).pop() || url;
  } catch {
    return url;
  }
});

module.exports = {};
