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
    empty.textContent = 'What\'s in your mind ? '

    wrap.append(stage, empty)

    // Reveal words one after another once the library has placed every word.
    stage.addEventListener('wordcloudstop', () => {
        const spans = stage.querySelectorAll<HTMLSpanElement>('span')
        gsap.fromTo(
            spans,
            { opacity: 0, filter: 'blur(12px)' },
            {
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.9,
                stagger: { each: 0.18, from: 'start' },
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

        const spans = stage.querySelectorAll<HTMLSpanElement>('span')
        if (spans.length) {
            // Gentle fade-out of the current cloud before it re-forms.
            gsap.to(spans, {
                opacity: 0,
                filter: 'blur(10px)',
                duration: 0.5,
                stagger: { each: 0.02, from: 'edges' },
                ease: 'power1.in',
                onComplete: render,
            })
        } else {
            render()
        }
    }

    return { element: wrap, draw }
}
