import * as PIXI from 'pixi.js'
import getTextPosition, { Position } from './GetTextPosition'
import HSV2RGB from './HSV2RGB'
import _suffle from 'lodash/shuffle'

interface Node extends PIXI.Sprite {
  tintRadian: number
  goalX: number
  goalY: number
  size: number
}

const config = {
  particles: 10000
}

const nodes: Node[] = []

const $appEle: HTMLCanvasElement = document.getElementById('app') as HTMLCanvasElement
const $btn: HTMLButtonElement = document.getElementById('fixText') as HTMLButtonElement
const $inputText: HTMLInputElement = document.getElementById('inputText') as HTMLInputElement

const app: PIXI.Application = new PIXI.Application({
  view: $appEle,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x171b23
})

const container: PIXI.particles.ParticleContainer = new PIXI.particles.ParticleContainer(config.particles, {
  position: true,
  tint: true,
  scale: true
})

container.blendMode = PIXI.BLEND_MODES.SOFT_LIGHT

$btn.addEventListener('click', (event: Event): void => {
  event.preventDefault()
  event.stopPropagation()

  const textVal: string = $inputText.value
  const positions: Position[] = _suffle(getTextPosition(textVal))

  if (!positions.length) {
    return
  }

  for (let i: number = 0; i < config.particles; i ++) {
    const node: Node = nodes[i]
    const position = positions[i % positions.length]

    node.goalX = position.x
    node.goalY = position.y
    node.size = 5
  }
}, false)

app.stage.addChild(container)

PIXI.loader
  .add('orb', './img/orb.svg')
  .load((loader, resources): void => {
    createNodes(resources.orb.texture)
    app.ticker.add(update)
  })

function createNodes (texture: PIXI.BaseTexture): void {
  const r: number = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight)

  for (let i: number = 0; i < config.particles; i ++) {
    const node: Node = PIXI.Sprite.from(texture) as Node
    const radian: number = (Math.random() * 360) * (Math.PI / 180)

    node.anchor.set(0.5, 0.5)

    node.x = r * Math.cos(radian) + (window.innerWidth / 2)
    node.y = r * Math.sin(radian) + (window.innerHeight / 2)
    node.alpha = 0.7
    node.size = 50
    node.width = node.height = node.size
    node.tintRadian = 0
    node.tint = HSV2RGB(node.tintRadian, 0.8, 0.6)

    node.goalX = node.x
    node.goalY = node.y

    nodes.push(node)
    container.addChild(node)
  }
}

function update (): void {
  for (let i: number = 0; i < config.particles; i ++) {
    const node: Node = nodes[i]

    node.x += (node.goalX - node.x) / 20
    node.y += (node.goalY - node.y) / 20
    node.tintRadian += 0.5
    node.tint = HSV2RGB(node.tintRadian % 360, 0.8, 0.6)

    node.width += (node.size - node.width) / 20
    node.height += (node.size - node.height) / 20
  }
}
