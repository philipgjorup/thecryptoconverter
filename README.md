# Crypto Converter

An open-source converter for the coins on the sheet, priced in US dollars, euro, yen, yuan, Costa Rican colón, and Danish krone.

The live page is [thecryptoconverter.com](https://thecryptoconverter.com). The source is MIT licensed.

## Coins

Bitcoin, satoshis, Ethereum, Tether, BNB, XRP, USD Coin, Solana, TRON, Dogecoin, Zcash, Monero, Hyperliquid, NEAR, and Zano.

Satoshis are bitcoin divided by 100,000,000. There is no separate satoshi market.

## Private by default

There is no account and no wallet connection. The amount you type stays in this browser. The price request does not include that amount.

Two things do leave the browser:

- A public price list from CoinGecko. If CoinGecko does not answer, the page uses a daily public backup feed.
- A visit count from Vercel Analytics. That count does not include the amount.

## Prices

This uses CoinGecko’s public `simple/price` API with no API key. The page asks again about once a minute while it is open, and it skips a repeat if the last good answer was under 15 seconds ago.

The number is CoinGecko’s aggregated price, not the last trade on one exchange. A small difference against Binance, Kraken, or another book is normal. The sheet shows the source and how long ago it was fetched. **CoinGecko** means the public API answered. **daily backup** means it did not, so the figure can be a day old, and Hyperliquid can be missing.

To check a price, open the coin’s logo on a wide screen. It goes to that coin’s CoinGecko page. Satoshis open the Bitcoin page.

## Run it locally

```bash
npm install
npm run dev
```

Open the address Vite prints. `npm run check` tests the conversion math, and `npm run build` makes the production site.

## Add a coin

Add one entry to `COINS` in `src/market.ts`, with its CoinGecko id in `gecko` and a logo file in `public/marks`. The logo appears on the right and links to that coin’s CoinGecko page. The ticker joins the left column when it is not already in the top 100.

## License

MIT. See [LICENSE](LICENSE).
