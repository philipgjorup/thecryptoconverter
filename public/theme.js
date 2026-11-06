function setThemeColor(color) {
  var nodes = document.querySelectorAll('meta[name="theme-color"]')
  for (var i = 0; i < nodes.length; i++) nodes[i].parentNode.removeChild(nodes[i])
  var meta = document.createElement('meta')
  meta.setAttribute('name', 'theme-color')
  meta.setAttribute('content', color)
  document.head.appendChild(meta)
}

try {
  var stored = localStorage.getItem('rate:theme')
  var night =
    stored === 'night' ||
    (stored !== 'day' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (night) document.documentElement.dataset.theme = 'night'
  document.documentElement.style.colorScheme = night ? 'dark' : 'light'
  setThemeColor(night ? '#090a07' : '#0000F0')
} catch {
  /* the page still works in the day colors */
}
