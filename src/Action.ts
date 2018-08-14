import _suffle from 'lodash/shuffle'
import getTextPosition, { Position } from './GetTextPosition'
import EventEmitter, { EventName } from './EventEmitter'

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

const $btn: HTMLButtonElement = document.getElementById('fixText') as HTMLButtonElement
const $speechBtn: HTMLButtonElement = document.getElementById('speech') as HTMLButtonElement
const $inputText: HTMLInputElement = document.getElementById('inputText') as HTMLInputElement

const recognition = new SpeechRecognition()
recognition.lang = 'ja'

recognition.addEventListener('result', onResult, false)
// recognition.addEventListener('end', this.onEnd, false)
// recognition.addEventListener('start', this.onStart, false)
// recognition.addEventListener('error', this.onError, false)

$btn.addEventListener('click', (event: Event): void => {
  event.preventDefault()
  event.stopPropagation()

  const textVal: string = $inputText.value
  const positions: Position[] = _suffle(getTextPosition(textVal))

  EventEmitter.emit(EventName.ON_INPUT_TEXT, positions)

}, false)

$speechBtn.addEventListener('click', (event: MouseEvent): void => {
  recognition.start()
})

document.addEventListener('mousewheel', (event: MouseEvent): void => {
  EventEmitter.emit(EventName.ON_MOUSE_WHEEL)
})

function onResult (event: Event): void {
  const text: string = (event as any).results[0][0].transcript
  EventEmitter.emit(EventName.ON_INPUT_TEXT, _suffle(getTextPosition(text)))
}
