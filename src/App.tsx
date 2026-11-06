import { memo, useEffect, useRef, useState, type KeyboardEvent } from 'react'
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

function readNight() {
  try {
    const stored = localStorage.getItem('rate:theme')
    if (stored === 'night') return true
    if (stored === 'day') return false
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

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

const Spine = memo(function Spine() {
  return (
    <>
      <div className="spine spine-l" aria-hidden="true">
        <p className="spine-run">
          {SPINE_LINE}
          {' · '}
          {SPINE_LINE}
        </p>
      </div>
      <div className="spine spine-r">
        <div className="mark-run">
          {[0, 1].map((copy) => (
            <div className="mark-set" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {[0, 1, 2].map((loop) =>
                SPINE_MARKS.map((mark) => (
                  <a
                    key={`${loop}-${mark.id}`}
                    href={`https://www.coingecko.com/en/coins/${mark.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={copy === 0 && loop === 0 ? undefined : -1}
                    aria-label={`${mark.name} on CoinGecko`}
                  >
                    <img src={mark.src} alt="" width="28" height="28" />
                  </a>
                )),
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
})

function PriceClock({
  fetchedAt,
  phase,
  source,
}: {
  fetchedAt: number | null
  phase: 'loading' | 'ready' | 'error'
  source: Rates['source'] | null
}) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 5000)
    return () => window.clearInterval(id)
  }, [])

  const backup = source === 'daily backup'
  const age = fetchedAt ? formatAge(fetchedAt, now) : null
  const fresh = phase === 'ready' && fetchedAt != null && !backup && now - fetchedAt < 120_000
  const status = !fetchedAt
    ? phase === 'error'
      ? 'Prices didn’t load'
      : 'Fetching prices'
    : backup
      ? 'Daily backup'
      : phase === 'error'
        ? `Offline · saved ${age}`
        : `Updated ${age}`

  return (
    <>
      <p>
        <i className={fresh ? 'mark is-fresh' : backup ? 'mark is-stale' : 'mark'} aria-hidden="true" />
        <span>{status}</span>
      </p>
      {source && <p className={backup ? 'source-name is-backup' : 'source-name'}>{backup ? 'Prices can be a day old' : source}</p>}
    </>
  )
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
  const [pickerOpen, setPickerOpen] = useState(false)
  const [night, setNight] = useState(readNight)
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const noticeTimer = useRef(0)

  useEffect(() => {
    document.documentElement.dataset.theme = night ? 'night' : 'day'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', night ? '#090a07' : '#0000F0')
  }, [night])

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
    if (!pickerOpen) return
    const list = pickerRef.current?.querySelector<HTMLElement>('.asset-list')
    const selected = list?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
    if (!list || !selected) return
    const top = selected.offsetTop
    list.scrollTop = Math.max(0, top - list.clientHeight / 2 + selected.offsetHeight / 2)
    selected.focus()
  }, [pickerOpen])

  useEffect(() => {
    setPickerOpen(false)
  }, [from])

  useEffect(() => {
    if (!pickerOpen) return
    function onPointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) setPickerOpen(false)
    }
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setPickerOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [pickerOpen])

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

  function onPickerKey(event: KeyboardEvent<HTMLDivElement>) {
    const options = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]')]
    const index = options.findIndex((option) => option === document.activeElement)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = event.key === 'ArrowDown' ? Math.min(options.length - 1, index + 1) : Math.max(0, index - 1)
      options[next]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      options[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      options[options.length - 1]?.focus()
    }
  }

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

  return (
    <div className="page">
      <Spine />

      <main className="sheet">
        <header className="top">
          <h1 className="logo">
            <span>Crypto</span> <span>converter</span>
          </h1>
          <div className={rates?.source === 'daily backup' ? 'status is-backup' : 'status'}>
            <PriceClock
              fetchedAt={rates?.fetchedAt ?? null}
              phase={phase}
              source={rates?.source ?? null}
            />
            <button type="button" onClick={() => window.dispatchEvent(new Event('rate:refresh'))}>
              Refresh
            </button>
            <button
              type="button"
              className="theme-toggle"
              aria-pressed={night}
              onClick={() => {
                const next = !night
                setNight(next)
                try {
                  localStorage.setItem('rate:theme', next ? 'night' : 'day')
                } catch {
                  /* the switch still works for this visit */
                }
              }}
            >
              {night ? 'Day' : 'Night'}
            </button>
          </div>
        </header>
        {rates?.source === 'daily backup' && (
          <p className="backup-note" role="status">
            CoinGecko didn’t answer. These figures are from the daily backup and can be a day old.
          </p>
        )}

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
                ? 'The sheet shows that amount in currency.'
                : 'The sheet shows that amount in coins.'}
            </p>
            <div className={pickerOpen ? 'picker is-open' : 'picker'} ref={pickerRef}>
              <button
                type="button"
                className="asset-name"
                aria-expanded={pickerOpen}
                aria-controls="asset-list"
                aria-haspopup="listbox"
                onClick={() => setPickerOpen((open) => !open)}
              >
                <span className="asset-title">
                  {source.name}
                  {source.id === 'sats' && <span> · 100,000,000 per bitcoin</span>}
                </span>
              </button>
              {pickerOpen && (
                <div
                  id="asset-list"
                  className="asset-list"
                  role="listbox"
                  aria-label={source.kind === 'coin' ? 'Coins' : 'Currencies'}
                  onKeyDown={onPickerKey}
                >
                  {(source.kind === 'coin' ? COINS : FIATS).map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      role="option"
                      aria-selected={asset.id === from}
                      className="asset-option"
                      onClick={() => {
                        setFrom(asset.id)
                        setPickerOpen(false)
                      }}
                    >
                      <span className="asset-code" translate="no">
                        {asset.label}
                      </span>
                      <span>{asset.name}</span>
                    </button>
                  ))}
                </div>
              )}
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
            {rates?.source === 'daily backup'
              ? 'CoinGecko didn’t answer, so these are backup prices and can be a day old. HYPE, ZANO, and RAIL may be missing.'
              : 'Prices come from CoinGecko.'}{' '}
            The amount stays in this browser and is not part of that request. Vercel Analytics counts
            the visit and does not receive the amount.
          </p>
          <p>
            Built by{' '}
            <a href="https://x.com/0zkphilip" target="_blank" rel="noopener noreferrer">
              @0zkphilip
            </a>
            {'. '}
            <a
              href="https://github.com/philipgjorup/thecryptoconverter"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open source on GitHub
            </a>.
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
