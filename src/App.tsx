import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ASSET_MAP,
  COINS,
  FIATS,
  type Asset,
  type Rates,
  convert,
  fetchRates,
  formatAge,
  formatQuote,
  parseAmount,
  readCache,
  writeCache,
} from './market'
import { FAQ, PAGE_DESCRIPTION, SPONSOR } from './seo'

const WAVE_PATHS = Array.from({ length: 16 }, (_, i) => {
  const y = 28 + i * 46
  const amp = 8 + (i % 4) * 4
  let d = `M0 ${y}`
  for (let x = 0; x <= 1200; x += 24) {
    const yy = y + Math.sin((x + i * 37) / (78 + (i % 3) * 18)) * amp
    d += `L${x} ${yy.toFixed(1)}`
  }
  return d
})

function readAmount() {
  try {
    const stored = localStorage.getItem('rate:amount')
    if (stored && /^[0-9.,\s']{1,24}$/.test(stored)) return stored
  } catch {
    /* ignore */
  }
  return '1'
}

function readFrom() {
  try {
    const stored = localStorage.getItem('rate:from')
    if (stored && ASSET_MAP[stored]) return stored
  } catch {
    /* ignore */
  }
  return 'btc'
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.left = '-999px'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}

export function App() {
  const [amount, setAmount] = useState(readAmount)
  const [from, setFrom] = useState(readFrom)
  const [rates, setRates] = useState<Rates | null>(readCache)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>(readCache() ? 'ready' : 'loading')
  const [notice, setNotice] = useState<string | null>(null)
  const [hot, setHot] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const inputRef = useRef<HTMLInputElement>(null)
  const noticeTimer = useRef(0)

  useEffect(() => {
    try {
      localStorage.setItem('rate:amount', amount)
      localStorage.setItem('rate:from', from)
    } catch {
      /* ignore */
    }
  }, [amount, from])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 5000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let generation = 0
    let timer = 0
    let stopped = false
    let lastOk = 0

    async function pull(force: boolean) {
      if (!force && lastOk && Date.now() - lastOk < 15_000) return
      const mine = ++generation
      try {
        const next = await fetchRates(controller.signal)
        if (stopped || mine !== generation) return
        lastOk = Date.now()
        setRates(next)
        setPhase('ready')
        writeCache(next)
        setNow(Date.now())
      } catch (error) {
        if (stopped || (error instanceof DOMException && error.name === 'AbortError')) return
        if (mine !== generation) return
        setPhase('error')
      }
    }

    void pull(true)
    const loop = () => {
      timer = window.setTimeout(() => {
        if (document.visibilityState === 'visible') void pull(false)
        if (!stopped) loop()
      }, 60_000)
    }
    loop()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void pull(false)
    }
    document.addEventListener('visibilitychange', onVisible)
    const refresh = () => void pull(true)
    window.addEventListener('rate:refresh', refresh)
    return () => {
      stopped = true
      controller.abort()
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('rate:refresh', refresh)
    }
  }, [])

  const parsed = parseAmount(amount)
  const source = ASSET_MAP[from]

  const board = useMemo(() => {
    const primary = source.kind === 'coin' ? FIATS : COINS
    const secondary = (source.kind === 'coin' ? COINS : FIATS).filter((asset) => asset.id !== from)
    const price = (asset: Asset) => (rates ? convert(parsed, from, asset.id, rates) : null)
    return {
      primary,
      secondary,
      heading: source.kind === 'coin' ? 'In cash' : 'In coins',
      also: source.kind === 'coin' ? 'Also in coins' : 'Also in currency',
      price,
    }
  }, [from, parsed, rates, source.kind])

  function showNotice(text: string) {
    setNotice(text)
    window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => setNotice(null), 1600)
  }

  async function onQuote(asset: Asset, value: number | null) {
    if (value == null) return
    const formatted = formatQuote(value, asset.id)
    const line = `${formatQuote(parsed, from)} ${source.label} = ${formatted} ${asset.label}`
    const ok = await copyText(line)
    setHot(asset.id)
    window.setTimeout(() => setHot((current) => (current === asset.id ? null : current)), 1600)
    showNotice(ok ? `Copied ${formatted} ${asset.label}` : 'Couldn’t copy')
  }

  const age = rates ? formatAge(rates.fetchedAt, now) : null
  const fresh = phase === 'ready' && rates != null && now - rates.fetchedAt < 120_000
  const status = !rates
    ? phase === 'error'
      ? 'Prices didn’t load'
      : 'Fetching prices'
    : phase === 'error'
      ? `Offline · saved ${age}`
      : `Updated ${age}`

  return (
    <div className="page">
      <p className="spine spine-l" aria-hidden="true">
        BTC · SATS · ETH · USDT · BNB · XRP · USDC · SOL · TRX · DOGE · ZEC · XMR · HYPE · NEAR
      </p>
      <p className="spine spine-r" aria-hidden="true">
        USD · EURO · YEN · YUAN · CRC · DKK
      </p>

      <main className="sheet">
        <header className="top">
          <div>
            <h1 className="eyebrow">Crypto converter</h1>
            <p className="logo">Rate</p>
          </div>
          <div className="status">
            <p>
              <i className={fresh ? 'mark is-fresh' : 'mark'} aria-hidden="true" />
              <span>{status}</span>
            </p>
            {rates && <p className="source-name">{rates.source}</p>}
            <button type="button" onClick={() => window.dispatchEvent(new Event('rate:refresh'))}>
              Refresh
            </button>
          </div>
        </header>

        <div className="workspace">
          <section className="controls" aria-label="Amount">
            <label className="amount-label" htmlFor="amount">
              Amount
            </label>
            <input
              id="amount"
              ref={inputRef}
              className="amount"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={amount}
              aria-describedby="asset-name"
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => {
                const next = event.target.value
                if (/^[0-9.,\s']*$/.test(next) && next.length <= 24) setAmount(next)
              }}
            />
            <p id="asset-name" className="asset-name">
              {source.name}
              {source.id === 'sats' && <span> · 100,000,000 per bitcoin</span>}
            </p>

            <div className="pick">
              <Picker label="Coin" assets={COINS} selected={from} onSelect={setFrom} />
              <Picker label="Currency" assets={FIATS} selected={from} onSelect={setFrom} />
            </div>
          </section>

          <section className="field" aria-label={board.heading}>
            <svg className="waves" viewBox="0 0 1200 760" preserveAspectRatio="none" aria-hidden="true">
              {WAVE_PATHS.map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
            <div className="shade" aria-hidden="true" />
            <div className="field-body">
              <div className="field-head">
                <h2>{board.heading}</h2>
                <p translate="no">
                  {amount.trim() || '0'} {source.label}
                </p>
              </div>
              <div className="board" data-count={board.primary.length}>
                {board.primary.map((asset) => (
                  <QuoteButton
                    key={asset.id}
                    asset={asset}
                    value={board.price(asset)}
                    hot={hot === asset.id}
                    onCopy={onQuote}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="also" aria-label={board.also}>
          <h2>{board.also}</h2>
          <div className="minor">
            {board.secondary.map((asset) => {
              const value = board.price(asset)
              return (
                <button
                  key={asset.id}
                  type="button"
                  className="minor-quote"
                  data-hot={hot === asset.id ? 'true' : 'false'}
                  onClick={() => onQuote(asset, value)}
                  aria-label={
                    value == null
                      ? `${asset.name} unavailable`
                      : `Copy ${formatQuote(value, asset.id)} ${asset.label}`
                  }
                >
                  <span className="code" translate="no">
                    {asset.label}
                  </span>
                  <span className={`value ${lengthClass(value == null ? '—' : formatQuote(value, asset.id))}`} translate="no">
                    {value == null ? '—' : formatQuote(value, asset.id)}
                  </span>
                  <span className="name">{asset.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="guide" aria-label="About this crypto converter">
          <h2>Questions people ask</h2>
          <p className="guide-lead">{PAGE_DESCRIPTION}</p>
          <dl>
            {FAQ.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer>
          {SPONSOR && (
            <p className="sponsor">
              Sponsor:{' '}
              <a href={SPONSOR.url} rel="sponsored noopener noreferrer">
                {SPONSOR.name}
              </a>
              . {SPONSOR.line}
            </p>
          )}
          <p>
            Open to anyone. No account, no wallet, and no cookies. Opening the link does not sign
            you in or ask for a permission.
          </p>
          <p>
            {rates?.source === 'daily backup'
              ? 'CoinGecko didn’t answer, so these are backup prices and can be a day old. HYPE may be missing.'
              : 'Prices come from CoinGecko.'}{' '}
            The amount stays in this browser and is not part of that request. Nothing here tracks you.
          </p>
        </footer>
      </main>

      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </div>
  )
}

function lengthClass(text: string) {
  if (text.length > 18) return 'is-xs'
  if (text.length > 14) return 'is-sm'
  return ''
}

function Picker({
  label,
  assets,
  selected,
  onSelect,
}: {
  label: string
  assets: Asset[]
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="pick-row">
      <span className="pick-label">{label}</span>
      <div className="chips" role="group" aria-label={label}>
        {assets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            className="chip"
            aria-pressed={asset.id === selected}
            onClick={() => onSelect(asset.id)}
          >
            {asset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function QuoteButton({
  asset,
  value,
  hot,
  onCopy,
}: {
  asset: Asset
  value: number | null
  hot: boolean
  onCopy: (asset: Asset, value: number | null) => void
}) {
  const text = value == null ? '—' : formatQuote(value, asset.id)
  return (
    <button
      type="button"
      className="quote"
      data-hot={hot ? 'true' : 'false'}
      onClick={() => onCopy(asset, value)}
      aria-label={value == null ? `${asset.name} unavailable` : `Copy ${text} ${asset.label}`}
    >
      <span className="code" translate="no">
        {asset.label}
      </span>
      <span className={`value ${lengthClass(text)}`} translate="no">
        {text}
      </span>
      <span className="name">{asset.name}</span>
    </button>
  )
}
