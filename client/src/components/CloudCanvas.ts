import gsap from 'gsap'
import { renderCloud } from '../cloud'
import { getCounts, getSettings } from '../store'

export type CloudCanvas = {
    element: HTMLElement
    draw: () => void
}

export function createCloudCanvas(): CloudCanvas {
    const wrap = document.createElement('section')
    wrap.className = 'cloud-wrap'

    const stage = document.createElement('div')
    stage.id = 'cloud'

    const empty = document.createElement('p')
    empty.className = 'empty'
    empty.textContent = 'What\'s on your mind ? '

    wrap.append(stage, empty)

    // Words present at the previous render, so we only animate genuinely new ones.
    let prev = new Map<string, number>()
    let newWords = new Set<string>()
    let firstRender = true

    // Fade in only the words that were just added; leave existing words untouched.
    stage.addEventListener('wordcloudstop', () => {
        const spans = [...stage.querySelectorAll<HTMLSpanElement>('span')]
        const targets = firstRender
            ? spans
            : spans.filter((s) => newWords.has((s.textContent ?? '').trim().toLowerCase()))
        if (!targets.length) return
        gsap.fromTo(
            targets,
            { opacity: 0, filter: 'blur(12px)' },
            {
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.9,
                stagger: { each: 0.12, from: 'start' },
                ease: 'power2.out',
                clearProps: 'filter',
            },
        )
    })

    // Grow the stage past the viewport as words accumulate so nothing is clipped.
    function sizeStage(wordCount: number): void {
        const grow = Math.max(1, Math.sqrt(wordCount / 24))
        stage.style.width = `${Math.round(wrap.clientWidth * grow)}px`
        stage.style.height = `${Math.round(wrap.clientHeight * grow)}px`
    }

    function render(): void {
        sizeStage(getCounts().size)
        renderCloud(stage, getCounts(), getSettings())
    }

    function draw(): void {
        const counts = getCounts()
        empty.style.display = counts.size === 0 ? 'flex' : 'none'

        firstRender = prev.size === 0
        newWords = new Set(
            [...counts.keys()].filter((w) => !prev.has(w)).map((w) => w.toLowerCase()),
        )
        prev = new Map(counts)
        render()
    }

    return { element: wrap, draw }
}
