# Crypto Converter

An open-source converter for coins you can spend, priced in US dollars, euro, yen, yuan, British pounds, Australian and Canadian dollars, Costa Rican colón, Danish krone, Mexican, Argentine, and Colombian pesos, and the main Asian currencies.

The live page is [thecryptoconverter.com](https://thecryptoconverter.com). The source is MIT licensed.

## Coins

Listed by market cap: Bitcoin, satoshis, Ethereum, Tether, BNB, USD Coin, Solana, TRON, Monero, Dogecoin, Bitcoin Cash, Litecoin, Toncoin, Dash, and Zano.

Satoshis are bitcoin divided by 100,000,000. There is no separate satoshi market.

## Private by default

There is no account and no wallet connection. The amount you type stays in this browser. The price request does not include that amount.

Two things do leave the browser:

- A public price list from CoinGecko. If CoinGecko does not answer, the page uses a daily public backup feed.
- A visit count from Vercel Analytics. That count does not include the amount.

## Harder to tamper with

The live site will not load inside another page. Only this site’s own scripts can run, and a logo file is served so opening it cannot run code. A saved price list is shown only when it is a normal quote. A Bitcoin figure outside a very wide range is dropped, and the page asks for prices again. Nothing here is a wallet, and the amount you type is not part of the price request.

To report a problem: [security.txt](https://thecryptoconverter.com/.well-known/security.txt).

## Prices

This uses CoinGecko’s public `simple/price` API with no API key. The page asks again about once a minute while it is open, and it skips a repeat if the last good answer was under 15 seconds ago.

The number is CoinGecko’s aggregated price, not the last trade on one exchange. A small difference against Binance, Kraken, or another book is normal. The sheet shows the source and how long ago it was fetched. **CoinGecko** means the public API answered. **Daily backup** means it did not: a note across the sheet says the figures can be a day old, and Toncoin and Zano can be missing. The Colombian peso uses that same daily dollar rate even when CoinGecko answers, because the minute-by-minute list has no peso.

To check a price, open the coin’s logo on a wide screen. It goes to that coin’s CoinGecko page. Satoshis open the Bitcoin page.

## Add a coin

Add one entry to `COINS` in `src/market.ts`, in market-cap order, with its CoinGecko id in `gecko` and a logo file in `public/marks`. On a wide screen the right column is those logos, each the same size and linked to that coin’s CoinGecko page. Satoshis are left out so Bitcoin appears once. The left side repeats the same tickers.

## License

MIT. See [LICENSE](LICENSE).
