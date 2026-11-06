import { useEffect, useRef, useState } from 'react'
import {
  ASSET_MAP,
  COINS,
  FIATS,
  type Asset,
  type Kind,
  type Rates,
  convert,
  fetchRates,
  formatAge,
  formatQuote,
  parseAmount,
  readCache,
  writeCache,
} from './market'
import { SPINE_LINE, SPINE_MARKS } from './decor'
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

function defaultInto(fromId: string) {
  return ASSET_MAP[fromId]?.kind === 'coin' ? 'usd' : 'btc'
}

function readInto(fromId: string) {
  try {
    const stored = localStorage.getItem('rate:into')
    const fromKind = ASSET_MAP[fromId]?.kind
    if (stored && ASSET_MAP[stored] && ASSET_MAP[stored].kind !== fromKind) return stored
  } catch {
    /* ignore */
  }
  return defaultInto(fromId)
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
  const [into, setInto] = useState(() => readInto(readFrom()))
  const [alsoOpen, setAlsoOpen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 980px)').matches,
  )
  const [rates, setRates] = useState<Rates | null>(readCache)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>(readCache() ? 'ready' : 'loading')
  const [notice, setNotice] = useState<string | null>(null)
  const [hot, setHot] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const inputRef = useRef<HTMLInputElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)
  const noticeTimer = useRef(0)

  useEffect(() => {
    try {
      localStorage.setItem('rate:amount', amount)
      localStorage.setItem('rate:from', from)
      localStorage.setItem('rate:into', into)
    } catch {
      /* ignore */
    }
  }, [amount, from, into])

  useEffect(() => {
    const root = chipsRef.current
    const chip = root?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!root || !chip) return
    const left = chip.offsetLeft - (root.clientWidth - chip.offsetWidth) / 2
    root.scrollTo({ left: Math.max(0, left) })
  }, [from])

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
  const targets = source.kind === 'coin' ? FIATS : COINS
  const featured = targets.find((asset) => asset.id === into) ?? targets[0]
  const sameKind = (source.kind === 'coin' ? COINS : FIATS).filter((asset) => asset.id !== from)
  const price = (asset: Asset) => (rates ? convert(parsed, from, asset.id, rates) : null)
  const featuredValue = price(featured)
  const intoWords = source.kind === 'coin' ? 'currency' : 'coins'
  const sameWords = source.kind === 'coin' ? 'other coins' : 'other currencies'

  function chooseKind(kind: Kind) {
    if (source.kind === kind) return
    if (featured.kind === kind) {
      setFrom(featured.id)
      setInto(from)
      return
    }
    const nextFrom = kind === 'coin' ? 'btc' : 'usd'
    setFrom(nextFrom)
    setInto(defaultInto(nextFrom))
  }

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
      <div className="spine spine-l" aria-hidden="true">
        <p className="spine-run">
          {SPINE_LINE}
          {' · '}
          {SPINE_LINE}
        </p>
      </div>
      <div className="spine spine-r">
        <div className="mark-run">
          {[0, 1].map((copy) =>
            SPINE_MARKS.map((mark) => (
              <a
                key={`${copy}-${mark.id}`}
                href={`https://www.coingecko.com/en/coins/${mark.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={copy === 0 ? undefined : -1}
                aria-hidden={copy === 1 ? true : undefined}
                aria-label={`${mark.name} on CoinGecko`}
              >
                <img src={mark.src} alt="" width="28" height="28" />
              </a>
            )),
          )}
        </div>
      </div>

      <main className="sheet">
        <header className="top">
          <h1 className="logo">
            <span>Crypto</span> <span>converter</span>
          </h1>
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
              You have
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
              aria-describedby="convert-hint"
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => {
                const next = event.target.value
                if (/^[0-9.,\s']*$/.test(next) && next.length <= 24) setAmount(next)
              }}
            />

            <div className="kind-switch" role="group" aria-label="Coin or currency">
              <button type="button" aria-pressed={source.kind === 'coin'} onClick={() => chooseKind('coin')}>
                Coin
              </button>
              <button
                type="button"
                aria-pressed={source.kind === 'fiat'}
                onClick={() => chooseKind('fiat')}
              >
                Currency
              </button>
            </div>
            <p id="convert-hint" className="convert-hint">
              {source.kind === 'coin'
                ? 'Pick the coin. The blue sheet shows that amount in currency.'
                : 'Pick the currency. The blue sheet shows that amount in coins.'}
            </p>
            <p className="asset-name">
              {source.name}
              {source.id === 'sats' && <span> · 100,000,000 per bitcoin</span>}
            </p>
            <div className="chips" role="group" aria-label={source.kind === 'coin' ? 'Coins' : 'Currencies'} ref={chipsRef}>
              {(source.kind === 'coin' ? COINS : FIATS).map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className="chip"
                  aria-pressed={asset.id === from}
                  onClick={() => setFrom(asset.id)}
                >
                  {asset.label}
                </button>
              ))}
            </div>
          </section>

          <section className="field" aria-label={`In ${intoWords}`}>
            <svg className="waves" viewBox="0 0 1200 760" preserveAspectRatio="none" aria-hidden="true">
              {WAVE_PATHS.map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
            <div className="shade" aria-hidden="true" />
            <div className="field-body">
              <div className="field-head">
                <h2>In {intoWords}</h2>
                <p translate="no">
                  {amount.trim() || '0'} {source.label}
                </p>
              </div>
              <div className="feature">
                <p className="feature-kicker" translate="no">
                  {amount.trim() || '0'} {source.label} =
                </p>
                <p className={`feature-value ${lengthClass(featuredValue == null ? '—' : formatQuote(featuredValue, featured.id))}`} translate="no">
                  {featuredValue == null ? '—' : formatQuote(featuredValue, featured.id)}
                </p>
                <p className="feature-name">
                  {featured.label} · {featured.name}
                </p>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => onQuote(featured, featuredValue)}
                  disabled={featuredValue == null}
                >
                  {hot === featured.id ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="board" role="radiogroup" aria-label={`Choose a ${source.kind === 'coin' ? 'currency' : 'coin'}`}>
                {targets.map((asset) => {
                  const value = price(asset)
                  const selected = asset.id === featured.id
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className="quote"
                      onClick={() => setInto(asset.id)}
                    >
                      <span className="quote-meta">
                        <span className="code" translate="no">
                          {asset.label}
                        </span>
                        <span className="name">{asset.name}</span>
                      </span>
                      <span className={`value ${lengthClass(value == null ? '—' : formatQuote(value, asset.id))}`} translate="no">
                        {value == null ? '—' : formatQuote(value, asset.id)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        </div>

        <section className="also" aria-label={`Same amount in ${sameWords}`}>
          <div className="also-head">
            <h2 id="also-title">Same amount in {sameWords}</h2>
            <button
              type="button"
              className="also-toggle"
              aria-expanded={alsoOpen}
              aria-controls="also-list"
              onClick={() => setAlsoOpen((open) => !open)}
            >
              {alsoOpen ? 'Hide' : 'Show'}
            </button>
          </div>
          {alsoOpen && (
            <div className="minor" id="also-list">
              {sameKind.map((asset) => {
                const value = price(asset)
                return (
                  <button
                    key={asset.id}
                    type="button"
                    className="minor-quote"
                    onClick={() => setFrom(asset.id)}
                    aria-label={`Convert ${asset.name} instead`}
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
          )}
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
            Open to anyone. No account and no wallet. Opening the link does not sign you in or ask
            for a permission.
          </p>
          <p>
            {rates?.source === 'daily backup'
              ? 'CoinGecko didn’t answer, so these are backup prices and can be a day old. HYPE, ZANO, and RAIL may be missing.'
              : 'Prices come from CoinGecko.'}{' '}
            The amount stays in this browser and is not part of that request. Vercel Analytics counts
            the visit and does not receive the amount.
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
