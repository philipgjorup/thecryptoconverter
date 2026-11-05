# Crypto Converter

A fast converter for Bitcoin, satoshis, Ethereum, Solana, XRP, and the other coins on the sheet, priced in US dollars, euro, yen, yuan, Costa Rican colón, and Danish krone.

The live page is [thecryptoconverter.com](https://thecryptoconverter.com).

## Private by default

There is no account and no wallet connection. The amount you type stays in your browser. The only network request is a public price list from CoinGecko, and that request does not include the amount. If CoinGecko does not answer, the page uses a daily public backup feed.

## Run it locally

```bash
npm install
npm run dev
```

Open the address Vite prints. `npm run check` tests the conversion math, and `npm run build` makes the production site.

## License

MIT. See [LICENSE](LICENSE).
