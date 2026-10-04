// Used only by 404.html: forward /some/deep/path to <base>?p=/some/deep/path
(function () {
  var base = new URL(document.baseURI).pathname;
  var path = location.pathname.indexOf(base) === 0 ? location.pathname.slice(base.length) : location.pathname.replace(/^\//, '');
  location.replace(base + '?p=' + encodeURIComponent('/' + path + location.search) + location.hash);
})();
