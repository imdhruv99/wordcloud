import WordCloud from 'wordcloud'
import type { Settings } from './store'
import { PALETTE_COLORS, FONT_STACKS } from './constants'

function lighten(hex: string, amount: number): string {
    const n = parseInt(hex.slice(1), 16)
    const r = (n >> 16) & 255
    const g = (n >> 8) & 255
    const b = n & 255
    const to = (c: number) => Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0')
    return `#${to(r)}${to(g)}${to(b)}`
}

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

function colorFor(word: string, settings: Settings): string {
    const colors = PALETTE_COLORS[settings.palette] ?? PALETTE_COLORS.multiple
    let hash = 0
    for (let i = 0; i < word.length; i++) hash = word.charCodeAt(i) + ((hash << 5) - hash)
    const color = colors[Math.abs(hash) % colors.length]
    return settings.theme === 'dark' ? lighten(color, 0.4) : color
}

// Stable per-word multiplier (0.5–2.0) so sizes vary even when counts are equal.
function sizeJitter(word: string): number {
    let h = 2166136261
    for (let i = 0; i < word.length; i++) {
        h ^= word.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return 0.5 + ((h >>> 0) % 1000) / 1000 * 1.5
}

/** Render the word cloud for the given counts into the target element (spans). */
export function renderCloud(
    target: HTMLElement,
    counts: Map<string, number>,
    settings: Settings,
): void {
    const entries = [...counts.entries()]

    if (entries.length === 0) {
        target.innerHTML = ''
        return
    }

    const list: [string, number][] = entries.map(([w, n]) => {
        const word = settings.capitalize ? capitalize(w) : w
        return [word, n * sizeJitter(word)]
    })

    const max = Math.max(...list.map(([, n]) => n))
    const base = Math.min(target.clientWidth, target.clientHeight)

    // Adapt size and spacing to word count: few words = smaller + airy,
    // many words = larger + tighter so it never looks clustered.
    const count = list.length
    const fontScale = Math.min(1, Math.max(0.35, count / 20))
    const spread = count <= 8 ? 56 : count <= 20 ? 40 : 26

    WordCloud(target, {
        list,
        gridSize: Math.max(8, Math.round((base / 1024) * spread)),
        weightFactor: (n: number) => (0.18 + 0.82 * (n / max)) * (base / 7) * fontScale,
        fontFamily: FONT_STACKS[settings.font] ?? FONT_STACKS.Inter,
        color: (word: string) => colorFor(word, settings),
        rotateRatio: 0.6,
        rotationSteps: 2,
        minRotation: 0,
        maxRotation: Math.PI / 2,
        backgroundColor: 'transparent',
        drawOutOfBound: false,
        shrinkToFit: true,
    })
}
