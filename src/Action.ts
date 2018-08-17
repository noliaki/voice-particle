import _suffle from 'lodash/shuffle'
import getTextPosition from './GetTextPosition'
import EventEmitter, { EventName } from './EventEmitter'

const $btn: HTMLButtonElement = document.getElementById('fixText') as HTMLButtonElement
const $inputText: HTMLInputElement = document.getElementById('inputText') as HTMLInputElement

$btn.addEventListener('click', (event: MouseEvent): void => {
  event.preventDefault()
  event.stopPropagation()

  const textVal: string = $inputText.value

  EventEmitter.emit(EventName.ON_INPUT_TEXT, _suffle(getTextPosition(textVal)))

}, false)
