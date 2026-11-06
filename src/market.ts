export type Kind = 'coin' | 'fiat'

export type Asset = {
  id: string
  label: string
  name: string
  kind: Kind
  /** CoinGecko price id. Omit when the price is derived, as with satoshis. */
  gecko?: string
  /** CoinGecko page slug when it differs from the price id. */
  page?: string
  /** Logo shown on the right. A new coin with a mark appears there automatically. */
  mark?: string
}

/** Add a coin here, in market-cap order. `gecko` is its CoinGecko id and `mark` is its logo. The right column is only the top 20, so a new coin is not added there. Satoshis share Bitcoin’s logo and stay beside Bitcoin. A coin that is not already in the top 100 has its ticker join the left. */
export const COINS: Asset[] = [
  { id: 'btc', label: 'BTC', name: 'Bitcoin', kind: 'coin', gecko: 'bitcoin', mark: '/marks/btc.svg' },
  { id: 'sats', label: 'SATS', name: 'Satoshis', kind: 'coin', page: 'bitcoin', mark: '/marks/btc.svg' },
  { id: 'eth', label: 'ETH', name: 'Ethereum', kind: 'coin', gecko: 'ethereum', mark: '/marks/eth.svg' },
  { id: 'usdt', label: 'USDT', name: 'Tether', kind: 'coin', gecko: 'tether', mark: '/marks/usdt.svg' },
  { id: 'bnb', label: 'BNB', name: 'BNB', kind: 'coin', gecko: 'binancecoin', mark: '/marks/bnb.svg' },
  { id: 'xrp', label: 'XRP', name: 'XRP', kind: 'coin', gecko: 'ripple', mark: '/marks/xrp.svg' },
  { id: 'usdc', label: 'USDC', name: 'USD Coin', kind: 'coin', gecko: 'usd-coin', mark: '/marks/usdc.svg' },
  { id: 'sol', label: 'SOL', name: 'Solana', kind: 'coin', gecko: 'solana', mark: '/marks/sol.svg' },
  { id: 'trx', label: 'TRX', name: 'TRON', kind: 'coin', gecko: 'tron', mark: '/marks/trx.svg' },
  { id: 'zec', label: 'ZEC', name: 'Zcash', kind: 'coin', gecko: 'zcash', mark: '/marks/zec.svg' },
  { id: 'hype', label: 'HYPE', name: 'Hyperliquid', kind: 'coin', gecko: 'hyperliquid', mark: '/marks/hype.svg' },
  { id: 'xmr', label: 'XMR', name: 'Monero', kind: 'coin', gecko: 'monero', mark: '/marks/xmr.svg' },
  { id: 'doge', label: 'DOGE', name: 'Dogecoin', kind: 'coin', gecko: 'dogecoin', mark: '/marks/doge.svg' },
  { id: 'link', label: 'LINK', name: 'Chainlink', kind: 'coin', gecko: 'chainlink', mark: '/marks/top/link.svg' },
  { id: 'ada', label: 'ADA', name: 'Cardano', kind: 'coin', gecko: 'cardano', mark: '/marks/top/ada.svg' },
  { id: 'bch', label: 'BCH', name: 'Bitcoin Cash', kind: 'coin', gecko: 'bitcoin-cash', mark: '/marks/top/bch.svg' },
  { id: 'xlm', label: 'XLM', name: 'Stellar', kind: 'coin', gecko: 'stellar', mark: '/marks/top/xlm.svg' },
  { id: 'near', label: 'NEAR', name: 'NEAR', kind: 'coin', gecko: 'near', mark: '/marks/near.svg' },
  { id: 'uni', label: 'UNI', name: 'Uniswap', kind: 'coin', gecko: 'uniswap', mark: '/marks/top/uni.svg' },
  { id: 'ltc', label: 'LTC', name: 'Litecoin', kind: 'coin', gecko: 'litecoin', mark: '/marks/top/ltc.svg' },
  { id: 'avax', label: 'AVAX', name: 'Avalanche', kind: 'coin', gecko: 'avalanche-2', mark: '/marks/top/avax.svg' },
  { id: 'sui', label: 'SUI', name: 'Sui', kind: 'coin', gecko: 'sui', mark: '/marks/top/sui.svg' },
  { id: 'ton', label: 'TON', name: 'Toncoin', kind: 'coin', gecko: 'the-open-network', mark: '/marks/top/gram.png' },
  { id: 'tao', label: 'TAO', name: 'Bittensor', kind: 'coin', gecko: 'bittensor', mark: '/marks/top/tao.svg' },
  { id: 'dot', label: 'DOT', name: 'Polkadot', kind: 'coin', gecko: 'polkadot', mark: '/marks/top/dot.svg' },
  { id: 'rail', label: 'RAIL', name: 'Railgun', kind: 'coin', gecko: 'railgun', mark: '/marks/rail.jpg' },
  { id: 'zano', label: 'ZANO', name: 'Zano', kind: 'coin', gecko: 'zano', mark: '/marks/zano.svg' },
]

export const FIATS: Asset[] = [
  { id: 'usd', label: 'USD', name: 'US dollar', kind: 'fiat' },
  { id: 'eur', label: 'EURO', name: 'Euro', kind: 'fiat' },
  { id: 'jpy', label: 'YEN', name: 'Yen', kind: 'fiat' },
  { id: 'cny', label: 'YUAN', name: 'Yuan', kind: 'fiat' },
  { id: 'gbp', label: 'GBP', name: 'British pound', kind: 'fiat' },
  { id: 'aud', label: 'AUD', name: 'Australian dollar', kind: 'fiat' },
  { id: 'cad', label: 'CAD', name: 'Canadian dollar', kind: 'fiat' },
  { id: 'crc', label: 'CRC', name: 'Colón', kind: 'fiat' },
  { id: 'dkk', label: 'DKK', name: 'Danish krone', kind: 'fiat' },
]

export const ASSETS: Asset[] = [...COINS, ...FIATS]

export const ASSET_MAP: Record<string, Asset> = Object.fromEntries(
  ASSETS.map((asset) => [asset.id, asset]),
)

const FIAT_IDS = ['usd', 'eur', 'jpy', 'cny', 'gbp', 'aud', 'cad', 'crc', 'dkk'] as const

const COINGECKO_IDS: Record<string, string> = Object.fromEntries(
  COINS.flatMap((coin) => (coin.gecko ? [[coin.id, coin.gecko]] : [])),
)

const SATS_PER_BTC = 100_000_000

export type Quote = Partial<Record<(typeof FIAT_IDS)[number], number>>

export type Rates = {
  fetchedAt: number
  source: 'CoinGecko' | 'daily backup'
  coins: Partial<Record<string, Quote>>
}

const CACHE_KEY = 'rate:prices:v1'

export function parseAmount(raw: string): number {
  const s = raw.trim().replace(/[\s']/g, '')
  if (!s) return 0
  const dots = s.split('.').length - 1
  const commas = s.split(',').length - 1
  let n = s
  if (dots > 0 && commas > 0) {
    n =
      s.lastIndexOf(',') > s.lastIndexOf('.')
        ? s.replace(/\./g, '').replace(',', '.')
        : s.replace(/,/g, '')
  } else if (commas > 1) {
    const parts = s.split(',')
    const dec = parts.pop()
    n = `${parts.join('')}.${dec}`
  } else if (commas === 1) {
    n = s.replace(',', '.')
  } else if (dots > 1) {
    const parts = s.split('.')
    const dec = parts.pop()
    n = `${parts.join('')}.${dec}`
  }
  const v = Number(n)
  return Number.isFinite(v) ? v : 0
}

export function convert(amount: number, from: string, to: string, rates: Rates): number | null {
  if (!Number.isFinite(amount) || Math.abs(amount) > 1e15) return null
  if (from === to) return amount
  const fromAsset = ASSET_MAP[from]
  const toAsset = ASSET_MAP[to]
  if (!fromAsset || !toAsset) return null

  if (fromAsset.kind === 'coin' && toAsset.kind === 'fiat') {
    const price = rates.coins[from]?.[to as (typeof FIAT_IDS)[number]]
    return price == null ? null : amount * price
  }
  if (fromAsset.kind === 'fiat' && toAsset.kind === 'coin') {
    const price = rates.coins[to]?.[from as (typeof FIAT_IDS)[number]]
    return price == null || price === 0 ? null : amount / price
  }
  if (fromAsset.kind === 'coin' && toAsset.kind === 'coin') {
    const a = rates.coins[from]?.usd
    const b = rates.coins[to]?.usd
    if (a == null || b == null || b === 0) return null
    return (amount * a) / b
  }
  const a = rates.coins.btc?.[from as (typeof FIAT_IDS)[number]]
  const b = rates.coins.btc?.[to as (typeof FIAT_IDS)[number]]
  if (a == null || b == null || a === 0) return null
  return amount * (b / a)
}

export function formatQuote(n: number, assetId: string): string {
  if (!Number.isFinite(n) || Math.abs(n) > 1e15) return '—'
  if (assetId === 'sats') {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.round(n))
  }
  const abs = Math.abs(n)
  const asset = ASSET_MAP[assetId]
  let min = 2
  let max = 2
  if (asset?.kind === 'fiat') {
    if (assetId === 'jpy') {
      if (abs >= 1) {
        min = 0
        max = 0
      } else {
        min = 2
        max = 4
      }
    } else if (abs > 0 && abs < 0.01) {
      min = 2
      max = 6
    }
  } else if (abs >= 1000) {
    min = 2
    max = 2
  } else if (abs >= 1) {
    min = 2
    max = 4
  } else if (abs >= 0.0001) {
    min = 2
    max = 6
  } else {
    min = 2
    max = 8
  }
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }).format(n)
}

export function formatAge(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000))
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 36) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

const BTC_USD_MIN = 1_000
const BTC_USD_MAX = 100_000_000
const PRICE_MAX = 1e12

function positive(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= PRICE_MAX ? value : null
}

/** Keep a price list only when it is a normal quote. Anything else is ignored. */
export function sanitizeRates(data: unknown): Rates | null {
  if (!data || typeof data !== 'object') return null
  const row = data as Record<string, unknown>
  if (row.source !== 'CoinGecko' && row.source !== 'daily backup') return null
  if (typeof row.fetchedAt !== 'number' || !Number.isFinite(row.fetchedAt)) return null
  if (row.fetchedAt > Date.now() + 120_000) return null
  if (!row.coins || typeof row.coins !== 'object') return null
  const incoming = row.coins as Record<string, unknown>
  const coins: Rates['coins'] = {}
  for (const id of [...Object.keys(COINGECKO_IDS), 'sats']) {
    const quote = quoteFrom(incoming[id])
    if (quote) coins[id] = quote
  }
  const btc = coins.btc?.usd
  if (btc == null || btc < BTC_USD_MIN || btc > BTC_USD_MAX) return null
  return { fetchedAt: row.fetchedAt, source: row.source, coins }
}

function quoteFrom(value: unknown): Quote | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const quote: Quote = {}
  for (const fiat of FIAT_IDS) {
    const price = positive(row[fiat])
    if (price != null) quote[fiat] = price
  }
  return quote.usd == null ? null : quote
}

function withSats(coins: Rates['coins']): Rates['coins'] {
  const btc = coins.btc
  if (!btc) return coins
  const sats: Quote = {}
  for (const id of FIAT_IDS) {
    const price = btc[id]
    if (price != null) sats[id] = price / SATS_PER_BTC
  }
  return { ...coins, sats }
}

function fromCoinGecko(data: unknown): Rates {
  if (!data || typeof data !== 'object') throw new Error('empty')
  const table = data as Record<string, Record<string, unknown>>
  const coins: Rates['coins'] = {}
  for (const [id, cgId] of Object.entries(COINGECKO_IDS)) {
    const row = table[cgId]
    if (!row) continue
    const quote: Quote = {}
    for (const fiat of FIAT_IDS) {
      const price = positive(row[fiat])
      if (price != null) quote[fiat] = price
    }
    if (quote.usd != null) coins[id] = quote
  }
  const next = withSats(coins)
  const clean = sanitizeRates({ fetchedAt: Date.now(), source: 'CoinGecko', coins: next })
  if (!clean) throw new Error('rejected')
  return clean
}

function fromBackup(data: unknown): Rates {
  if (!data || typeof data !== 'object') throw new Error('empty')
  const usd = (data as { usd?: Record<string, unknown> }).usd
  if (!usd) throw new Error('empty')
  const perUsd: Record<string, number> = {}
  for (const id of [...Object.keys(COINGECKO_IDS), ...FIAT_IDS]) {
    if (id === 'hype' || id === 'sats') continue
    const units = positive(usd[id])
    if (units != null) perUsd[id] = units
  }
  perUsd.usd = 1
  if (perUsd.btc == null) throw new Error('missing bitcoin')
  const coins: Rates['coins'] = {}
  for (const id of Object.keys(COINGECKO_IDS)) {
    if (id === 'hype') continue
    const units = perUsd[id]
    if (units == null) continue
    const quote: Quote = {}
    for (const fiat of FIAT_IDS) {
      const fiatPerUsd = perUsd[fiat]
      if (fiatPerUsd != null) quote[fiat] = fiatPerUsd / units
    }
    if (quote.usd != null) coins[id] = quote
  }
  const next = withSats(coins)
  const clean = sanitizeRates({ fetchedAt: Date.now(), source: 'daily backup', coins: next })
  if (!clean) throw new Error('rejected')
  return clean
}

async function fetchJson(url: string, parent: AbortSignal, ms = 8000): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  const onAbort = () => controller.abort()
  if (parent.aborted) controller.abort()
  else parent.addEventListener('abort', onAbort)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(String(res.status))
    const type = res.headers.get('content-type') ?? ''
    if (!type.toLowerCase().includes('application/json')) throw new Error('type')
    return await res.json()
  } finally {
    clearTimeout(timer)
    parent.removeEventListener('abort', onAbort)
  }
}

export async function fetchRates(parent: AbortSignal): Promise<Rates> {
  const ids = Object.values(COINGECKO_IDS).join(',')
  const vs = FIAT_IDS.join(',')
  const primary = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs}`
  try {
    return fromCoinGecko(await fetchJson(primary, parent))
  } catch (error) {
    if (parent.aborted) throw error
    const backup = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json'
    return fromBackup(await fetchJson(backup, parent))
  }
}

export function readCache(): Rates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return sanitizeRates(JSON.parse(raw))
  } catch {
    return null
  }
}

export function writeCache(rates: Rates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates))
  } catch {
    /* private mode or a full disk — the sheet still works for this visit */
  }
}
