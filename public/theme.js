var color = '#e8e6d8'
var scheme = 'light'
try {
  var stored = localStorage.getItem('rate:theme')
  var night =
    stored === 'night' ||
    (stored !== 'day' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (night) document.documentElement.dataset.theme = 'night'
  if (night) {
    color = '#090a07'
    scheme = 'dark'
  }
  document.documentElement.style.colorScheme = scheme
} catch {
  /* the page still works in the day colors */
}
document.write(
  '<meta name="theme-color" content="' +
    color +
    '"><meta name="color-scheme" content="' +
    scheme +
    '">',
)
