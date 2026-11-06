try {
  var stored = localStorage.getItem('rate:theme')
  var night =
    stored === 'night' ||
    (stored !== 'day' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (night) document.documentElement.dataset.theme = 'night'
  document.documentElement.style.colorScheme = night ? 'dark' : 'light'
} catch {
  /* the page still works in the day colors */
}
