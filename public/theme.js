try {
  var stored = localStorage.getItem('rate:theme')
  var night =
    stored === 'night' ||
    (stored !== 'day' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (night) document.documentElement.dataset.theme = 'night'
  document.documentElement.style.colorScheme = night ? 'dark' : 'light'
  var color = night ? '#090a07' : '#0000F0'
  var metas = document.querySelectorAll('meta[name="theme-color"]')
  for (var i = 0; i < metas.length; i++) metas[i].setAttribute('content', color)
} catch {
  /* the page still works in the day colors */
}
