try {
  var stored = localStorage.getItem('rate:theme')
  var night =
    stored === 'night' ||
    (stored !== 'day' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (night) document.documentElement.dataset.theme = 'night'
  var meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', night ? '#090a07' : '#0000F0')
} catch {
  /* the page still works in the day colors */
}
