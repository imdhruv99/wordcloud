const SETTINGS_KEY = 'wordcloud:settings'
const SYNC_INTERVAL = 3000

type Listener = (counts: Map<string, number>) => void

export type Settings = {
    palette: string
    font: string
    capitalize: boolean
    theme: 'light' | 'dark'
}

const DEFAULT_SETTINGS: Settings = {
    palette: 'multiple',
    font: 'Inter',
    capitalize: false,
    theme: 'dark',
}

const listeners = new Set<Listener>()
const settingsListeners = new Set<(s: Settings) => void>()
let counts = new Map<string, number>()
let settings = loadSettings()

function loadSettings(): Settings {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY)
        if (!raw) return { ...DEFAULT_SETTINGS }
        return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
    } catch {
        return { ...DEFAULT_SETTINGS }
    }
}

function persistSettings(): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

function emit(): void {
    for (const listener of listeners) listener(counts)
}

function emitSettings(): void {
    for (const listener of settingsListeners) listener(settings)
}

/** Normalize a raw submission into a single clean word, or null if invalid. */
export function normalize(input: string): string | null {
    const word = input.trim().toLowerCase()
    if (!word || word.length > 30) return null
    if (/\s/.test(word)) return null // single words only, no phrases
    return word
}

function toMap(obj: Record<string, number>): Map<string, number> {
    return new Map(Object.entries(obj))
}

/** Pull the latest shared counts from the server. */
export async function refresh(): Promise<void> {
    try {
        const res = await fetch('/api/words')
        if (!res.ok) return
        counts = toMap(await res.json())
        emit()
    } catch {
        // Offline or server error: keep whatever we already have.
    }
}

/** Start periodic syncing so words from other users appear automatically. */
export function startSync(): void {
    void refresh()
    setInterval(() => void refresh(), SYNC_INTERVAL)
}

export async function addWord(input: string): Promise<boolean> {
    const word = normalize(input)
    if (!word) return false
    // Optimistic update so the submitter sees it instantly.
    counts.set(word, (counts.get(word) ?? 0) + 1)
    emit()
    try {
        const res = await fetch('/api/words', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ word }),
        })
        if (res.ok) {
            counts = toMap(await res.json())
            emit()
        }
    } catch {
        // Keep the optimistic value; next refresh will reconcile.
    }
    return true
}

export function getCounts(): Map<string, number> {
    return counts
}

export function subscribe(listener: Listener): void {
    listeners.add(listener)
}

export function getSettings(): Settings {
    return settings
}

export function updateSettings(patch: Partial<Settings>): void {
    settings = { ...settings, ...patch }
    persistSettings()
    emitSettings()
}

export function subscribeSettings(listener: (s: Settings) => void): void {
    settingsListeners.add(listener)
}
