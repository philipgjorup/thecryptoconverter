export const PAGE_TITLE = 'Crypto Converter — BTC, ETH, SOL to USD, EUR, JPY'

export const PAGE_DESCRIPTION =
  'Convert Bitcoin, satoshis, Ethereum, Solana, and other coins you can spend into dollars, euro, pounds, yen, yuan, pesos, won, rupees, and other currencies. No account. Your amount stays in the browser.'

export const FAQ = [
  {
    question: 'What does this crypto converter do?',
    answer:
      'It converts Bitcoin, satoshis, Ethereum, Solana, BNB, TRON, and other coins you can spend into US dollars, euro, yen, yuan, British pounds, Australian and Canadian dollars, Costa Rican colón, Danish krone, Mexican, Argentine, and Colombian pesos, and the Asian currencies on the sheet. Type an amount, pick a coin or a currency, and the rest of the sheet updates at once.',
  },
  {
    question: 'How many satoshis are in one bitcoin?',
    answer:
      'One bitcoin is 100,000,000 satoshis. Choose BTC or SATS and the sheet converts between them along with the other coins and currencies.',
  },
  {
    question: 'Which currencies does the converter include?',
    answer:
      'US dollars, euro, yen, yuan, British pounds (GBP), Australian dollars (AUD), Canadian dollars (CAD), Costa Rican colón (CRC), Danish krone (DKK), Mexican peso (MXN), Argentine peso (ARS), Colombian peso (COP), Korean won (KRW), Indian rupee (INR), Indonesian rupiah (IDR), Thai baht (THB), Vietnamese dong (VND), Philippine peso (PHP), Malaysian ringgit (MYR), Singapore dollar (SGD), Hong Kong dollar (HKD), and Taiwan dollar (TWD).',
  },
  {
    question: 'Does the amount I type get uploaded?',
    answer:
      'No. The amount stays in this browser. The page asks CoinGecko for public prices only, and that request does not include what you typed. There is no account and no wallet connection. Vercel Analytics counts the visit and does not receive the amount.',
  },
  {
    question: 'Where do the crypto prices come from?',
    answer:
      'CoinGecko, refreshed about once a minute. If CoinGecko does not answer, the sheet says daily backup and the figures can be a day old. Toncoin and Zano can be missing on that backup. The Colombian peso uses that daily dollar rate, because the minute-by-minute list has no peso.',
  },
] as const

/** A labeled sponsor can be added later. Null means the page shows no sponsor and loads no third-party ad script. */
export const SPONSOR: { name: string; url: string; line: string } | null = null
