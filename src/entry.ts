import * as PIXI from 'pixi.js'
import getTextPosition, { Position } from './GetTextPosition'
import HSV2RGB from './HSV2RGB'
import { easeOutCubic } from './Ease'
import _suffle from 'lodash/shuffle'

interface Node extends PIXI.Sprite {
  tintRadian: number
  goalX: number
  goalY: number
  size: number
  time: number
  duration: number
  beginX: number
  beginY: number
  beginSize: number
  goalSize: number
  isGather: boolean
  staggerR: number
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

    node.beginX = node.x
    node.beginY = node.y

    node.beginSize = node.size
    node.goalSize = Math.random() * 5 + 5

    node.time = 0
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

    node.alpha = 0.7
    node.size = node.beginSize = node.goalSize = 50
    node.x = node.beginX = node.goalX = (r + node.size) * Math.cos(radian) + (window.innerWidth / 2)
    node.y = node.beginY = node.goalY = (r + node.size) * Math.sin(radian) + (window.innerHeight / 2)
    node.width = node.height = node.size
    node.tintRadian = 0
    node.tint = HSV2RGB(node.tintRadian, 0.8, 0.6)
    node.staggerR = Math.random() * 50
    node.time = 0
    node.duration = Math.random() * 3 + 3

    nodes.push(node)
    container.addChild(node)
  }
}

function update (): void {
  const len: number = config.particles

  for (let i: number = 0; i < len; i ++) {
    const node: Node = nodes[i]
    node.tintRadian += 0.4
    node.tint = HSV2RGB(node.tintRadian % 360, 0.8, 0.6)

    const d: number = easeOutCubic(node.time / node.duration)

    node.x = node.beginX + d * (node.goalX - node.beginX) + node.staggerR * Math.cos(Math.PI / 180 * node.tintRadian)
    node.y = node.beginY + d * (node.goalY - node.beginY) + node.staggerR * Math.sin(Math.PI / 180 * node.tintRadian)
    node.size = node.beginSize + d * (node.goalSize - node.beginSize)

    node.width = node.height = node.size

    node.time += 0.1

    if (node.time >= node.duration) {
      node.time = node.duration
    }
  }
}
