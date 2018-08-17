import _debounce from 'lodash/debounce'
import EventEmitter, { EventName } from './EventEmitter'

const resizeHandler: EventListener = _debounce((event: Event): void => {
  EventEmitter.emit(EventName.ON_WIN_RESIZE, window.innerWidth, window.innerHeight)
}, 300)

window.addEventListener('resize', resizeHandler, false)
