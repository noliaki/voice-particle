export default class EventEmitter {
  private static handler: {[key: string]: Function[]} = Object.create(null)

  public static on (name: string, fn: Function): void {
    if (typeof this.handler[name] === 'undefined') {
      this.handler[name] = []
    }

    this.handler[name].push(fn)
  }

  public static emit (name: string, ...data): void {
    if (!this.handler[name]) return

    const len: number = this.handler[name].length

    for (let i: number = 0; i < len; i++) {
      this.handler[name][i](...data)
    }
  }
}

export class EventName {
  public static ON_WIN_RESIZE = 'onWinReisze'
  public static ON_WIN_LOAD = 'onWinLoad'
  public static ON_INPUT_TEXT = 'onInputText'
}
