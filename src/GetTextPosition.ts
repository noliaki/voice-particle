const canvas: HTMLCanvasElement = document.createElement('canvas')
const context: CanvasRenderingContext2D = canvas.getContext('2d')

export interface Position {
  x: number
  y: number
}

export default (text: string): Position[] => {
  const canvasWidth: number = window.innerWidth
  const canvasHeight: number = window.innerHeight

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  context.textBaseline = 'top'
  context.font = `${80 / text.length}vw sans-serif`
  const measure: TextMetrics = context.measureText(text)
  context.fillText(text, (window.innerWidth - measure.width) / 2, 0)

  const positions: Position[] = []
  const imageData: Uint8ClampedArray = context.getImageData(0, 0, canvasWidth, canvasHeight).data

  for (let i: number = 0, len = imageData.length; i < len; i += (4 * 5)) {
    if (imageData[i + 3] === 255) {
      positions.push({
        x: (i / 4) % canvasWidth,
        y: Math.floor((i / 4) / canvasWidth)
      })
    }
  }

  return positions
}