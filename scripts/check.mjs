import esbuild from 'esbuild'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const outfile = path.join(os.tmpdir(), `rate-market-${process.pid}.mjs`)
await esbuild.build({
  entryPoints: ['src/market.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
})

const { parseAmount, convert, formatQuote } = await import(pathToFileURL(outfile).href)

const rates = {
  fetchedAt: 0,
  source: 'CoinGecko',
  coins: {
    btc: { usd: 76028, eur: 67726, jpy: 12000032, cny: 507728, crc: 34473159, dkk: 506191 },
    eth: { usd: 2247.07, eur: 2001.72, jpy: 354673, cny: 15006.38, crc: 1018888, dkk: 14960.97 },
    usdt: { usd: 0.998876, eur: 0.889813, jpy: 157.66, cny: 6.67, crc: 452.92, dkk: 6.65 },
    sats: {
      usd: 76028 / 1e8,
      eur: 67726 / 1e8,
      jpy: 12000032 / 1e8,
      cny: 507728 / 1e8,
      crc: 34473159 / 1e8,
      dkk: 506191 / 1e8,
    },
  },
}

function assert(cond, message) {
  if (!cond) throw new Error(message)
}

function close(actual, expected, message) {
  const ok = Math.abs(actual - expected) / expected < 0.000001
  assert(ok, `${message}: got ${actual}, expected ${expected}`)
}

assert(parseAmount('1') === 1, 'plain')
assert(parseAmount('1,5') === 1.5, 'comma decimal')
assert(parseAmount('1.5') === 1.5, 'dot decimal')
assert(parseAmount('76.028,50') === 76028.5, 'eu thousands')
assert(parseAmount('76,028.50') === 76028.5, 'us thousands')
assert(parseAmount('') === 0, 'empty')
assert(parseAmount('  2 500,25 ') === 2500.25, 'spaces')

close(convert(1, 'btc', 'usd', rates), 76028, 'btc usd')
close(convert(1, 'btc', 'eur', rates), 67726, 'btc eur')
close(convert(100_000_000, 'sats', 'btc', rates), 1, 'sats to btc')
close(convert(1, 'btc', 'sats', rates), 100_000_000, 'btc to sats')
close(convert(2, 'eth', 'usd', rates), 4494.14, 'eth usd')
close(convert(100, 'usd', 'eur', rates), 100 * (67726 / 76028), 'usd eur')
close(convert(100, 'eur', 'btc', rates), 100 / 67726, 'eur btc')
close(convert(1, 'eth', 'btc', rates), 2247.07 / 76028, 'eth btc')
assert(convert(1, 'hype', 'usd', rates) === null, 'missing coin')
assert(formatQuote(100_000_000.4, 'sats') === '100,000,000' || formatQuote(100_000_000.4, 'sats').replace(/\D/g, '') === '100000000', 'sats format')

const seoOut = path.join(os.tmpdir(), `rate-seo-${process.pid}.mjs`)
await esbuild.build({
  entryPoints: ['src/seo.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: seoOut,
})
const { FAQ, PAGE_TITLE, PAGE_DESCRIPTION } = await import(pathToFileURL(seoOut).href)
const html = fs.readFileSync('index.html', 'utf8').replace(/\s+/g, ' ')
assert(html.includes(PAGE_TITLE), 'title in html')
assert(html.includes(PAGE_DESCRIPTION), 'description in html')
assert(html.includes('id="about"') && html.includes('#about { display: none; }'), 'crawler copy is in the source and hidden')
for (const item of FAQ) {
  assert(html.includes(item.question), `question missing: ${item.question}`)
  assert(html.includes(item.answer), `answer missing: ${item.question}`)
}

console.log('check ok')
