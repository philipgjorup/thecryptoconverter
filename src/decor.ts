import { COINS } from './market'
import { TOP_MARKS } from './topMarks'

/** CoinGecko top 100 by market cap, 5 Nov 2026. Decorative only. */
export const TOP_100 = [
  'BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'USDC', 'SOL', 'TRX', 'FIGR', 'ZEC',
  'HYPE', 'XMR', 'DOGE', 'USDS', 'WBT', 'LEO', 'LINK', 'ADA', 'BCH', 'XLM',
  'NEAR', 'DAI', 'USDE', 'RAIN', 'UNI', 'LTC', 'CC', 'AVAX', 'USD1', 'SUI',
  'XAUT', 'GRAM', 'HBAR', 'USDG', 'QNT', 'PYUSD', 'SHIB', 'RLUSD', 'TAO', 'CRO',
  'USDY', 'OKB', 'USYC', 'ENA', 'PEPE', 'AAVE', 'EURSAFO', 'BUIDL', 'M', 'PAXG',
  'USDF', 'ONDO', 'PUMP', 'ASTER', 'BTW', 'U', 'DOT', 'USDD', 'SKY', 'MORPHO',
  'WLFI', 'MNT', 'HTX', 'ICP', 'BFUSD', 'WLD', 'BGB', 'USDGO', 'JST', 'ETC',
  'ARB', 'VVV', 'GT', 'KCS', 'POL', 'OUSD', 'LIT', 'PI', 'ALGO', 'KAS',
  'INJ', 'RENDER', 'JUP', 'NEXO', 'ATOM', 'GHO', 'FIL', 'NIGHT', 'STX', 'ZRO',
  'USTB', 'CAKE', 'XDC', 'PEARL', 'JAAA', 'DASH', 'BDX', 'USD0', 'ETHFI', 'EURC',
] as const

const ranked = new Set<string>(TOP_100)
const rankedSlugs = new Set<string>(TOP_MARKS.map((mark) => mark.slug))

/** Converter tickers that are not already in the top 100, then the top 100. */
export const SPINE_LINE = [
  ...COINS.map((coin) => coin.label).filter((label) => !ranked.has(label)),
  ...TOP_100,
].join(' · ')

/**
 * Logos that run along the right side. Converter coins already in the top 100
 * are not repeated, and satoshis are left out so Bitcoin is not shown twice.
 */
export const SPINE_MARKS = [
  ...COINS.flatMap((coin) => {
    if (coin.id === 'sats' || !coin.mark || ranked.has(coin.label)) return []
    const slug = coin.page ?? coin.gecko
    if (!slug || rankedSlugs.has(slug)) return []
    return [{ id: coin.id, name: coin.name, src: coin.mark, slug }]
  }),
  ...TOP_MARKS,
]
