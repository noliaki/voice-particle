export default function (h: number, s: number, v: number): number {
  const c: number = v * s
  const hi: number = h / 60
  const x: number = c * (1 - Math.abs(hi % 2 - 1))

  let R: number
  let G: number
  let B: number

  if (0 <= hi && hi < 1) { [R, G, B] = [c, x, 0] }
  if (1 <= hi && hi < 2) { [R, G, B] = [x, c, 0] }
  if (2 <= hi && hi < 3) { [R, G, B] = [0, c, x] }
  if (3 <= hi && hi < 4) { [R, G, B] = [0, x, c] }
  if (4 <= hi && hi < 5) { [R, G, B] = [x, 0, c] }
  if (5 <= hi && hi < 6) { [R, G, B] = [c, 0, x] }

  const m: number = v - c

  R += m
  G += m
  B += m

  R = Math.floor(R * 255)
  G = Math.floor(G * 255)
  B = Math.floor(B * 255)

  return Number(`0x${padStart(R.toString(16), 2, 0)}${padStart(G.toString(16), 2, 0)}${padStart(B.toString(16), 2, 0)}`)
}

function padStart (s: string | number, len: number, padString: string | number = ' '): string {
  return (new Array(len).fill(padString).join('') + s).slice(-len)
}
