import { addWord, getSettings, updateSettings, subscribeSettings } from '../store'
import { PALETTES, FONTS, type Option } from '../constants'

function optionsHtml(list: Option[], selected: string): string {
  return list
    .map((o) => `<option value="${o.value}"${o.value === selected ? ' selected' : ''}>${o.label}</option>`)
    .join('')
}

export function createControlBar(): HTMLElement {
  const s = getSettings()

  const bar = document.createElement('div')
  bar.className = 'controls'
  bar.innerHTML = `
    <label class="field">
      <span>Palette</span>
      <select id="palette">${optionsHtml(PALETTES, s.palette)}</select>
    </label>
    <label class="field">
      <span>Font</span>
      <select id="font">${optionsHtml(FONTS, s.font)}</select>
    </label>
    <label class="check">
      <input id="capitalize" type="checkbox"${s.capitalize ? ' checked' : ''} />
      <span>Capitalize</span>
    </label>
    <button id="theme" class="icon-btn" type="button" title="Toggle theme" aria-label="Toggle theme">
      ${s.theme === 'dark' ? '☀️' : '🌙'}
    </button>

    <form id="form" class="form" autocomplete="off">
      <input id="input" class="input" type="text" name="word"
        placeholder="Type a word…" maxlength="30" required aria-label="Word" />
      <button class="submit" type="submit">Add</button>
    </form>
  `

  const form = bar.querySelector<HTMLFormElement>('#form')!
  const input = bar.querySelector<HTMLInputElement>('#input')!
  const paletteSel = bar.querySelector<HTMLSelectElement>('#palette')!
  const fontSel = bar.querySelector<HTMLSelectElement>('#font')!
  const capitalizeChk = bar.querySelector<HTMLInputElement>('#capitalize')!
  const themeBtn = bar.querySelector<HTMLButtonElement>('#theme')!

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const value = input.value
    input.value = ''
    input.focus()
    void addWord(value)
  })

  paletteSel.addEventListener('change', () => updateSettings({ palette: paletteSel.value }))
  fontSel.addEventListener('change', () => updateSettings({ font: fontSel.value }))
  capitalizeChk.addEventListener('change', () => updateSettings({ capitalize: capitalizeChk.checked }))
  themeBtn.addEventListener('click', () =>
    updateSettings({ theme: getSettings().theme === 'dark' ? 'light' : 'dark' }),
  )

  subscribeSettings((settings) => {
    themeBtn.textContent = settings.theme === 'dark' ? '☀️' : '🌙'
  })

  return bar
}
