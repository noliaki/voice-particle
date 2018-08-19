import * as PIXI from 'pixi.js'
import noise from 'simplenoise'
import HSV2RGB from './HSV2RGB'
import { easeOutCubic, easeInOutCubic } from './Ease'
import EventEmitter, { EventName } from './EventEmitter'
import { Position } from './GetTextPosition'
import './Action'
import './SpeechRecognition'
import './window'
import { startConnect, getByteFrequencyDataAverage } from './AudioContext'

let sizeW: number = window.innerWidth
let sizeH: number = window.innerHeight

interface Node extends PIXI.Sprite {
  tintRadian: number
  s: number
  v: number
  dx: number
  dy: number
  goalDx: number
  goalDy: number
  goalS: number
  goalV: number
  goalX: number
  goalY: number
  size: number
  positionTime: number
  positionDelay: number
  sizeTime: number
  sizeDuration: number
  positionDuration: number
  beginX: number
  beginY: number
  beginSize: number
  goalSize: number
  isGather: boolean
  staggerRx: number
  staggerRy: number
  staggerSpeed: number
  positionEase: Function
  sizeEase: Function
  isFrashing: boolean
  accelable: boolean
}

const particlesLen: number = 8000
let flushTimer: number

const nodes: Node[] = []

const $appEle: HTMLCanvasElement = document.getElementById('app') as HTMLCanvasElement

const app: PIXI.Application = new PIXI.Application({
  view: $appEle,
  width: sizeW,
  height: sizeH,
  backgroundColor: 0x171b23
})

const container: PIXI.particles.ParticleContainer = new PIXI.particles.ParticleContainer(particlesLen, {
  position: true,
  tint: true,
  scale: true
})

container.blendMode = PIXI.BLEND_MODES.SOFT_LIGHT

app.stage.addChild(container)

PIXI.loader
  .add('orb', './img/orb.svg')
  .load(async (loader, resources): Promise<void> => {
    createNodes(resources.orb.texture)
    await startConnect()
    app.ticker.add(update)
  })

EventEmitter.on(EventName.ON_INPUT_TEXT, (positions: Position[]): void => {
  setTextPosition(positions)
})

EventEmitter.on(EventName.ON_WIN_RESIZE, (winWidth: number, winHeight: number): void => {
  sizeW = winWidth
  sizeH = winHeight

  app.renderer.resize(winWidth, winHeight)
})

function createNodes (texture: PIXI.BaseTexture): void {

  for (let i: number = 0; i < particlesLen; i ++) {
    const node: Node = PIXI.Sprite.from(texture) as Node
    node.anchor.set(0.5, 0.5)
    node.alpha = 0.7
    node.size = node.beginSize = node.goalSize = 0
    node.x = node.beginX = node.goalX = Math.random() * sizeW
    node.y = node.beginY = node.goalY = Math.random() * sizeH
    node.dx = node.dy = node.goalDx = node.goalDy = 0
    node.width = node.height = node.size
    node.tintRadian = 0
    node.s = node.goalS = 0.8
    node.v = node.goalV = 0.8
    node.tint = HSV2RGB(node.tintRadian, node.s, node.v)
    node.staggerRx = Math.random() * 10
    node.staggerRy = Math.random() * 10
    node.staggerSpeed = Math.random() * 10 + 2
    node.positionDelay = Math.random() * 3
    node.positionTime = node.sizeTime = node.positionDuration = node.sizeDuration = Math.random() * 3 + 3
    node.positionEase = easeOutCubic
    node.sizeEase = easeOutCubic

    nodes.push(node)
    container.addChild(node)
  }
}

function update (): void {
  const len: number = particlesLen
  const now: number = Date.now() / 500
  const audioVol: number = getByteFrequencyDataAverage()
  const parlinNoise: Function = noise.perlin2

  for (let i: number = 0; i < len; i ++) {
    const node: Node = nodes[i]
    const positionTime: number = node.positionTime < 0 ? 0 : node.positionTime
    const sizeTime: number = node.sizeTime < 0 ? 0 : node.sizeTime

    if (Math.random() > 0.99999) {
      node.beginSize = Math.random() * 10 + 10
      node.sizeTime = 0

      node.s = 0
      node.v = 1

      node.isFrashing = true

      container.addChild(node)
    }

    if (audioVol && Math.random() > 0.99) {
      node.beginSize = audioVol
      node.sizeTime = 0

      node.isFrashing = true
    }

    const sizeD: number = node.sizeEase(sizeTime / node.sizeDuration)
    node.size = node.beginSize + sizeD * (node.goalSize - node.beginSize)

    const ratio: number = now / (i + 2)
    const noiseX: number = node.staggerRx * parlinNoise(ratio, now)
    const noiseY: number = node.staggerRy * parlinNoise(now, ratio)
    const noiseScale: number = node.isFrashing ? 0 : 10 * parlinNoise(i / now, now)
    const nodeSize: number = node.size + noiseScale

    let nodeX: number = noiseX
    let nodeY: number = noiseY

    node.tintRadian = (node.tintRadian + 0.4) % 360

    node.positionTime += 0.1
    node.sizeTime += 0.1

    node.s += 0.03
    node.v -= 0.03

    if (node.accelable) {
      nodeX += node.x + node.dx
      nodeY += node.y + node.dy

      node.dx += (node.goalDx - node.dx) / 50
      node.dy += (node.goalDy - node.dy) / 50

      // if (nodeX + nodeSize < 0) {
      //   nodeX = sizeW + nodeSize
      // }

      // if (nodeX - nodeSize > sizeW) {
      //   nodeX = -nodeSize
      // }

      // if (nodeY + nodeSize < 0) {
      //   nodeY = sizeH + nodeSize
      // }

      // if (nodeY - nodeSize > sizeH) {
      //   nodeY = -nodeSize
      // }
    } else {
      const positionD: number = node.positionEase(positionTime / node.positionDuration)

      nodeX += node.beginX + positionD * (node.goalX - node.beginX)
      nodeY += node.beginY + positionD * (node.goalY - node.beginY)
    }

    if (node.s >= node.goalS) {
      node.s = node.goalS
    }

    if (node.v <= node.goalV) {
      node.v = node.goalV
    }

    if (node.positionTime >= node.positionDuration) {
      node.positionTime = node.positionDuration
    }

    if (node.sizeTime >= node.sizeDuration) {
      node.sizeTime = node.sizeDuration
      node.isFrashing = false
    }

    node.x = nodeX
    node.y = nodeY
    node.width = node.height = nodeSize
    node.tint = HSV2RGB(node.tintRadian, node.s, node.v)
  }
}

function setTextPosition (positions: Position[]): void {
  const positionsLen: number = positions.length

  if (!positionsLen) return

  const nodeSize: number = Math.min(5, positionsLen / 5000)

  console.log(nodeSize)

  for (let i: number = 0; i < particlesLen; i ++) {
    const node: Node = nodes[i]
    const position = positions[i % positionsLen]

    node.dx = node.goalDx = node.dy = node.goalDy = 0

    node.goalX = position.x
    node.goalY = position.y

    node.beginX = node.x
    node.beginY = node.y

    node.beginSize = Math.random() * 20 + 10
    node.goalSize = Math.random() * 3 + 3

    node.positionTime = -node.positionDelay
    node.sizeTime = 0
    node.sizeDuration = Math.random() * 3 + 3

    node.positionDuration = Math.random() * 5 + 3
    node.positionEase = easeInOutCubic

    node.accelable = false
  }

  clearTimeout(flushTimer)
  flushTimer = setTimeout(flush, 3000)
}

function flush (): void {
  const winWidth: number = sizeW
  const winHeight: number = sizeH

  // const centerX: number = winWidth / 2
  // const centerY: number = winHeight / 2

  // const r: number = Math.sqrt(winWidth * winWidth + winHeight * winHeight)
  // const radius: number = Math.PI / 180

  for (let i: number = 0; i < particlesLen; i ++) {
    const node: Node = nodes[i]
    // const radian: number = (Math.random() * 360) * radius

    // node.beginX = node.x
    // node.beginY = node.y
    // node.goalX = r * Math.cos(radian) * Math.random() + centerX
    // node.goalY = r * Math.sin(radian) * Math.random() + centerY

    node.beginSize = Math.random() * 10 + 10
    // node.positionDuration = Math.random() * 7 + 7

    // node.positionTime = 0
    node.sizeTime = 0
    node.sizeDuration = Math.random() * 5 + 5
    node.goalSize = 0

    // node.positionEase = easeOutCubic

    node.dx = Math.random() * -40 + 20
    node.dy = Math.random() * -40 + 20
    node.accelable = true
  }
}

// function flashAll (): void {
//   for (let i: number = 0; i < particlesLen; i ++) {
//     const node: Node = nodes[i]

//     node.dx = node.dx === 0 ? Math.random() * -20 + 10 : node.dx * 1.5
//     node.dy = node.dy === 0 ? Math.random() * -20 + 10 : node.dy * 1.5

//     node.sizeTime = 0

//     node.beginSize = Math.min(node.size * 5, 50)

//     // node.goalSize = node.size
//     // node.beginSize = node.size = Math.min(node.size * 5, 50)

//     // node.sizeTime = 0
//     node.sizeEase = easeOutCubic

//     // node.isFrashing = true
//   }
// }
