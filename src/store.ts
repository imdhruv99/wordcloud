const STORAGE_KEY = 'wordcloud:words'
const SETTINGS_KEY = 'wordcloud:settings'

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
let counts = load()
let settings = loadSettings()

function load(): Map<string, number> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return new Map()
        return new Map(Object.entries(JSON.parse(raw) as Record<string, number>))
    } catch {
        return new Map()
    }
}

function loadSettings(): Settings {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY)
        if (!raw) return { ...DEFAULT_SETTINGS }
        return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
    } catch {
        return { ...DEFAULT_SETTINGS }
    }
}

function persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(counts)))
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

export function addWord(input: string): boolean {
    const word = normalize(input)
    if (!word) return false
    counts.set(word, (counts.get(word) ?? 0) + 1)
    persist()
    emit()
    return true
}

export function getCounts(): Map<string, number> {
    return counts
}

export function clearWords(): void {
    counts = new Map()
    persist()
    emit()
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

// Keep multiple tabs/windows of the same browser in sync.
window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
        counts = load()
        emit()
    }
})
