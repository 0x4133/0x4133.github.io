// Applied before first paint to avoid a theme flash. Dark is the default.
try {
  var t = localStorage.getItem('hexworks.theme');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
} catch (e) { /* storage blocked */ }
