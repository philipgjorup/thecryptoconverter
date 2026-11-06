import { COINS } from './market'

/** Tickers on the sheet, running down the left side. */
export const SPINE_LINE = COINS.map((coin) => coin.label).join(' · ')

/** Logos for the coins on the sheet. Satoshis share Bitcoin’s mark, so Bitcoin appears once. */
export const SPINE_MARKS = COINS.filter((coin) => coin.id !== 'sats' && coin.mark).map((coin) => ({
  id: coin.id,
  name: coin.name,
  src: coin.mark as string,
  slug: coin.page ?? coin.gecko ?? 'bitcoin',
}))

/** Near-black or navy marks. Night mode puts these on a cream disc so the shape stays visible. */
export const NIGHT_PLATE = new Set(['eth'])
