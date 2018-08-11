const canvas: HTMLCanvasElement = document.createElement('canvas')
const context: CanvasRenderingContext2D = canvas.getContext('2d')

export interface Position {
  x: number
  y: number
}

export default (text: string): Position[] => {
  const canvasWidth: number = window.innerWidth
  const canvasHeight: number = canvasWidth

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  const fontSize: number = 80 / text.length

  context.textBaseline = 'top'
  context.font = `${fontSize}vw "Sawarabi Mincho", helvetica, sans-serif`
  const measure: TextMetrics = context.measureText(text)
  context.fillText(text, (window.innerWidth - measure.width) / 2, 0)

  const positions: Position[] = []
  const imageData: Uint8ClampedArray = context.getImageData(0, 0, canvasWidth, canvasHeight).data

  let fontTop: number | null = null
  let fontBottom: number = 0

  for (let i: number = 0, len = imageData.length; i < len; i += (4 * 5)) {
    if (imageData[i + 3] === 255) {
      const x: number = (i / 4) % canvasWidth
      const y: number = Math.floor((i / 4) / canvasWidth)

      if (fontTop === null) {
        fontTop = y
      }
      fontBottom = Math.max(fontBottom, y)

      positions.push({ x, y })
    }
  }

  const fontHeight: number = fontBottom - (fontTop || 0)
  const offsetY: number = (window.innerHeight - fontHeight) / 2

  return positions.map((position: Position): Position => {
    return {
      x: position.x,
      y: position.y + offsetY - fontTop
    }
  })
}
