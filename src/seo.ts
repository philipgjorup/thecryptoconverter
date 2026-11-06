export const PAGE_TITLE = 'Crypto Converter — BTC, ETH, SOL to USD, EUR, JPY'

export const PAGE_DESCRIPTION =
  'Convert Bitcoin, satoshis, Ethereum, Solana, XRP, and other coins into dollars, euro, yen, yuan, colón, and kroner. No account. Your amount stays in the browser.'

export const FAQ = [
  {
    question: 'What does this crypto converter do?',
    answer:
      'It converts Bitcoin, satoshis, Ethereum, Solana, XRP, BNB, and other coins into US dollars, euro, yen, yuan, Costa Rican colón, and Danish krone. Type an amount, pick a coin or a currency, and the rest of the sheet updates at once.',
  },
  {
    question: 'How many satoshis are in one bitcoin?',
    answer:
      'One bitcoin is 100,000,000 satoshis. Choose BTC or SATS and the sheet converts between them along with the other coins and currencies.',
  },
  {
    question: 'Which cryptocurrencies can I convert?',
    answer:
      'Bitcoin, satoshis, Ethereum, Tether, BNB, XRP, USD Coin, Solana, TRON, Dogecoin, Zcash, Monero, Hyperliquid, NEAR, Zano, and Railgun.',
  },
  {
    question: 'Which currencies does the converter include?',
    answer: 'US dollars, euro, yen, yuan, Costa Rican colón (CRC), and Danish krone (DKK).',
  },
  {
    question: 'Does the amount I type get uploaded?',
    answer:
      'No. The amount stays in this browser. The page asks CoinGecko for public prices only, and that request does not include what you typed. There is no account and no wallet connection. Vercel Analytics counts the visit and does not receive the amount.',
  },
  {
    question: 'Where do the crypto prices come from?',
    answer:
      'CoinGecko, refreshed about once a minute. If CoinGecko does not answer, the sheet uses a daily public backup feed instead. Hyperliquid, Zano, and Railgun can be missing on that backup.',
  },
] as const

/** A labeled sponsor can be added later. Null means the page shows no sponsor and loads no third-party ad script. */
export const SPONSOR: { name: string; url: string; line: string } | null = null
