import './style.css'
import { subscribe, subscribeSettings, getSettings, startSync } from './store'
import { createCloudCanvas } from './components/CloudCanvas'
import { createControlBar } from './components/ControlBar'

const app = document.querySelector<HTMLDivElement>('#app')!
const cloud = createCloudCanvas()

app.append(cloud.element, createControlBar())

function applyTheme(): void {
  document.body.dataset.theme = getSettings().theme
}

subscribe(cloud.draw)
subscribeSettings(() => {
  applyTheme()
  cloud.draw()
})

let resizeTimer: number
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(cloud.draw, 150)
})

applyTheme()
cloud.draw()
startSync()
